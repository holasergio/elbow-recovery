'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Exercise } from '@/data/exercises'
import { ExerciseSVG } from './exercise-svg'
import { Warning, CaretDown, CheckCircle, XCircle, Target, Timer, Repeat, Play } from '@phosphor-icons/react'
import { db } from '@/lib/db'

interface ExerciseDetailProps {
  exercise: Exercise
  defaultExpanded?: boolean
  completedToday?: boolean
}

const PRIORITY_CONFIG: Record<number, { label: string; bg: string; color: string }> = {
  1: {
    label: 'Обязательно',
    bg: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
  },
  2: {
    label: 'Важно',
    bg: 'var(--color-accent-light)',
    color: 'var(--color-accent)',
  },
  3: {
    label: 'По желанию',
    bg: 'var(--color-surface-alt)',
    color: 'var(--color-text-muted)',
  },
}

const TARGET_LABELS: Record<string, string> = {
  flexion: 'Сгибание',
  extension: 'Разгибание',
  rotation: 'Ротация',
  wrist: 'Запястье',
  hand_function: 'Кисть',
}

export function ExerciseDetail({ exercise, defaultExpanded = false, completedToday = false }: ExerciseDetailProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number>(0)
  const [justCompleted, setJustCompleted] = useState(false)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [expanded])

  const handleComplete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (justCompleted) return

    const now = new Date()
    await db.exerciseSessions.add({
      exerciseId: exercise.id,
      sessionSlot: 0,
      date: now.toISOString().split('T')[0],
      startedAt: now.toISOString(),
      completedAt: now.toISOString(),
      completedSets: exercise.sets ?? 1,
      completedReps: exercise.reps ?? 0,
    })

    setJustCompleted(true)
    setTimeout(() => setJustCompleted(false), 2000)
  }, [exercise.id, exercise.sets, exercise.reps, justCompleted])

  const priority = PRIORITY_CONFIG[exercise.priority] || PRIORITY_CONFIG[3]
  const targetLabel = TARGET_LABELS[exercise.target] || exercise.target

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: completedToday
          ? '1.5px solid var(--color-primary)'
          : '1px solid var(--color-border)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: expanded ? 'var(--shadow-md)' : 'var(--shadow-xs)',
      }}
    >
      {/* Completed today badge */}
      {completedToday && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <CheckCircle size={14} weight="fill" />
          Сделано
        </div>
      )}
      {/* Tappable header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'center',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* SVG illustration */}
        <ExerciseSVG exerciseId={exercise.id} size={100} />

        {/* Name */}
        <div style={{ width: '100%' }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--color-text)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {exercise.nameShort}
          </h3>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              margin: '2px 0 0 0',
              lineHeight: 1.4,
            }}
          >
            {exercise.name}
          </p>
        </div>

        {/* Priority badge + target + expand indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Priority badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: priority.bg,
              color: priority.color,
            }}
          >
            {priority.label}
          </span>

          {/* Target badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <Target size={12} weight="duotone" />
            {targetLabel}
          </span>

          {/* Expand chevron */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-text-muted)',
              transition: 'transform 0.3s ease',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}
          >
            <CaretDown size={14} weight="bold" />
          </span>
        </div>
      </button>

      {/* Expandable content */}
      <div
        style={{
          maxHeight: expanded ? `${contentHeight}px` : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        <div
          ref={contentRef}
          style={{
            padding: '0 16px 16px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: 'var(--color-border)',
              margin: '0 -16px',
              width: 'calc(100% + 32px)',
            }}
          />

          {/* Reps / Sets / Sessions info */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {exercise.reps && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Repeat size={16} weight="duotone" style={{ color: 'var(--color-primary)' }} />
                {exercise.sets
                  ? `${exercise.sets} x ${exercise.reps} повторов`
                  : `${exercise.reps} повторов`}
              </div>
            )}
            {exercise.holdDurationSec && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Timer size={16} weight="duotone" style={{ color: 'var(--color-primary)' }} />
                Удержание {exercise.holdDurationSec >= 60
                  ? `${Math.floor(exercise.holdDurationSec / 60)} мин`
                  : `${exercise.holdDurationSec} сек`}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Timer size={16} weight="duotone" style={{ color: 'var(--color-accent)' }} />
              {exercise.sessionsPerDay}x в день
            </div>
          </div>

          {/* Phase descriptions */}
          <div>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-text)',
                margin: '0 0 8px 0',
              }}
            >
              Этапы выполнения
            </p>
            <ol
              style={{
                margin: 0,
                paddingLeft: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {exercise.phases.map((phase, i) => (
                <li key={i} style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                  <span
                    style={{
                      fontWeight: 500,
                      color: 'var(--color-text)',
                    }}
                  >
                    {phase.name}
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {' '}
                    &mdash; {phase.description}
                  </span>
                  {phase.durationSec && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                        marginLeft: '4px',
                      }}
                    >
                      ({phase.durationSec >= 60
                        ? `${Math.floor(phase.durationSec / 60)} мин`
                        : `${phase.durationSec} сек`})
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Pain rules */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(194, 91, 78, 0.08)',
              alignItems: 'flex-start',
            }}
          >
            <Warning
              size={18}
              weight="duotone"
              style={{
                color: 'var(--color-error)',
                flexShrink: 0,
                marginTop: '1px',
              }}
            />
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-error)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {exercise.painRule}
            </p>
          </div>

          {/* Good feeling */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              alignItems: 'flex-start',
            }}
          >
            <CheckCircle
              size={18}
              weight="duotone"
              style={{
                color: 'var(--color-primary)',
                flexShrink: 0,
                marginTop: '1px',
              }}
            />
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-primary)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {exercise.goodFeeling}
            </p>
          </div>

          {/* Bad feeling */}
          {exercise.badFeeling && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-secondary-light)',
                alignItems: 'flex-start',
              }}
            >
              <XCircle
                size={18}
                weight="duotone"
                style={{
                  color: 'var(--color-secondary)',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              />
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-secondary)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {exercise.badFeeling}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Complete button — always visible */}
      <div style={{ padding: '0 16px 16px 16px' }}>
        <button
          onClick={handleComplete}
          disabled={justCompleted}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: justCompleted
              ? '1.5px solid var(--color-primary)'
              : completedToday
                ? '1.5px solid var(--color-border)'
                : '1.5px solid var(--color-primary)',
            backgroundColor: justCompleted
              ? 'var(--color-primary-light)'
              : completedToday
                ? 'var(--color-surface)'
                : 'var(--color-primary)',
            color: justCompleted
              ? 'var(--color-primary)'
              : completedToday
                ? 'var(--color-text-secondary)'
                : '#ffffff',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: justCompleted ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {justCompleted ? (
            <>
              <CheckCircle size={18} weight="fill" />
              Выполнено ✓
            </>
          ) : completedToday ? (
            <>
              <Play size={18} weight="fill" />
              Выполнить ещё раз
            </>
          ) : (
            <>
              <Play size={18} weight="fill" />
              Выполнить
            </>
          )}
        </button>
      </div>
    </div>
  )
}
