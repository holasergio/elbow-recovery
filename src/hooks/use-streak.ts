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

    // Build set of dates with at least 1 session
    const activeDates = new Set(sessions.map(s => s.date))
    const totalSessions = sessions.length
    const activeDays = activeDates.size

    // Walk backwards from today counting consecutive days
    let streak = 0
    const cursor = new Date()

    // Allow streak to count even if today has no session yet
    // (don't break streak if today hasn't started yet)
    for (let i = 0; i < 120; i++) {
      const dateStr = cursor.toISOString().split('T')[0]

      if (activeDates.has(dateStr)) {
        streak++
      } else if (i === 0) {
        // Today has no session yet — check yesterday to see if streak continues
        cursor.setDate(cursor.getDate() - 1)
        continue
      } else {
        break
      }
      cursor.setDate(cursor.getDate() - 1)
    }

    return { streak, totalSessions, activeDays }
  }, [sessions])
}
