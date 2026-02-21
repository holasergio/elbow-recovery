'use client'

import Link from 'next/link'
import { useTodayData } from '@/hooks/use-today-data'
import { dailySessions } from '@/data/schedule'
import { CheckCircle, Circle, Play } from '@phosphor-icons/react'

export function SessionList() {
  const { sessionsToday } = useTodayData()

  // Determine which sessions are completed (by sessionSlot)
  const completedSlots = new Set(sessionsToday.map(s => s.sessionSlot))

  // Find next uncompleted session
  const now = new Date()
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
        Сессии сегодня
      </h2>
      <div className="flex flex-col gap-2">
        {dailySessions.map((session) => {
          const isDone = completedSlots.has(session.id)
          const isPast = session.time < currentHHMM
          const isNext = !isDone && (!isPast || session.time >= currentHHMM)

          return (
            <Link
              key={session.id}
              href={`/session/${session.id}`}
              className="flex items-center gap-3 p-4 rounded-xl transition-all"
              style={{
                backgroundColor: isDone ? 'var(--color-primary-light)' : 'var(--color-surface)',
                border: isNext ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              }}
            >
              {isDone ? (
                <CheckCircle size={24} weight="fill" style={{ color: 'var(--color-primary)' }} />
              ) : (
                <Circle size={24} style={{ color: 'var(--color-text-muted)' }} />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: isDone ? 'var(--color-primary)' : 'var(--color-text)' }}>
                  {session.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {session.time} · {session.durationMin} мин · {session.steps.length} шагов
                </p>
              </div>
              {isNext && !isDone && (
                <Play size={20} weight="fill" style={{ color: 'var(--color-primary)' }} />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
