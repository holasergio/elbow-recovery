'use client'

import {
  slotLabels,
  slotSchedule,
  getSupplementsBySlot,
  type SupplementSlot,
} from '@/data/supplements'
import { useSupplementsToday } from '@/hooks/use-supplements-today'
import { SupplementCard } from './supplement-card'
import { Clock } from '@phosphor-icons/react'

const slotOrder: SupplementSlot[] = [
  'fasting',
  'breakfast',
  'lunch',
  'dinner',
  'bedtime',
]

export function SupplementChecklist() {
  const { takenIds, totalCount, takenCount, toggleSupplement, isLoading } =
    useSupplementsToday()

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '48px 0',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}
      >
        Загрузка...
      </div>
    )
  }

  const progressPercent =
    totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0

  return (
    <div>
      {/* Progress bar */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            Принято {takenCount} из {totalCount}
          </span>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color:
                progressPercent === 100
                  ? 'var(--color-success)'
                  : 'var(--color-text-muted)',
            }}
          >
            {progressPercent}%
          </span>
        </div>

        {/* Track */}
        <div
          style={{
            height: '8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface-alt)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              borderRadius: 'var(--radius-full)',
              backgroundColor:
                progressPercent === 100
                  ? 'var(--color-success)'
                  : 'var(--color-primary)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Slot sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {slotOrder.map((slot) => {
          const items = getSupplementsBySlot(slot)
          if (items.length === 0) return null

          const slotTakenCount = items.filter((s) =>
            takenIds.has(s.id)
          ).length

          return (
            <section key={slot}>
              {/* Section header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  paddingBottom: '6px',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Clock
                    size={18}
                    weight="duotone"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                    }}
                  >
                    {slotLabels[slot]}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      fontWeight: 500,
                    }}
                  >
                    {slotSchedule[slot]}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color:
                      slotTakenCount === items.length
                        ? 'var(--color-success)'
                        : 'var(--color-text-muted)',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor:
                      slotTakenCount === items.length
                        ? 'var(--color-primary-light)'
                        : 'var(--color-surface-alt)',
                  }}
                >
                  {slotTakenCount} / {items.length}
                </span>
              </div>

              {/* Cards */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {items.map((supplement) => (
                  <SupplementCard
                    key={supplement.id}
                    supplement={supplement}
                    taken={takenIds.has(supplement.id)}
                    onToggle={toggleSupplement}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
