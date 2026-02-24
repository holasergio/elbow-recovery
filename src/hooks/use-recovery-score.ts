'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { supplements } from '@/data/supplements'

export interface RecoveryScore {
  total: number           // 0-100
  sessions: number        // 0-30
  supplements: number     // 0-20
  sleep: number           // 0-20
  pain: number            // 0-15
  rom: number             // 0-15
  isLoading: boolean
}

export function useRecoveryScore(): RecoveryScore {
  const today = new Date().toISOString().split('T')[0]

  const sessionsToday = useLiveQuery(
    () => db.exerciseSessions.where('date').equals(today).toArray(),
    [today]
  )
  const supplementsToday = useLiveQuery(
    () => db.supplementLogs.where('date').equals(today).filter(l => l.taken).toArray(),
    [today]
  )
  const sleepToday = useLiveQuery(
    () => db.sleepLogs.where('date').equals(today).first(),
    [today]
  )
  const painToday = useLiveQuery(
    () => db.painEntries.where('date').equals(today).toArray(),
    [today]
  )
  const romToday = useLiveQuery(
    () => db.romMeasurements.where('date').equals(today).first(),
    [today]
  )

  return useMemo(() => {
    const isLoading = sessionsToday === undefined

    if (isLoading) {
      return { total: 0, sessions: 0, supplements: 0, sleep: 0, pain: 0, rom: 0, isLoading: true }
    }

    // Sessions: unique completed slots / 5 * 30
    const completedSlots = new Set(sessionsToday!.map(s => s.sessionSlot)).size
    const sessionsScore = Math.round((completedSlots / 5) * 30)

    // Supplements: taken / total * 20
    const takenCount = supplementsToday?.length ?? 0
    const totalCount = supplements.length
    const supplementsScore = totalCount > 0 ? Math.round((takenCount / totalCount) * 20) : 0

    // Sleep: 20 if logged >= 7h, 10 if logged < 7h, 0 if not logged
    let sleepScore = 0
    if (sleepToday) {
      sleepScore = sleepToday.totalHours >= 7 ? 20 : 10
    }

    // Pain: 15 if no entries or avg <= 3, scaled down for higher pain
    let painScore = 15
    if (painToday && painToday.length > 0) {
      const avg = painToday.reduce((sum, p) => sum + p.level, 0) / painToday.length
      if (avg <= 3) painScore = 15
      else if (avg <= 5) painScore = 10
      else if (avg <= 7) painScore = 5
      else painScore = 0
    }

    // ROM: 15 if measured today
    const romScore = romToday ? 15 : 0

    const total = sessionsScore + supplementsScore + sleepScore + painScore + romScore

    return {
      total,
      sessions: sessionsScore,
      supplements: supplementsScore,
      sleep: sleepScore,
      pain: painScore,
      rom: romScore,
      isLoading: false,
    }
  }, [sessionsToday, supplementsToday, sleepToday, painToday, romToday])
}
