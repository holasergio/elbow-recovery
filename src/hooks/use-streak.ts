'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

/**
 * Returns current active streak (consecutive days with ≥1 session, ending today or yesterday)
 * and total sessions count.
 */
export function useStreak() {
  const today = new Date().toISOString().split('T')[0]

  // Query all sessions in last 120 days (wide window to catch long streaks)
  const since = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 120)
    return d.toISOString().split('T')[0]
  })()

  const sessions = useLiveQuery(
    () => db.exerciseSessions.where('date').between(since, today, true, true).toArray(),
    [since, today]
  )

  return useMemo(() => {
    if (!sessions) return { streak: 0, totalSessions: 0, activeDays: 0 }

    const activeDates = new Set(sessions.map(s => s.date))
    const totalSessions = sessions.length
    const activeDays = activeDates.size

    // If today has no session yet, start counting from yesterday
    // (don't break the streak if today hasn't been done yet)
    const startOffset = activeDates.has(today) ? 0 : 1

    let streak = 0
    for (let i = startOffset; i < 120; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      if (activeDates.has(dateStr)) {
        streak++
      } else {
        break
      }
    }

    return { streak, totalSessions, activeDays }
  }, [sessions, today])
}
