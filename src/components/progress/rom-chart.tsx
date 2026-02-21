'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import { useROMHistory } from '@/hooks/use-rom'
import { getWeeksSinceSurgery, patient } from '@/data/patient'
import { phases } from '@/data/phases'
import {
  optimisticCurve,
  averageCurve,
  conservativeCurve,
} from './scenario-curves'

// ──────────────────────────────────────────────
// useChartColors — reads CSS vars for Recharts
// ──────────────────────────────────────────────

interface ChartColors {
  primary: string
  secondary: string
  accent: string
  text: string
  textSecondary: string
  textMuted: string
  border: string
  surface: string
  bg: string
  success: string
  error: string
  info: string
}

const defaultLightColors: ChartColors = {
  primary: '#5B8A72',
  secondary: '#C4785B',
  accent: '#D4A76A',
  text: '#2D2A26',
  textSecondary: '#6B6560',
  textMuted: '#9C9690',
  border: '#E5E0D8',
  surface: '#FFFFFF',
  bg: '#FAFAF7',
  success: '#5B8A72',
  error: '#C25B4E',
  info: '#6B8FAD',
}

function readColorsFromDOM(): ChartColors {
  const style = getComputedStyle(document.documentElement)
  const get = (v: string, fallback: string) =>
    style.getPropertyValue(v).trim() || fallback

  return {
    primary: get('--color-primary', defaultLightColors.primary),
    secondary: get('--color-secondary', defaultLightColors.secondary),
    accent: get('--color-accent', defaultLightColors.accent),
    text: get('--color-text', defaultLightColors.text),
    textSecondary: get('--color-text-secondary', defaultLightColors.textSecondary),
    textMuted: get('--color-text-muted', defaultLightColors.textMuted),
    border: get('--color-border', defaultLightColors.border),
    surface: get('--color-surface', defaultLightColors.surface),
    bg: get('--color-bg', defaultLightColors.bg),
    success: get('--color-success', defaultLightColors.success),
    error: get('--color-error', defaultLightColors.error),
    info: get('--color-info', defaultLightColors.info),
  }
}

