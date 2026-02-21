'use client'

import Link from 'next/link'
import { ArrowLeft, Clock } from '@phosphor-icons/react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PainForm } from '@/components/health/pain-form'

// ─── Helpers ────────────────────────────────────────────────────

const LOCATION_LABELS: Record<string, string> = {
  olecranon: 'Олекранон',
  medial: 'Медиально',
  lateral: 'Латерально',
  forearm: 'Предплечье',
  wrist: 'Запястье',
}

function getPainLevelColor(level: number): string {
  if (level === 0) return 'var(--color-success)'
  if (level <= 3) return '#7BAF96'
  if (level <= 5) return 'var(--color-warning)'
  if (level <= 7) return '#D48A4A'
  return 'var(--color-error)'
}

// ─── Page ───────────────────────────────────────────────────────

export default function PainDiaryPage() {
  const today = new Date().toISOString().split('T')[0]

  const todayEntries = useLiveQuery(
    () =>
      db.painEntries
        .where('date')
        .equals(today)
        .reverse()
        .sortBy('time'),
    [today]
  )

  return (
    <div style={{ paddingTop: '24px', paddingBottom: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/health"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            marginBottom: '8px',
          }}
        >
          <ArrowLeft size={16} weight="bold" />
          Здоровье
        </Link>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Дневник боли
        </h1>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: '4px',
          }}
        >
          Фиксируйте динамику для стабильного восстановления
        </p>
      </div>

      {/* Form Card */}
      <div
        style={{
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <PainForm />
      </div>

      {/* Today's Entries */}
      {todayEntries && todayEntries.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h2
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--color-text)',
              marginBottom: '12px',
            }}
          >
            Сегодня
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {todayEntries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  animation: 'var(--animate-fade-in)',
                }}
              >
                {/* Top row: time + pain level */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Clock
                      size={14}
                      weight="duotone"
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {entry.time}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: `color-mix(in srgb, ${getPainLevelColor(entry.level)} 15%, transparent)`,
                      color: getPainLevelColor(entry.level),
                      fontSize: 'var(--text-base)',
                      fontWeight: 700,
                      padding: '0 8px',
                    }}
                  >
                    {entry.level}
                  </div>
                </div>

                {/* Location chips */}
                {entry.locations.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                    }}
                  >
                    {entry.locations.map((loc) => (
                      <span
                        key={loc}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 500,
                          backgroundColor: 'var(--color-surface-alt)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {LOCATION_LABELS[loc] || loc}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes preview */}
                {entry.notes && (
                  <p
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      marginTop: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
