'use client'

import { useRecoveryForecast } from '@/hooks/use-recovery-forecast'
import { Rocket, TrendUp, Target, WarningCircle } from '@phosphor-icons/react'
import { getWeeksSinceSurgery } from '@/data/patient'

export function RecoveryForecast() {
  const forecast = useRecoveryForecast()
  const weeks = getWeeksSinceSurgery()

  if (forecast.currentArc === null) return null

  const trajectoryConfig = {
    ahead: { color: 'var(--color-success)', label: 'Опережаете график', icon: Rocket },
    on_track: { color: 'var(--color-primary)', label: 'По плану', icon: Target },
    behind: { color: 'var(--color-warning)', label: 'Немного отстаёте', icon: WarningCircle },
    unknown: { color: 'var(--color-text-muted)', label: 'Нет данных', icon: Target },
  }

  const config = trajectoryConfig[forecast.trajectory]
  const Icon = config.icon

  // Progress bar: current arc / 130 (functional norm)
  const progress = Math.min((forecast.currentArc / 130) * 100, 100)

  return (
    <div style={{
      padding: 16,
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      marginTop: 12,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendUp size={16} weight="duotone" style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Прогноз восстановления
          </span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: 'var(--radius-full)',
          backgroundColor: `color-mix(in srgb, ${config.color} 12%, transparent)`,
        }}>
          <Icon size={12} weight="bold" style={{ color: config.color }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: config.color }}>{config.label}</span>
        </div>
      </div>

      {/* Progress bar to 130° */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Текущая дуга</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text)' }}>{forecast.currentArc}° / 130°</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, backgroundColor: 'var(--color-surface-alt)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            backgroundColor: config.color,
            width: `${progress}%`,
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
            {forecast.weeklyGain > 0 ? `+${forecast.weeklyGain}` : '—'}
          </span>
          <p style={{ fontSize: 9, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>°/неделю</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
            {forecast.projectedArc !== null ? `${forecast.projectedArc}°` : '—'}
          </span>
          <p style={{ fontSize: 9, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>через 4 нед.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-info)', fontFamily: 'var(--font-display)' }}>
            {forecast.weeksToFunctional !== null
              ? forecast.weeksToFunctional === 0 ? '✓' : `${forecast.weeksToFunctional}нед`
              : '—'}
          </span>
          <p style={{ fontSize: 9, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>до 100°</p>
        </div>
      </div>

      {/* Phase target */}
      <div style={{
        marginTop: 12,
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface-alt)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Цель фазы (нед. {weeks})</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>
          {forecast.phaseTarget.min}–{forecast.phaseTarget.max}°
        </span>
      </div>
    </div>
  )
}