function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(defaultLightColors)

  useEffect(() => {
    // Initial read
    setColors(readColorsFromDOM())

    // Watch for dark mode class changes on <html>
    const observer = new MutationObserver(() => {
      setColors(readColorsFromDOM())
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return colors
}

// ──────────────────────────────────────────────
// Custom tooltip
// ──────────────────────────────────────────────

interface TooltipPayloadItem {
  dataKey: string
  value: number
  color: string
  payload: ChartDataPoint
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  colors: ChartColors
}

function CustomTooltip({ active, payload, colors }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload
  const actualEntry = payload.find((p) => p.dataKey === 'actual')

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        minWidth: '160px',
      }}
    >
      <p
        style={{
          fontWeight: 600,
          fontSize: '13px',
          color: colors.text,
          marginBottom: '6px',
        }}
      >
        Неделя {data.week}
      </p>

      {actualEntry && data.date && (
        <>
          <p style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px' }}>
            {formatDate(data.date)}
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: colors.text,
              marginBottom: '4px',
            }}
          >
            <span>Дуга:</span>
            <span style={{ fontWeight: 700, color: colors.primary }}>{data.actual}°</span>
          </div>
          {data.flexion != null && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: colors.textSecondary,
                marginBottom: '2px',
              }}
            >
              <span>Сгибание:</span>
              <span>{data.flexion}°</span>
            </div>
          )}
          {data.extensionDeficit != null && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: colors.textSecondary,
              }}
            >
              <span>Дефицит разг.:</span>
              <span>{data.extensionDeficit}°</span>
            </div>
          )}
        </>
      )}

      {!actualEntry && (
        <div style={{ fontSize: '12px', color: colors.textSecondary }}>
          {data.optimistic != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Оптимистичный:</span>
              <span>{data.optimistic}°</span>
            </div>
          )}
          {data.average != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Средний:</span>
              <span>{data.average}°</span>
            </div>
          )}
          {data.conservative != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Консервативный:</span>
              <span>{data.conservative}°</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ──────────────────────────────────────────────
// Chart data merging
// ──────────────────────────────────────────────

interface ChartDataPoint {
  week: number
  optimistic?: number
  average?: number
  conservative?: number
  actual?: number
  date?: string
  flexion?: number
  extensionDeficit?: number
}

function buildChartData(
  measurements: { date: string; arc: number; flexion: number; extensionDeficit: number }[],
  currentWeek: number,
): ChartDataPoint[] {
  const maxWeek = Math.max(52, currentWeek + 4)
  const weekMap = new Map<number, ChartDataPoint>()

  // Initialize all weeks from scenario curves
  for (const p of optimisticCurve) {
    if (p.week <= maxWeek) {
      weekMap.set(p.week, { ...weekMap.get(p.week), week: p.week, optimistic: p.arc })
    }
  }
  for (const p of averageCurve) {
    if (p.week <= maxWeek) {
      weekMap.set(p.week, { ...weekMap.get(p.week), week: p.week, average: p.arc })
    }
  }
  for (const p of conservativeCurve) {
    if (p.week <= maxWeek) {
      weekMap.set(p.week, { ...weekMap.get(p.week), week: p.week, conservative: p.arc })
    }
  }

  // Map actual measurements to weeks
  const surgeryDate = new Date(patient.surgeryDate + 'T00:00:00')

  for (const m of measurements) {
    const mDate = new Date(m.date + 'T00:00:00')
    const daysSince = Math.floor(
      (mDate.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24),
    )
    const week = Math.round(daysSince / 7)
    const clampedWeek = Math.max(0, Math.min(week, maxWeek))

    const existing = weekMap.get(clampedWeek)
    // If multiple measurements in same week, keep the latest
    weekMap.set(clampedWeek, {
      ...existing,
      week: clampedWeek,
      actual: m.arc,
      date: m.date,
      flexion: m.flexion,
      extensionDeficit: m.extensionDeficit,
    })
  }

  return Array.from(weekMap.values()).sort((a, b) => a.week - b.week)
}

// ──────────────────────────────────────────────
// Phase boundaries for vertical reference lines
// ──────────────────────────────────────────────

const phaseBoundaries = phases
  .filter((p) => p.number > 1)
  .map((p) => ({
    week: p.startWeek,
    label: `Ф${p.number}`,
  }))

// ──────────────────────────────────────────────
// ROMChart component
// ──────────────────────────────────────────────

export function ROMChart() {
  const { measurements, isLoading } = useROMHistory()
  const colors = useChartColors()
  const currentWeek = getWeeksSinceSurgery()

  const chartData = useMemo(
    () => buildChartData(measurements, currentWeek),
    [measurements, currentWeek],
  )

  const hasData = measurements.length > 0

  if (isLoading) {
    return (
      <div
        style={{
          height: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
          fontSize: '14px',
        }}
      >
        Загрузка...
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        padding: '16px 8px 8px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Empty state overlay */}
      {!hasData && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            textAlign: 'center',
            padding: '16px 24px',
            backgroundColor: `${colors.surface}ee`,
            borderRadius: '12px',
            border: `1px dashed ${colors.border}`,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 600,
              color: colors.text,
              marginBottom: '4px',
            }}
          >
            Добавьте первый замер
          </p>
          <p style={{ fontSize: '13px', color: colors.textMuted }}>
            Пунктирные линии — сценарии восстановления
          </p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.border}
            strokeOpacity={0.5}
            vertical={false}
          />

          <XAxis
            dataKey="week"
            type="number"
            domain={[0, Math.max(52, currentWeek + 4)]}
            tickCount={7}
            tick={{ fontSize: 11, fill: colors.textMuted }}
            axisLine={{ stroke: colors.border }}
            tickLine={{ stroke: colors.border }}
            label={{
              value: 'нед.',
              position: 'insideBottomRight',
              offset: -4,
              style: { fontSize: 10, fill: colors.textMuted },
            }}
          />

          <YAxis
            domain={[0, 150]}
            tickCount={7}
            tick={{ fontSize: 11, fill: colors.textMuted }}
            axisLine={{ stroke: colors.border }}
            tickLine={{ stroke: colors.border }}
            label={{
              value: '°',
              position: 'insideTopLeft',
              offset: 8,
              style: { fontSize: 12, fill: colors.textMuted },
            }}
          />

          <Tooltip
            content={<CustomTooltip colors={colors} />}
            cursor={{ stroke: colors.border, strokeDasharray: '3 3' }}
          />

          {/* Scenario area fill: optimistic to conservative band */}
          <Area
            dataKey="optimistic"
            type="monotone"
            stroke="none"
            fill={colors.success}
            fillOpacity={0.04}
            isAnimationActive={false}
            dot={false}
            activeDot={false}
            connectNulls
          />

          {/* Scenario curves */}
          <Line
            dataKey="optimistic"
            type="monotone"
            stroke={colors.success}
            strokeWidth={1.5}
            strokeDasharray="6 3"
            strokeOpacity={0.35}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            connectNulls
            name="Оптимистичный"
          />

          <Line
            dataKey="average"
            type="monotone"
            stroke={colors.textMuted}
            strokeWidth={1.5}
            strokeDasharray="6 3"
            strokeOpacity={0.4}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            connectNulls
            name="Средний"
          />

          <Line
            dataKey="conservative"
            type="monotone"
            stroke={colors.error}
            strokeWidth={1.5}
            strokeDasharray="6 3"
            strokeOpacity={0.3}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            connectNulls
            name="Консервативный"
          />

          {/* Phase boundary lines */}
          {phaseBoundaries.map((pb) => (
            <ReferenceLine
              key={pb.week}
              x={pb.week}
              stroke={colors.border}
              strokeDasharray="2 4"
              strokeOpacity={0.6}
              label={{
                value: pb.label,
                position: 'insideTopRight',
                style: { fontSize: 10, fill: colors.textMuted },
              }}
            />
          ))}

          {/* Current week line */}
          <ReferenceLine
            x={currentWeek}
            stroke={colors.accent}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            label={{
              value: 'Сейчас',
              position: 'insideTopRight',
              style: { fontSize: 10, fill: colors.accent, fontWeight: 600 },
            }}
          />

          {/* Actual measurements — main line */}
          {hasData && (
            <Line
              dataKey="actual"
              type="monotone"
              stroke={colors.primary}
              strokeWidth={2.5}
              dot={{
                fill: colors.primary,
                stroke: colors.surface,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: colors.primary,
                stroke: colors.surface,
                strokeWidth: 2,
                r: 6,
              }}
              isAnimationActive
              animationDuration={600}
              connectNulls
              name="Ваш результат"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          padding: '8px 16px 4px',
          fontSize: '11px',
          color: colors.textMuted,
        }}
      >
        {hasData && (
          <LegendItem color={colors.primary} label="Ваш результат" solid />
        )}
        <LegendItem color={colors.success} label="Оптимистичный" />
        <LegendItem color={colors.textMuted} label="Средний" />
        <LegendItem color={colors.error} label="Консервативный" />
      </div>
    </div>
  )
}

function LegendItem({
  color,
  label,
  solid = false,
}: {
  color: string
  label: string
  solid?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div
        style={{
          width: '16px',
          height: '2px',
          backgroundColor: color,
          borderRadius: '1px',
          opacity: solid ? 1 : 0.5,
          ...(solid ? {} : { backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)`, backgroundColor: 'transparent' }),
        }}
      />
      <span>{label}</span>
    </div>
  )
}
