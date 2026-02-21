'use client'

import Link from 'next/link'
import { Barbell, Timer, Repeat, Fire, ArrowRight } from '@phosphor-icons/react'
import { getCurrentPhase } from '@/data/patient'
import { getExercisesForPhase, type Exercise } from '@/data/exercises'

const TYPE_LABELS: Record<string, string> = {
  passive: 'Пассивные',
  passive_gravity: 'Гравитационные',
  active_assisted: 'С поддержкой',
  active: 'Активные',
  static_progressive: 'Статические',
  functional: 'Функциональные',
}

const TYPE_ORDER = ['passive', 'passive_gravity', 'active_assisted', 'active', 'static_progressive', 'functional']

const PRIORITY_COLORS: Record<number, string> = {
  1: 'var(--color-error)',
  2: 'var(--color-warning)',
  3: 'var(--color-info)',
}

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Обязательно',
  2: 'Важно',
  3: 'По желанию',
}

function formatDuration(exercise: Exercise): string {
  const totalSec = exercise.phases.reduce((sum, p) => sum + (p.durationSec ?? 0), 0)
  if (totalSec >= 60) return `${Math.round(totalSec / 60)} мин`
  return `${totalSec} сек`
}

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  return (
    <Link
      href={`/session/${index + 1}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        textDecoration: 'none',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)' }}>
            {exercise.nameShort}
          </span>
          <span style={{
            fontSize: '10px', fontWeight: 600, padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: `color-mix(in srgb, ${PRIORITY_COLORS[exercise.priority]} 12%, transparent)`,
            color: PRIORITY_COLORS[exercise.priority],
          }}>
            {PRIORITY_LABELS[exercise.priority]}
          </span>
        </div>
        <p style={{
          fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
          margin: '0 0 6px 0', lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {exercise.phases[0]?.description?.slice(0, 80)}...
        </p>
        <div style={{ display: 'flex', gap: '12px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {exercise.reps && exercise.sets && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Repeat size={12} weight="bold" /> {exercise.sets}&times;{exercise.reps}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Timer size={12} weight="bold" /> {formatDuration(exercise)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Fire size={12} weight="bold" /> {exercise.sessionsPerDay}&times;/день
          </span>
        </div>
      </div>
      <ArrowRight size={18} weight="bold" style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginLeft: '8px' }} />
    </Link>
  )
}

export default function SessionPage() {
  const phase = getCurrentPhase()
  const exercises = getExercisesForPhase(phase)

  // Group by type
  const grouped = TYPE_ORDER
    .map(type => ({
      type,
      label: TYPE_LABELS[type] ?? type,
      exercises: exercises.filter(ex => ex.type === type),
    }))
    .filter(g => g.exercises.length > 0)

  return (
    <div style={{ paddingTop: '24px', paddingBottom: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Barbell size={28} weight="duotone" style={{ color: 'var(--color-primary)' }} />
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)',
          fontWeight: 600, color: 'var(--color-text)', margin: 0,
        }}>
          Упражнения
        </h1>
      </div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
        Фаза {phase} — {exercises.length} упражнений доступно
      </p>

      {/* Exercise groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {grouped.map(group => (
          <section key={group.type}>
            <h2 style={{
              fontSize: 'var(--text-sm)', fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              marginBottom: '10px',
            }}>
              {group.label}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {group.exercises.map((ex, i) => (
                <ExerciseCard key={ex.id} exercise={ex} index={exercises.indexOf(ex)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
