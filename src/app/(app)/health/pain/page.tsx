'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, CaretDown, CaretUp } from '@phosphor-icons/react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PainForm } from '@/components/health/pain-form'
import { MonthCalendar, type CalendarDay } from '@/components/health/month-calendar'

// ─── Helpers ────────────────────────────────────────────────────

const LOCATION_LABELS: Record<string, string> = {
  olecranon: 'Олекранон',
  medial: 'Медиально',
  lateral: 'Латерально',
  forearm: 'Предплечье',
  wrist: 'Запястье',
}

const CHARACTER_LABELS: Record<string, string> = {
  sharp: 'Острая',
  dull: 'Тупая',
  aching: 'Ноющая',
  pulling: 'Тянущая',
  burning: 'Жгучая',
  throbbing: 'Пульсирующая',
  shooting: 'Стреляющая',
}

const TRIGGER_LABELS: Record<string, string> = {
  exercise: 'Упражнения',
  rest: 'Покой',
  cold: 'Холод',
  heat: 'Тепло',
  touch: 'Прикосновение',
  load: 'Нагрузка',
  morning: 'Утро',
  evening: 'Вечер',
}

const CREPITATION_LABELS: Record<string, string> = {
  none: 'Нет',
  mild: 'Лёгкая',
  moderate: 'Умеренная',
  severe: 'Сильная',
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
  const [expandedEntryId, setExpandedEntryId] = useState<number | null>(null)
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null)
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

  const allPainEntries = useLiveQuery(() => db.painEntries.orderBy('date').toArray(), []) ?? []

  const painCalendarDays = useMemo((): CalendarDay[] => {
    const byDate = new Map<string, number[]>()
    for (const entry of allPainEntries) {
      if (!byDate.has(entry.date)) byDate.set(entry.date, [])
      byDate.get(entry.date)!.push(entry.level)
    }
    return Array.from(byDate.entries()).map(([date, levels]) => {
      const maxLevel = Math.max(...levels)
      return {
        date,
        hasData: true,
        quality: maxLevel <= 3 ? 'good' : maxLevel <= 6 ? 'warning' : 'bad',
        label: String(maxLevel),
      }
    })
  }, [allPainEntries])

  const selectedDateEntries = useLiveQuery(
    async () => {
      if (!calendarSelectedDate) return []
      return db.painEntries.where('date').equals(calendarSelectedDate).sortBy('time')
    },
    [calendarSelectedDate]
  ) ?? []

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

      <MonthCalendar
        days={painCalendarDays}
        onSelectDate={setCalendarSelectedDate}
        selectedDate={calendarSelectedDate}
        title="История боли"
      />

      {calendarSelectedDate && selectedDateEntries.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            {new Date(calendarSelectedDate + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </p>
          {selectedDateEntries.map(entry => (
            <div key={entry.id} style={{
              padding: '10px 14px',
              background: 'var(--color-surface)',
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                color: entry.level <= 3 ? 'var(--color-primary)' : entry.level <= 6 ? '#f59e0b' : 'var(--color-error)',
                minWidth: 28,
              }}>{entry.level}</span>
              <div>
                <p style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 500 }}>{entry.time}</p>
                {entry.locations.length > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{entry.locations.join(', ')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Card */}
      <div
        style={{
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          marginTop: '24px',
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
            {todayEntries.map((entry) => {
              const isExpanded = expandedEntryId === entry.id
              return (
                <div
                  key={entry.id}
                  onClick={() =>
                    setExpandedEntryId(isExpanded ? null : entry.id ?? null)
                  }
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    animation: 'var(--animate-fade-in)',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'box-shadow 0.2s ease',
                    boxShadow: isExpanded ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {/* Top row: time + pain level + chevron */}
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
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
                      {isExpanded ? (
                        <CaretUp
                          size={16}
                          weight="bold"
                          style={{ color: 'var(--color-text-muted)' }}
                        />
                      ) : (
                        <CaretDown
                          size={16}
                          weight="bold"
                          style={{ color: 'var(--color-text-muted)' }}
                        />
                      )}
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

                  {/* Collapsed: truncated notes */}
                  {!isExpanded && entry.notes && (
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

                  {/* Expanded details */}
                  <div
                    style={{
                      overflow: 'hidden',
                      maxHeight: isExpanded ? '500px' : '0px',
                      opacity: isExpanded ? 1 : 0,
                      transition:
                        'max-height 0.3s ease, opacity 0.2s ease, margin-top 0.3s ease',
                      marginTop: isExpanded ? '12px' : '0px',
                    }}
                  >
                    {/* Separator */}
                    <div
                      style={{
                        height: '1px',
                        backgroundColor: 'var(--color-border)',
                        marginBottom: '12px',
                      }}
                    />

                    {/* Character chips */}
                    {entry.character.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          Характер:{' '}
                        </span>
                        <div
                          style={{
                            display: 'inline-flex',
                            flexWrap: 'wrap',
                            gap: '4px',
                            marginTop: '4px',
                          }}
                        >
                          {entry.character.map((ch) => (
                            <span
                              key={ch}
                              style={{
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 500,
                                backgroundColor: `color-mix(in srgb, var(--color-primary) 10%, transparent)`,
                                color: 'var(--color-primary)',
                              }}
                            >
                              {CHARACTER_LABELS[ch] || ch}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trigger chips */}
                    {entry.triggers.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          Триггеры:{' '}
                        </span>
                        <div
                          style={{
                            display: 'inline-flex',
                            flexWrap: 'wrap',
                            gap: '4px',
                            marginTop: '4px',
                          }}
                        >
                          {entry.triggers.map((tr) => (
                            <span
                              key={tr}
                              style={{
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 500,
                                backgroundColor: `color-mix(in srgb, var(--color-warning) 12%, transparent)`,
                                color: 'var(--color-warning)',
                              }}
                            >
                              {TRIGGER_LABELS[tr] || tr}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Crepitation */}
                    <div style={{ marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        Крепитация:{' '}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {CREPITATION_LABELS[entry.crepitation] ||
                          entry.crepitation}
                      </span>
                    </div>

                    {/* Numbness 4-5 */}
                    <div style={{ marginBottom: entry.notes ? '10px' : '0px' }}>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        Онемение 4-5 пальцев:{' '}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: entry.numbness45
                            ? 'var(--color-error)'
                            : 'var(--color-text-muted)',
                          fontWeight: entry.numbness45 ? 600 : 400,
                        }}
                      >
                        {entry.numbness45 ? 'Да' : 'Нет'}
                      </span>
                    </div>

                    {/* Full notes */}
                    {entry.notes && (
                      <div>
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          Заметки:
                        </span>
                        <p
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-muted)',
                            marginTop: '4px',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {entry.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
