'use client'

import { useEffect, useRef } from 'react'
import { getDaysSinceSurgery, getWeeksSinceSurgery, getCurrentPhase } from '@/data/patient'
import { phases } from '@/data/phases'
import { useStreak } from '@/hooks/use-streak'
import { useAppStore } from '@/stores/app-store'
import { Fire, Snowflake } from '@phosphor-icons/react'

export function DayCounter() {
  const days = getDaysSinceSurgery()
  const weeks = getWeeksSinceSurgery()
  const phaseNum = getCurrentPhase()
  const phase = phases.find(p => p.number === phaseNum)
  const { streak, totalSessions, frozenYesterday } = useStreak()
  const { streakFreezes, useStreakFreeze } = useAppStore()

  // Auto-consume streak freeze on broken day
  const freezeUsed = useRef(false)
  useEffect(() => {
    if (frozenYesterday && streakFreezes > 0 && !freezeUsed.current) {
      freezeUsed.current = true
      useStreakFreeze()
    }
  }, [frozenYesterday, streakFreezes, useStreakFreeze])

  const isFrozen = frozenYesterday && freezeUsed.current
  const displayStreak = isFrozen ? streak + 1 : streak

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
          backgroundColor: isFrozen
            ? 'color-mix(in srgb, var(--color-info) 12%, transparent)'
            : displayStreak > 0
              ? 'color-mix(in srgb, var(--color-warning) 12%, transparent)'
              : 'var(--color-surface-alt)',
          border: `1px solid ${
            isFrozen
              ? 'color-mix(in srgb, var(--color-info) 30%, transparent)'
              : displayStreak > 0
                ? 'color-mix(in srgb, var(--color-warning) 30%, transparent)'
                : 'var(--color-border)'
          }`,
          minWidth: 64,
          gap: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {isFrozen ? (
              <Snowflake size={18} weight="fill" style={{ color: 'var(--color-info)' }} />
            ) : (
              <Fire
                size={18}
                weight="fill"
                style={{ color: displayStreak > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}
              />
            )}
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: isFrozen
                ? 'var(--color-info)'
                : displayStreak > 0
                  ? 'var(--color-warning)'
                  : 'var(--color-text-muted)',
              lineHeight: 1,
            }}>
              {displayStreak}
            </span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
            {displayStreak === 1 ? 'день' : displayStreak >= 2 && displayStreak <= 4 ? 'дня' : 'дней'}
            {'\n'}подряд
          </span>
          {isFrozen && (
            <span style={{ fontSize: 9, color: 'var(--color-info)', fontWeight: 500 }}>
              заморожен
            </span>
          )}
          {!isFrozen && streakFreezes > 0 && (
            <span style={{ fontSize: 9, color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Snowflake size={10} weight="fill" /> x{streakFreezes}
            </span>
          )}
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
