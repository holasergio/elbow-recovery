'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

export function useTodayData() {
  const today = new Date().toISOString().split('T')[0]

  const sessionsToday = useLiveQuery(
    () => db.exerciseSessions.where('date').equals(today).toArray(),
    [today]
  )

  const latestROM = useLiveQuery(
    () => db.romMeasurements.orderBy('date').reverse().first()
  )

  const supplementsToday = useLiveQuery(
    () => db.supplementLogs.where('date').equals(today).toArray(),
    [today]
  )

  const painToday = useLiveQuery(
    () => db.painEntries.where('date').equals(today).toArray(),
    [today]
  )

  return {
    sessionsToday: sessionsToday ?? [],
    latestROM,
    supplementsToday: supplementsToday ?? [],
    painToday: painToday ?? [],
    isLoading: sessionsToday === undefined,
  }
}
