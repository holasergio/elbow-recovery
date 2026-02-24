'use client'

import { getDaysSinceSurgery, getWeeksSinceSurgery, getCurrentPhase } from '@/data/patient'
import { phases } from '@/data/phases'
import { useStreak } from '@/hooks/use-streak'
import { Fire } from '@phosphor-icons/react'

export function DayCounter() {
  const days = getDaysSinceSurgery()
  const weeks = getWeeksSinceSurgery()
  const phaseNum = getCurrentPhase()
  const phase = phases.find(p => p.number === phaseNum)
  const { streak, totalSessions } = useStreak()

  return (
    <div className="py-6">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Неделя {weeks}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 600 }}>
            День {days}
          </h1>
          {phase && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              Фаза {phase.number}: {phase.name}
            </div>
          )}
        </div>

        {/* Streak counter */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 14px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: streak > 0 ? 'color-mix(in srgb, var(--color-warning) 12%, transparent)' : 'var(--color-surface-alt)',
          border: `1px solid ${streak > 0 ? 'color-mix(in srgb, var(--color-warning) 30%, transparent)' : 'var(--color-border)'}`,
          minWidth: 64,
          gap: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Fire
              size={18}
              weight="fill"
              style={{ color: streak > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}
            />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: streak > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)',
              lineHeight: 1,
            }}>
              {streak}
            </span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
            {streak === 1 ? 'день' : streak >= 2 && streak <= 4 ? 'дня' : 'дней'}
            {'\n'}подряд
          </span>
          {totalSessions > 0 && (
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {totalSessions} сессий
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
