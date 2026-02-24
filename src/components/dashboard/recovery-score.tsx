'use client'

import { useRecoveryScore } from '@/hooks/use-recovery-score'

const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--color-success)'
  if (score >= 50) return 'var(--color-warning)'
  return 'var(--color-error)'
}

function scoreLabel(score: number): string {
  if (score >= 90) return 'Отлично!'
  if (score >= 70) return 'Хорошо'
  if (score >= 50) return 'Нормально'
  if (score >= 30) return 'Можно лучше'
  return 'Начни день'
}

interface ChipProps {
  label: string
  value: number
  max: number
  color: string
}

function Chip({ label, value, max, color }: ChipProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      backgroundColor: 'var(--color-surface-alt)',
      fontSize: 'var(--text-xs)',
    }}>
      <span style={{
        width: 8, height: 8,
        borderRadius: '50%',
        backgroundColor: value > 0 ? color : 'var(--color-border)',
        flexShrink: 0,
      }} />
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: 'var(--color-text)', marginLeft: 'auto' }}>
        {value}/{max}
      </span>
    </div>
  )
}

export function RecoveryScoreCard() {
  const score = useRecoveryScore()

  if (score.isLoading) return null

  const color = scoreColor(score.total)
  const offset = CIRCUMFERENCE - (score.total / 100) * CIRCUMFERENCE

  return (
    <div style={{
      padding: '20px',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-surface)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
    }}>
      {/* Score ring */}
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <svg width={120} height={120} viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease',
            }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 700,
            color,
            lineHeight: 1,
          }}>
            {score.total}
          </span>
          <span style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 2,
          }}>
            из 100
          </span>
        </div>
      </div>

      {/* Label */}
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-lg)',
        fontWeight: 600,
        color: 'var(--color-text)',
      }}>
        {scoreLabel(score.total)}
      </span>

      {/* Breakdown chips */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'center',
        width: '100%',
      }}>
        <Chip label="Сессии" value={score.sessions} max={30} color="var(--color-primary)" />
        <Chip label="Добавки" value={score.supplements} max={20} color="var(--color-accent)" />
        <Chip label="Сон" value={score.sleep} max={20} color="var(--color-info)" />
        <Chip label="Боль" value={score.pain} max={15} color="var(--color-secondary)" />
        <Chip label="ROM" value={score.rom} max={15} color="var(--color-success)" />
      </div>
    </div>
  )
}
