'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useTodayData } from '@/hooks/use-today-data'
import { dailySessions } from '@/data/schedule'
import { CheckCircle, Circle, Play, XCircle } from '@phosphor-icons/react'

export function SessionList() {
  const { sessionsToday } = useTodayData()
  const today = new Date().toISOString().split('T')[0]

  const [skipDialog, setSkipDialog] = useState<number | null>(null)
  const [skipReason, setSkipReason] = useState('')
  const [saving, setSaving] = useState(false)

  const completedSlots = new Set(sessionsToday.map(s => s.sessionSlot))

  const skippedSessions = useLiveQuery(
    () => db.skippedSessions.where('date').equals(today).toArray(),
    [today]
  ) ?? []
  const skippedSlots = new Set(skippedSessions.map(s => s.sessionSlot))

  const now = new Date()
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  async function handleSkip(sessionSlot: number) {
    setSaving(true)
    await db.skippedSessions.add({
      sessionSlot,
      date: today,
      reason: skipReason.trim() || 'Без причины',
      skippedAt: new Date().toISOString(),
    })
    setSkipDialog(null)
    setSkipReason('')
    setSaving(false)
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--color-text)' }}>
        Сессии сегодня
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {dailySessions.map((session) => {
          const isDone = completedSlots.has(session.id)
          const isSkipped = skippedSlots.has(session.id)
          const isPast = session.time < currentHHMM
          const isNext = !isDone && !isSkipped && isPast

          const skipEntry = skippedSessions.find(s => s.sessionSlot === session.id)

          return (
            <div key={session.id}>
              {/* Session card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: isDone
                    ? 'var(--color-primary-light)'
                    : isSkipped
                    ? 'color-mix(in srgb, var(--color-error) 8%, transparent)'
                    : 'var(--color-surface)',
                  border: isNext
                    ? '2px solid var(--color-primary)'
                    : isSkipped
                    ? '1px solid color-mix(in srgb, var(--color-error) 25%, transparent)'
                    : '1px solid var(--color-border)',
                }}
              >
                {/* Status icon */}
                {isDone ? (
                  <CheckCircle size={24} weight="fill" style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                ) : isSkipped ? (
                  <XCircle size={24} weight="fill" style={{ color: 'var(--color-error)', flexShrink: 0 }} />
                ) : (
                  <Circle size={24} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                )}

                {/* Session info — tappable to open session */}
                <Link href={`/session/${session.id}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                  <p style={{
                    fontWeight: 500,
                    fontSize: 14,
                    color: isDone
                      ? 'var(--color-primary)'
                      : isSkipped
                      ? 'var(--color-error)'
                      : 'var(--color-text)',
                    marginBottom: isSkipped && skipEntry?.reason ? 2 : 0,
                  }}>
                    {session.name}
                  </p>
                  {isSkipped && skipEntry?.reason && (
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                      {skipEntry.reason}
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {session.time} · {session.durationMin} мин · {session.steps.length} шагов
                  </p>
                </Link>

                {/* Right actions */}
                {isNext && !isDone && !isSkipped && (
                  <Link href={`/session/${session.id}`}>
                    <Play size={20} weight="fill" style={{ color: 'var(--color-primary)' }} />
                  </Link>
                )}
                {!isDone && !isSkipped && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setSkipDialog(session.id)
                      setSkipReason('')
                    }}
                    style={{
                      fontSize: 11,
                      color: 'var(--color-text-muted)',
                      background: 'transparent',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      padding: '4px 8px',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Пропустить
                  </button>
                )}
              </div>

              {/* Skip dialog (inline below card) */}
              {skipDialog === session.id && (
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  padding: 16,
                  marginTop: 4,
                }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 8, fontWeight: 500 }}>
                    Причина пропуска (необязательно)
                  </p>
                  <textarea
                    value={skipReason}
                    onChange={e => setSkipReason(e.target.value)}
                    placeholder="Боль в локте, усталость, нет времени..."
                    rows={2}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      padding: '8px 10px',
                      fontSize: 13,
                      color: 'var(--color-text)',
                      background: 'var(--color-bg)',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      onClick={() => handleSkip(session.id)}
                      disabled={saving}
                      style={{
                        flex: 1,
                        background: 'var(--color-error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? 'Сохраняю...' : 'Пропустить сессию'}
                    </button>
                    <button
                      onClick={() => setSkipDialog(null)}
                      style={{
                        background: 'var(--color-surface)',
                        color: 'var(--color-text-muted)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      Отмена
                    </button>
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
