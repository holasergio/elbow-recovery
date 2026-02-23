'use client'

import { useState } from 'react'
import { phases } from '@/data/phases'
import { getWeeksSinceSurgery, getCurrentPhase } from '@/data/patient'
import { CaretDown, CaretUp, Target, Lock, CheckCircle } from '@phosphor-icons/react'

// ─── Phase colors mapping ────────────────────────────────────────

const phaseColors: Record<number, { active: string; bg: string }> = {
  1: { active: 'var(--color-info)', bg: 'color-mix(in srgb, var(--color-info) 15%, transparent)' },
  2: { active: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
  3: { active: 'var(--color-accent)', bg: 'var(--color-accent-light)' },
  4: { active: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
  5: { active: 'var(--color-primary-dark)', bg: 'color-mix(in srgb, var(--color-primary-dark) 12%, transparent)' },
}

export function PhaseTimeline() {
  const currentWeek = getWeeksSinceSurgery()
  const currentPhase = getCurrentPhase()
  const [expandedPhase, setExpandedPhase] = useState<number | null>(currentPhase)

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          Фазы реабилитации
        </p>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-primary)',
            margin: 0,
          }}
        >
          Неделя {currentWeek}
        </p>
      </div>

      {/* Timeline bar */}
      <div
        style={{
          display: 'flex',
          gap: '3px',
          marginBottom: '10px',
          height: '8px',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        {phases.map((phase) => {
          const isActive = phase.number === currentPhase
          const isPast = phase.number < currentPhase
          const colors = phaseColors[phase.number]

          const totalWeeks = phases[phases.length - 1].endWeek
          const phaseWeeks = phase.endWeek - phase.startWeek + 1
          const widthPercent = (phaseWeeks / totalWeeks) * 100

          return (
            <div
              key={phase.number}
              style={{
                flex: `0 0 ${widthPercent}%`,
                height: '100%',
                borderRadius: '4px',
                backgroundColor: isActive
                  ? colors.active
                  : isPast
                    ? 'color-mix(in srgb, var(--color-primary) 40%, transparent)'
                    : 'var(--color-surface-alt)',
                position: 'relative',
                transition: 'background-color 0.3s ease',
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${Math.min(
                      ((currentWeek - phase.startWeek) /
                        (phase.endWeek - phase.startWeek + 1)) *
                        100,
                      100
                    )}%`,
                    borderRadius: '4px',
                    backgroundColor: colors.active,
                    opacity: 0.5,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Phase labels — clickable */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {phases.map((phase) => {
          const isActive = phase.number === currentPhase
          const isPast = phase.number < currentPhase
          const isExpanded = expandedPhase === phase.number
          const colors = phaseColors[phase.number]

          return (
            <div key={phase.number}>
              {/* Row header — tap to expand */}
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase.number)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: isActive ? '8px 10px' : '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isExpanded ? colors.bg : isActive ? colors.bg : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  textAlign: 'left',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {/* Phase number dot */}
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0,
                    backgroundColor: isActive
                      ? colors.active
                      : isPast
                        ? 'color-mix(in srgb, var(--color-primary) 30%, transparent)'
                        : 'var(--color-surface-alt)',
                    color: isActive
                      ? '#FFFFFF'
                      : isPast
                        ? 'var(--color-primary)'
                        : 'var(--color-text-muted)',
                  }}
                >
                  {phase.number}
                </div>

                {/* Phase name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: isActive ? 'var(--text-sm)' : '12px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive
                        ? 'var(--color-text)'
                        : isPast
                          ? 'var(--color-text-secondary)'
                          : 'var(--color-text-muted)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {phase.name}
                  </p>
                </div>

                {/* Week range */}
                <span
                  style={{
                    fontSize: '11px',
                    color: isActive ? colors.active : 'var(--color-text-muted)',
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  нед. {phase.startWeek}–{phase.endWeek}
                </span>

                {/* Expand icon */}
                {isExpanded
                  ? <CaretUp size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  : <CaretDown size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                }
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div
                  style={{
                    margin: '4px 0 6px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: colors.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* Description */}
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {phase.description}
                  </p>

                  {/* ROM target */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Target size={13} weight="duotone" style={{ color: colors.active }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: colors.active, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Целевая амплитуда
                      </span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                      {phase.romTarget.min}–{phase.romTarget.max}° сгибания
                    </p>
                  </div>

                  {/* Goals */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <CheckCircle size={13} weight="duotone" style={{ color: colors.active }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: colors.active, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Задачи фазы
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {phase.goals.map((goal, i) => (
                        <p key={i} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                          · {goal}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Lock size={13} weight="duotone" style={{ color: 'var(--color-warning)' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Ограничения
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {phase.restrictions.map((r, i) => (
                        <p key={i} style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                          · {r}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
