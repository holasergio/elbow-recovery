'use client'

import { useState, useEffect, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

// ──────────────────────────────────────────────
// useCalendarColors — reads CSS vars
// ──────────────────────────────────────────────

function useCalendarColors() {
  const [colors, setColors] = useState({
    primary: '#5B8A72',
    surfaceAlt: '#F5F2ED',
    text: '#2D2A26',
    textMuted: '#9C9690',
    border: '#E5E0D8',
    surface: '#FFFFFF',
  })

  useEffect(() => {
    function read() {
      const style = getComputedStyle(document.documentElement)
      const get = (v: string, fb: string) => style.getPropertyValue(v).trim() || fb
      setColors({
        primary: get('--color-primary', '#5B8A72'),
        surfaceAlt: get('--color-surface-alt', '#F5F2ED'),
        text: get('--color-text', '#2D2A26'),
        textMuted: get('--color-text-muted', '#9C9690'),
        border: get('--color-border', '#E5E0D8'),
        surface: get('--color-surface', '#FFFFFF'),
      })
    }

    read()

    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return colors
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const WEEKS_TO_SHOW = 12

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Returns Monday-based day index (0=Mon, 6=Sun) */
function getMondayIndex(d: Date): number {
  const jsDay = d.getDay() // 0=Sun, 1=Mon...
  return jsDay === 0 ? 6 : jsDay - 1
}

/** Get the Monday of the week for a given date */
function getMonday(d: Date): Date {
  const result = new Date(d)
  const idx = getMondayIndex(d)
  result.setDate(result.getDate() - idx)
  result.setHours(0, 0, 0, 0)
  return result
}

function getIntensityLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  return 3
}

// ──────────────────────────────────────────────
// StreakCalendar component
// ──────────────────────────────────────────────

export function StreakCalendar() {
  const colors = useCalendarColors()

  // Calculate the date range: 12 weeks back from this Monday
  const today = new Date()
  const thisMonday = getMonday(today)

  const startDate = useMemo(() => {
    const d = new Date(thisMonday)
    d.setDate(d.getDate() - (WEEKS_TO_SHOW - 1) * 7)
    return d
  }, [thisMonday.getTime()])

  const startStr = toDateStr(startDate)
  const endStr = toDateStr(today)

  // Query exercise sessions in the date range
  const sessions = useLiveQuery(
    () =>
      db.exerciseSessions
        .where('date')
        .between(startStr, endStr, true, true)
        .toArray(),
    [startStr, endStr],
  )

  // Build date -> count map
  const countMap = useMemo(() => {
    const map = new Map<string, number>()
    if (!sessions) return map
    for (const s of sessions) {
      map.set(s.date, (map.get(s.date) ?? 0) + 1)
    }
    return map
  }, [sessions])

  // Build grid: columns = weeks, rows = days (Mon-Sun)
  const grid = useMemo(() => {
    const weeks: { date: Date; dateStr: string; count: number }[][] = []

    for (let w = 0; w < WEEKS_TO_SHOW; w++) {
      const weekDays: { date: Date; dateStr: string; count: number }[] = []
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate)
        cellDate.setDate(cellDate.getDate() + w * 7 + d)
        const dateStr = toDateStr(cellDate)
        weekDays.push({
          date: cellDate,
          dateStr,
          count: countMap.get(dateStr) ?? 0,
        })
      }
      weeks.push(weekDays)
    }

    return weeks
  }, [startDate.getTime(), countMap])

  // Intensity colors (4 levels: 0, 1, 2, 3)
  const intensityColors = useMemo(() => {
    const base = colors.primary
    return [
      colors.surfaceAlt, // level 0: empty
      `${base}40`,       // level 1: light (25% opacity)
      `${base}80`,       // level 2: medium (50% opacity)
      base,              // level 3: full
    ]
  }, [colors.primary, colors.surfaceAlt])

  const cellSize = 14
  const cellGap = 3
  const labelWidth = 24

  // Month labels for the top
  const monthLabels = useMemo(() => {
    const labels: { text: string; weekIdx: number }[] = []
    let lastMonth = -1

    for (let w = 0; w < grid.length; w++) {
      // Use the Monday of each week
      const mondayOfWeek = grid[w][0].date
      const month = mondayOfWeek.getMonth()
      if (month !== lastMonth) {
        labels.push({
          text: mondayOfWeek.toLocaleDateString('ru-RU', { month: 'short' }),
          weekIdx: w,
        })
        lastMonth = month
      }
    }

    return labels
  }, [grid])

  const isFuture = (d: Date) => d > today

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Month labels row */}
      <div
        style={{
          display: 'flex',
          marginLeft: `${labelWidth}px`,
          marginBottom: '4px',
          fontSize: '10px',
          color: colors.textMuted,
        }}
      >
        {monthLabels.map((ml, i) => (
          <span
            key={i}
            style={{
              position: 'absolute' as const,
              marginLeft: `${ml.weekIdx * (cellSize + cellGap)}px`,
            }}
          >
            {ml.text}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', marginTop: '16px' }}>
        {/* Day labels column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${cellGap}px`,
            marginRight: '4px',
            flexShrink: 0,
            width: `${labelWidth}px`,
          }}
        >
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              style={{
                height: `${cellSize}px`,
                display: 'flex',
                alignItems: 'center',
                fontSize: '10px',
                color: colors.textMuted,
                lineHeight: 1,
              }}
            >
              {i % 2 === 0 ? label : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'flex',
            gap: `${cellGap}px`,
            overflow: 'hidden',
          }}
        >
          {grid.map((week, wIdx) => (
            <div
              key={wIdx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `${cellGap}px`,
              }}
            >
              {week.map((day, dIdx) => {
                const future = isFuture(day.date)
                const level = future ? 0 : getIntensityLevel(day.count)

                return (
                  <div
                    key={dIdx}
                    title={
                      future
                        ? ''
                        : `${day.dateStr}: ${day.count} ${day.count === 1 ? 'сессия' : day.count >= 2 && day.count <= 4 ? 'сессии' : 'сессий'}`
                    }
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      borderRadius: '3px',
                      backgroundColor: future
                        ? 'transparent'
                        : intensityColors[level],
                      border: future
                        ? `1px dashed ${colors.border}`
                        : level === 0
                          ? `1px solid ${colors.border}`
                          : 'none',
                      transition: 'background-color 0.2s',
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          justifyContent: 'flex-end',
          marginTop: '8px',
          fontSize: '10px',
          color: colors.textMuted,
        }}
      >
        <span>Мало</span>
        {intensityColors.map((c, i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              backgroundColor: c,
              border: i === 0 ? `1px solid ${colors.border}` : 'none',
            }}
          />
        ))}
        <span>Много</span>
      </div>
    </div>
  )
}
