'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

export interface SleepPainInsight {
  hasData: boolean
  poorSleepAvgPain: number   // avg pain on days with <6h sleep
  goodSleepAvgPain: number   // avg pain on days with ≥6h sleep
  difference: number          // goodSleepAvgPain - poorSleepAvgPain (negative = better with sleep)
  poorSleepDays: number
  goodSleepDays: number
}

export interface WeeklyStats {
  sessionsThisWeek: number
  sessionsLastWeek: number
  romThisWeek: number | null    // latest ROM arc this week
  romLastWeek: number | null    // latest ROM arc last week
  romDelta: number | null
  avgSleepHours: number | null  // this week
  avgPainThisWeek: number | null
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toDateStr(d)
}

export function useSleepPainInsight(): SleepPainInsight {
  const since = daysAgo(60)
  const today = toDateStr(new Date())

  const sleepLogs = useLiveQuery(
    () => db.sleepLogs.where('date').between(since, today, true, true).toArray(),
    [since, today]
  )
  const sessions = useLiveQuery(
    () => db.exerciseSessions.where('date').between(since, today, true, true).toArray(),
    [since, today]
  )

  return useMemo((): SleepPainInsight => {
    if (!sleepLogs || !sessions || sleepLogs.length < 4) {
      return { hasData: false, poorSleepAvgPain: 0, goodSleepAvgPain: 0, difference: 0, poorSleepDays: 0, goodSleepDays: 0 }
    }

    // Build date → avg pain map from sessions that have painBefore/painAfter
    const painByDate = new Map<string, number[]>()
    for (const s of sessions) {
      const pains = []
      if (s.painBefore != null) pains.push(s.painBefore)
      if (s.painAfter != null) pains.push(s.painAfter)
      if (pains.length > 0) {
        const existing = painByDate.get(s.date) ?? []
        painByDate.set(s.date, [...existing, ...pains])
      }
    }

    const poorSleepPains: number[] = []
    const goodSleepPains: number[] = []

    for (const log of sleepLogs) {
      const dayPains = painByDate.get(log.date)
      if (!dayPains || dayPains.length === 0) continue
      const avgPain = dayPains.reduce((a, b) => a + b, 0) / dayPains.length
      if (log.totalHours < 6) {
        poorSleepPains.push(avgPain)
      } else {
        goodSleepPains.push(avgPain)
      }
    }

    if (poorSleepPains.length === 0 || goodSleepPains.length === 0) {
      return { hasData: false, poorSleepAvgPain: 0, goodSleepAvgPain: 0, difference: 0, poorSleepDays: 0, goodSleepDays: 0 }
    }

    const poorAvg = poorSleepPains.reduce((a, b) => a + b, 0) / poorSleepPains.length
    const goodAvg = goodSleepPains.reduce((a, b) => a + b, 0) / goodSleepPains.length

    return {
      hasData: true,
      poorSleepAvgPain: Math.round(poorAvg * 10) / 10,
      goodSleepAvgPain: Math.round(goodAvg * 10) / 10,
      difference: Math.round((poorAvg - goodAvg) * 10) / 10,
      poorSleepDays: poorSleepPains.length,
      goodSleepDays: goodSleepPains.length,
    }
  }, [sleepLogs, sessions])
}

export function useWeeklyStats(): WeeklyStats {
  const thisWeekStart = daysAgo(6)
  const lastWeekStart = daysAgo(13)
  const lastWeekEnd = daysAgo(7)
  const today = toDateStr(new Date())

  const sessionsThisWeek = useLiveQuery(
    () => db.exerciseSessions.where('date').between(thisWeekStart, today, true, true).toArray(),
    [thisWeekStart, today]
  )
  const sessionsLastWeek = useLiveQuery(
    () => db.exerciseSessions.where('date').between(lastWeekStart, lastWeekEnd, true, true).toArray(),
    [lastWeekStart, lastWeekEnd]
  )
  const romThisWeek = useLiveQuery(
    () => db.romMeasurements.where('date').between(thisWeekStart, today, true, true).toArray(),
    [thisWeekStart, today]
  )
  const romLastWeek = useLiveQuery(
    () => db.romMeasurements.where('date').between(lastWeekStart, lastWeekEnd, true, true).toArray(),
    [lastWeekStart, lastWeekEnd]
  )
  const sleepThisWeek = useLiveQuery(
    () => db.sleepLogs.where('date').between(thisWeekStart, today, true, true).toArray(),
    [thisWeekStart, today]
  )

  return useMemo((): WeeklyStats => {
    const swCount = sessionsThisWeek?.length ?? 0
    const lwCount = sessionsLastWeek?.length ?? 0

    const romTW = romThisWeek && romThisWeek.length > 0
      ? Math.max(...romThisWeek.map(r => r.arc))
      : null
    const romLW = romLastWeek && romLastWeek.length > 0
      ? Math.max(...romLastWeek.map(r => r.arc))
      : null
    const romDelta = romTW !== null && romLW !== null ? romTW - romLW : null

    const sleepHours = sleepThisWeek && sleepThisWeek.length > 0
      ? Math.round((sleepThisWeek.reduce((a, b) => a + b.totalHours, 0) / sleepThisWeek.length) * 10) / 10
      : null

    // Reuse sessionsThisWeek for pain data (same query, no duplicate)
    const painEntries = sessionsThisWeek?.flatMap(s => {
      const p = []
      if (s.painBefore != null) p.push(s.painBefore)
      if (s.painAfter != null) p.push(s.painAfter)
      return p
    }) ?? []
    const avgPain = painEntries.length > 0
      ? Math.round((painEntries.reduce((a, b) => a + b, 0) / painEntries.length) * 10) / 10
      : null

    return {
      sessionsThisWeek: swCount,
      sessionsLastWeek: lwCount,
      romThisWeek: romTW,
      romLastWeek: romLW,
      romDelta,
      avgSleepHours: sleepHours,
      avgPainThisWeek: avgPain,
    }
  }, [sessionsThisWeek, sessionsLastWeek, romThisWeek, romLastWeek, sleepThisWeek])
}
