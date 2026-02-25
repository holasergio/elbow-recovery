'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useTodayStats } from '@/hooks/use-exercise-stats'
import { getExercisesForPhase, getExerciseById } from '@/data/exercises'
import { getCurrentPhase } from '@/data/patient'
import { Barbell, CheckCircle, CaretDown } from '@phosphor-icons/react'
import { toLocalDateStr } from '@/lib/date-utils'

interface CompletedExerciseInfo {
  exerciseId: string
  nameShort: string
  count: number
  lastTime: string // HH:MM
}

export function TodayExercises() {
  const phase = getCurrentPhase()
  const totalInPhase = getExercisesForPhase(phase).length
  const { uniqueExercises, totalExercises, loading } = useTodayStats()
  const [expanded, setExpanded] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownHeight, setDropdownHeight] = useState(0)

  const today = toLocalDateStr()
  const todaySessions = useLiveQuery(
    () => db.exerciseSessions.where('date').equals(today).toArray(),
    [today]
  )

  useEffect(() => {
    if (dropdownRef.current) {
      setDropdownHeight(dropdownRef.current.scrollHeight)
    }
  }, [expanded, todaySessions])

  const completedExercises = useMemo<CompletedExerciseInfo[]>(() => {
    if (!todaySessions || todaySessions.length === 0) return []

    const grouped = new Map<string, { count: number; lastCompletedAt: string }>()

    for (const session of todaySessions) {
      const existing = grouped.get(session.exerciseId)
      const completedAt = session.completedAt || session.startedAt
      if (existing) {
        existing.count += 1
        if (completedAt > existing.lastCompletedAt) {
          existing.lastCompletedAt = completedAt
        }
      } else {
        grouped.set(session.exerciseId, { count: 1, lastCompletedAt: completedAt })
      }
    }

    const result: CompletedExerciseInfo[] = []
    for (const [exerciseId, data] of grouped) {
      const exercise = getExerciseById(exerciseId)
      const lastDate = new Date(data.lastCompletedAt)
      const hours = lastDate.getHours().toString().padStart(2, '0')
      const minutes = lastDate.getMinutes().toString().padStart(2, '0')
      result.push({
        exerciseId,
        nameShort: exercise?.nameShort ?? exerciseId,
        count: data.count,
        lastTime: `${hours}:${minutes}`,
      })
    }

    // Sort by last time descending (most recent first)
    result.sort((a, b) => (b.lastTime || '').localeCompare(a.lastTime || ''))
    return result
  }, [todaySessions])

  if (loading) return null

  const allDone = uniqueExercises >= totalInPhase && totalInPhase > 0
  const hasProgress = totalExercises > 0
  const overperformed = totalExercises > totalInPhase

  const pluralRaz = (n: number) => {
    if (n === 1) return 'раз'
    if (n >= 2 && n <= 4) return 'раза'
    return 'раз'
  }

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: hasProgress ? 'var(--color-primary-light)' : 'var(--color-surface)',
        border: hasProgress
          ? '1px solid var(--color-primary)'
          : '1px solid var(--color-border)',
        marginTop: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Tappable header */}
      <div
        onClick={() => hasProgress && setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 16px',
          cursor: hasProgress ? 'pointer' : 'default',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {allDone ? (
          <CheckCircle size={28} weight="fill" style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        ) : (
          <Barbell size={28} weight="duotone" style={{ color: hasProgress ? 'var(--color-primary)' : 'var(--color-text-muted)', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            {overperformed && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '1px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-accent-light, rgba(255, 179, 0, 0.15))',
                  color: 'var(--color-accent, #e69500)',
                  letterSpacing: '0.02em',
                }}
              >
                Перевыполнено!
              </span>
            )}
          </div>
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

        {/* Expand/collapse caret */}
        {hasProgress && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255,255,255,0.4)',
              color: 'var(--color-primary)',
              transition: 'transform 0.3s ease',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}
          >
            <CaretDown size={14} weight="bold" />
          </span>
        )}
      </div>

      {/* Expandable dropdown */}
      <div
        style={{
          maxHeight: expanded ? `${dropdownHeight}px` : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        <div
          ref={dropdownRef}
          style={{
            padding: '0 16px 12px 16px',
          }}
        >
          {/* Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: hasProgress ? 'var(--color-primary)' : 'var(--color-border)',
              opacity: 0.2,
              marginBottom: '10px',
            }}
          />

          {completedExercises.length === 0 ? (
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                margin: 0,
                textAlign: 'center',
                padding: '4px 0',
              }}
            >
              Нет выполненных упражнений
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {completedExercises.map((item) => (
                <div
                  key={item.exerciseId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255,255,255,0.35)',
                  }}
                >
                  <CheckCircle
                    size={16}
                    weight="fill"
                    style={{
                      color: 'var(--color-primary)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.nameShort}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-secondary)',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.count} {pluralRaz(item.count)}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.lastTime}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
