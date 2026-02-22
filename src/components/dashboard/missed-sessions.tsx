'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { dailySessions } from '@/data/schedule'
import { WarningCircle, Play } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

export function MissedSessions() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const todaySessions = useLiveQuery(
    () => db.exerciseSessions.where('date').equals(today).toArray(),
    [today]
  )

  const missedSessions = useMemo(() => {
    if (!todaySessions) return []

    const now = new Date()
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()
    const currentTimeMin = currentHour * 60 + currentMin

    // Get completed session slots
    const completedSlots = new Set(todaySessions.map(s => s.sessionSlot))

    return dailySessions.filter(session => {
      const [h, m] = session.time.split(':').map(Number)
      const sessionTimeMin = h * 60 + m
      // Session is missed if time has passed (with 30min grace) and not completed
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
      padding: '14px 16px',
      marginTop: '12px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
      }}>
        <WarningCircle size={20} weight="duotone" style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
        <span style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--color-text)',
        }}>
          {missedSessions.length === 1 ? 'Пропущена сессия' : `Пропущено ${missedSessions.length} сессии`}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
              <Play size={20} weight="fill" style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
