'use client'

import { useState, useMemo } from 'react'
import { exercises, getExercisesForPhase, Exercise } from '@/data/exercises'
import { getCurrentPhase } from '@/data/patient'
import { ExerciseDetail } from '@/components/exercises/exercise-detail'
import { Barbell } from '@phosphor-icons/react'

type PriorityFilter = 'all' | 1 | 2 | 3

const FILTER_TABS: { key: PriorityFilter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 1, label: 'Обязательные' },
  { key: 2, label: 'Рекомендуемые' },
  { key: 3, label: 'Дополнительные' },
]

const TYPE_GROUPS: { type: Exercise['type']; label: string }[] = [
  { type: 'passive', label: 'Пассивные' },
  { type: 'passive_gravity', label: 'Гравитационные' },
  { type: 'active_assisted', label: 'Активные с поддержкой' },
  { type: 'active', label: 'Активные' },
  { type: 'static_progressive', label: 'Статические' },
  { type: 'functional', label: 'Функциональные' },
]

const PHASE_NAMES: Record<number, string> = {
  1: 'Защитная фаза',
  2: 'Ранняя мобилизация',
  3: 'Активная разработка',
  4: 'Укрепление',
  5: 'Возврат к активности',
}

export default function ExercisesPage() {
  const phase = getCurrentPhase()
  const [activeFilter, setActiveFilter] = useState<PriorityFilter>('all')

  const phaseExercises = useMemo(() => getExercisesForPhase(phase), [phase])

  const filteredExercises = useMemo(() => {
    if (activeFilter === 'all') return phaseExercises
    return phaseExercises.filter((ex) => ex.priority === activeFilter)
  }, [phaseExercises, activeFilter])

  const groupedExercises = useMemo(() => {
    return TYPE_GROUPS.map((group) => ({
      ...group,
      exercises: filteredExercises.filter((ex) => ex.type === group.type),
    })).filter((group) => group.exercises.length > 0)
  }, [filteredExercises])

  return (
    <div style={{ paddingTop: '16px', paddingBottom: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Barbell size={24} weight="duotone" style={{ color: 'var(--color-primary)' }} />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            Каталог упражнений
          </h1>
        </div>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            margin: '4px 0 0 0',
            lineHeight: 1.4,
          }}
        >
          Фаза {phase}: {PHASE_NAMES[phase] || `Фаза ${phase}`} &middot;{' '}
          {phaseExercises.length} упражнений
        </p>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
          marginBottom: '20px',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key
          const count =
            tab.key === 'all'
              ? phaseExercises.length
              : phaseExercises.filter((ex) => ex.priority === tab.key).length
          return (
            <button
              key={String(tab.key)}
              onClick={() => setActiveFilter(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                border: isActive ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'var(--color-surface)',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
                flexShrink: 0,
              }}
            >
              {tab.label}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                  color: isActive ? 'white' : 'var(--color-text-muted)',
                  padding: '0 4px',
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grouped exercise list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {groupedExercises.map((group) => (
          <section key={group.type}>
            {/* Group header */}
            <h2
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 10px 0',
              }}
            >
              {group.label}
            </h2>

            {/* Exercise cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {group.exercises.map((exercise) => (
                <ExerciseDetail key={exercise.id} exercise={exercise} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Empty state */}
      {filteredExercises.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <Barbell size={48} weight="duotone" style={{ color: 'var(--color-border)', marginBottom: '12px' }} />
          <p
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Нет упражнений с выбранным фильтром
          </p>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              marginTop: '12px',
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Показать все
          </button>
        </div>
      )}
    </div>
  )
}
