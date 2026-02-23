'use client'

import { useState } from 'react'
import { CheckCircle, Circle, Info } from '@phosphor-icons/react'
import type { Supplement, SupplementSlot } from '@/data/supplements'

const priorityConfig: Record<
  1 | 2 | 3,
  { label: string; bg: string; color: string }
> = {
  1: {
    label: 'Важно',
    bg: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
  },
  2: {
    label: 'Рекомендовано',
    bg: 'var(--color-accent-light)',
    color: 'var(--color-accent)',
  },
  3: {
    label: 'Дополнительно',
    bg: 'var(--color-surface-alt)',
    color: 'var(--color-text-muted)',
  },
}

interface SupplementCardProps {
  supplement: Supplement
  taken: boolean
  onToggle: (supplementId: string, slot: SupplementSlot) => void
}

export function SupplementCard({
  supplement,
  taken,
  onToggle,
}: SupplementCardProps) {
  const [expanded, setExpanded] = useState(false)
  const priority = priorityConfig[supplement.priority]

  function handleToggle(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation()
    onToggle(supplement.id, supplement.slot)
  }

  function handleExpand() {
    setExpanded((prev) => !prev)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle(e)
    }
  }

  return (
    <div
      role="checkbox"
      aria-checked={taken}
      aria-label={`${supplement.name} ${supplement.dose}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleToggle}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `1px solid ${taken ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: taken ? 0.75 : 1,
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Checkbox icon */}
        <div
          style={{
            flexShrink: 0,
            marginTop: '2px',
            transition: 'transform 0.2s ease',
            transform: taken ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {taken ? (
            <CheckCircle
              size={26}
              weight="fill"
              style={{ color: 'var(--color-primary)' }}
            />
          ) : (
            <Circle
              size={26}
              weight="duotone"
              style={{ color: 'var(--color-text-muted)' }}
            />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top row: name + badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                color: taken
                  ? 'var(--color-primary)'
                  : 'var(--color-text)',
                textDecoration: taken ? 'line-through' : 'none',
                transition: 'color 0.2s ease',
              }}
            >
              {supplement.name}
            </span>

            {/* Priority badge */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: priority.bg,
                color: priority.color,
                lineHeight: '16px',
                whiteSpace: 'nowrap',
              }}
            >
              {priority.label}
            </span>
          </div>

          {/* Dose + form */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '4px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
              }}
            >
              {supplement.dose}
            </span>
            {supplement.form && (
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {supplement.form}
              </span>
            )}
          </div>

          {/* Timing badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginTop: '6px',
              fontSize: '11px',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-text-muted)',
            }}
          >
            {supplement.timing}
          </div>
          {supplement.idealNote && (
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block', marginTop: 2 }}>
              &#x23F1; {supplement.idealNote} ({supplement.idealTimeFrom}&#8211;{supplement.idealTimeTo})
            </span>
          )}

          {/* Expandable reason */}
          {(supplement.reason || supplement.note) && (
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleExpand()
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--color-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
                aria-expanded={expanded}
                aria-label="Показать подробности"
              >
                <Info size={14} weight="duotone" />
                {expanded ? 'Скрыть' : 'Подробнее'}
              </button>

              {expanded && (
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: 'var(--text-sm)',
                    lineHeight: '1.5',
                    color: 'var(--color-text-secondary)',
                    animation: 'var(--animate-fade-in)',
                  }}
                >
                  <p>{supplement.reason}</p>
                  {supplement.note && (
                    <p
                      style={{
                        marginTop: '4px',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      {supplement.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
