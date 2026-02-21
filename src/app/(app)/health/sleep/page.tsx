'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Moon, Star, Clock } from '@phosphor-icons/react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { SleepForm } from '@/components/health/sleep-form'
import { HormoneTimeline } from '@/components/health/hormone-timeline'

// ─── Helpers ────────────────────────────────────────────────────

function getHoursColor(hours: number): string {
  if (hours >= 7.5) return 'var(--color-success)'
  if (hours >= 6) return 'var(--color-warning)'
  return 'var(--color-error)'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00') // avoid timezone offset issues
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

// ─── Quality Labels ─────────────────────────────────────────────

const QUALITY_LABELS: Record<number, string> = {
  1: 'Плохой',
  2: 'Ниже среднего',
  3: 'Средний',
  4: 'Хороший',
  5: 'Отличный',
}

// ─── Page ───────────────────────────────────────────────────────

export default function SleepPage() {
  const today = new Date().toISOString().split('T')[0]
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null)

  const todaySleep = useLiveQuery(
    () => db.sleepLogs.where('date').equals(today).first(),
    [today]
  )

  const recentLogs = useLiveQuery(
    () =>
      db.sleepLogs
        .orderBy('date')
        .reverse()
        .limit(7)
        .toArray(),
    []
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '4px',
          }}
        >
          <Moon
            size={28}
            weight="duotone"
            style={{ color: 'var(--color-primary)' }}
          />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 600,
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            Протокол сна
          </h1>
        </div>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: '4px',
          }}
        >
          Сон — ключевой фактор восстановления кости
        </p>
      </div>

      {/* Hormone Timeline */}
      <div style={{ marginBottom: '24px' }}>
        <HormoneTimeline todaySleep={todaySleep ?? null} />
      </div>

      {/* Sleep Form Card */}
      <div
        style={{
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <SleepForm />
      </div>

      {/* Recent Logs */}
      {recentLogs && recentLogs.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h2
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--color-text)',
              marginBottom: '12px',
            }}
          >
            Последние записи
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {recentLogs.map((log) => {
              const isExpanded = expandedLogId === log.id
              return (
                <button
                  key={log.id}
                  type="button"
                  onClick={() =>
                    setExpandedLogId(isExpanded ? null : (log.id ?? null))
                  }
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    animation: 'var(--animate-fade-in)',
                    cursor: 'pointer',
                    background: 'var(--color-surface)',
                  }}
                >
                  {/* Top row: date + total hours */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                      }}
                    >
                      {formatDate(log.date)}
                    </span>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: `color-mix(in srgb, ${getHoursColor(log.totalHours)} 12%, transparent)`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 700,
                          color: getHoursColor(log.totalHours),
                        }}
                      >
                        {log.totalHours}ч
                      </span>
                    </div>
                  </div>

                  {/* Time range + quality */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
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
                        {log.bedTime} → {log.wakeTime}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {/* Quality Stars */}
                      <div
                        style={{ display: 'flex', gap: '1px' }}
                        aria-label={`Качество: ${log.quality} из 5`}
                      >
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            weight={s <= log.quality ? 'fill' : 'duotone'}
                            style={{
                              color:
                                s <= log.quality
                                  ? 'var(--color-accent)'
                                  : 'var(--color-text-muted)',
                            }}
                          />
                        ))}
                      </div>

                      {/* Wake-ups */}
                      {log.wakeUps > 0 && (
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-muted)',
                            marginLeft: '6px',
                          }}
                        >
                          {log.wakeUps}x
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes preview (collapsed) */}
                  {log.notes && !isExpanded && (
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
                      {log.notes}
                    </p>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        animation: 'var(--animate-fade-in)',
                      }}
                    >
                      {log.notes && (
                        <p
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-muted)',
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          {log.notes}
                        </p>
                      )}
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        Пробуждения: {log.wakeUps} пробуждений за ночь
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        Качество: {QUALITY_LABELS[log.quality] ?? log.quality}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
