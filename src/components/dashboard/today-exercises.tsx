'use client'

import { useTodayStats } from '@/hooks/use-exercise-stats'
import { getExercisesForPhase } from '@/data/exercises'
import { getCurrentPhase } from '@/data/patient'
import { Barbell, CheckCircle } from '@phosphor-icons/react'

export function TodayExercises() {
  const phase = getCurrentPhase()
  const totalInPhase = getExercisesForPhase(phase).length
  const { uniqueExercises, totalExercises, loading } = useTodayStats()

  if (loading) return null

  const allDone = uniqueExercises >= totalInPhase && totalInPhase > 0
  const hasProgress = totalExercises > 0

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: hasProgress ? 'var(--color-primary-light)' : 'var(--color-surface)',
        border: hasProgress
          ? '1px solid var(--color-primary)'
          : '1px solid var(--color-border)',
        marginTop: '12px',
      }}
    >
      {allDone ? (
        <CheckCircle size={28} weight="fill" style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
      ) : (
        <Barbell size={28} weight="duotone" style={{ color: hasProgress ? 'var(--color-primary)' : 'var(--color-text-muted)', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: hasProgress ? 'var(--color-primary)' : 'var(--color-text)',
            margin: 0,
          }}
        >
          {allDone ? 'Все упражнения выполнены' : 'Упражнения сегодня'}
        </p>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: hasProgress ? 'var(--color-primary)' : 'var(--color-text-muted)',
            margin: '2px 0 0 0',
            opacity: 0.85,
          }}
        >
          {uniqueExercises} из {totalInPhase} уникальных
          {totalExercises > uniqueExercises && ` (${totalExercises} выполнений)`}
        </p>
      </div>

      {/* Mini progress bar */}
      <div
        style={{
          width: '48px',
          height: '6px',
          borderRadius: '3px',
          backgroundColor: hasProgress ? 'rgba(255,255,255,0.5)' : 'var(--color-border)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: '3px',
            width: totalInPhase > 0 ? `${Math.min(100, (uniqueExercises / totalInPhase) * 100)}%` : '0%',
            backgroundColor: 'var(--color-primary)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}
