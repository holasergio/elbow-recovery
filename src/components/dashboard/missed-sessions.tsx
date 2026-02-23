'use client'

import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { dailySessions } from '@/data/schedule'
import { WarningCircle, Play, CaretDown, CaretUp } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

export function MissedSessions() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const todaySessions = useLiveQuery(
    () => db.exerciseSessions.where('date').equals(today).toArray(),
    [today]
  )

  const missedSessions = useMemo(() => {
    if (!todaySessions) return []

    const now = new Date()
    const currentTimeMin = now.getHours() * 60 + now.getMinutes()

    const completedSlots = new Set(todaySessions.map(s => s.sessionSlot))

    return dailySessions.filter(session => {
      const [h, m] = session.time.split(':').map(Number)
      const sessionTimeMin = h * 60 + m
      return (currentTimeMin > sessionTimeMin + 30) && !completedSlots.has(session.id)
    })
  }, [todaySessions])

  if (!missedSessions || missedSessions.length === 0) return null

  const now = new Date()

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
      border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)',
      marginTop: '12px',
      overflow: 'hidden',
    }}>
      {/* Collapsed header — always visible, tap to expand */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          textAlign: 'left',
        }}
      >
        <WarningCircle size={18} weight="duotone" style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
          {missedSessions.length === 1
            ? 'Пропущена 1 сессия'
            : `Пропущено ${missedSessions.length} сессии`}
        </span>
        {open
          ? <CaretUp size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          : <CaretDown size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        }
      </button>

      {/* Expandable list */}
      {open && (
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {missedSessions.map(session => {
            const [h, m] = session.time.split(':').map(Number)
            const sessionDate = new Date()
            sessionDate.setHours(h, m, 0, 0)
            const diffMin = Math.floor((now.getTime() - sessionDate.getTime()) / 60000)
            const diffText = diffMin < 60
              ? `${diffMin} мин назад`
              : `${Math.floor(diffMin / 60)} ч назад`

            return (
              <div
                key={session.id}
                onClick={() => router.push(`/session/${session.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, margin: 0, color: 'var(--color-text)' }}>
                    {session.name} ({session.time})
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                    {diffText} · Выполнить сейчас?
                  </p>
                </div>
                <Play size={18} weight="fill" style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
