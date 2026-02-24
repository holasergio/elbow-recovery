'use client'

import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { supplements } from '@/data/supplements'
import { useAppStore } from '@/stores/app-store'
import { useStreak } from '@/hooks/use-streak'
import { useRecoveryScore } from '@/hooks/use-recovery-score'

export function useAchievementChecker() {
  const today = new Date().toISOString().split('T')[0]
  const { streak, totalSessions } = useStreak()
  const score = useRecoveryScore()

  const { unlockedAchievements, unlockAchievement, replenishStreakFreeze } = useAppStore()

  // Today's data
  const sessionsToday = useLiveQuery(
    () => db.exerciseSessions.where('date').equals(today).toArray(),
    [today]
  )

  const supplementsToday = useLiveQuery(
    () => db.supplementLogs.where('date').equals(today).filter(l => l.taken).toArray(),
    [today]
  )

  const latestROM = useLiveQuery(
    () => db.romMeasurements.orderBy('date').reverse().first()
  )

  const romToday = useLiveQuery(
    () => db.romMeasurements.where('date').equals(today).first(),
    [today]
  )

  // Sleep last 7 days
  const since7 = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })()
  const recentSleep = useLiveQuery(
    () => db.sleepLogs.where('date').between(since7, today, true, true).toArray(),
    [since7, today]
  )

  // Supplement adherence last 7 days
  const recentSupLogs = useLiveQuery(
    () => db.supplementLogs.where('date').between(since7, today, true, true).filter(l => l.taken).toArray(),
    [since7, today]
  )

  useEffect(() => {
    if (score.isLoading || sessionsToday === undefined) return

    function tryUnlock(id: string, xp: number) {
      if (!unlockedAchievements[id]) {
        unlockAchievement(id, xp)
      }
    }

    const totalSupplements = supplements.length

    // -- Streak achievements --
    if (streak >= 3)  tryUnlock('streak_3', 30)
    if (streak >= 7)  tryUnlock('streak_7', 70)
    if (streak >= 14) tryUnlock('streak_14', 150)
    if (streak >= 30) tryUnlock('streak_30', 300)

    // -- Session achievements --
    if (totalSessions >= 1)  tryUnlock('first_session', 20)
    if (totalSessions >= 50) tryUnlock('sessions_50', 200)

    const todaySlots = new Set(sessionsToday?.map(s => s.sessionSlot) ?? [])
    if (todaySlots.size >= 5) tryUnlock('all_5_today', 100)

    // -- Supplement achievements --
    const takenToday = supplementsToday?.length ?? 0
    if (takenToday >= totalSupplements) tryUnlock('sups_perfect_day', 50)

    // 7 days all supplements
    if (recentSupLogs && recentSleep) {
      const supsByDate = new Map<string, number>()
      for (const log of recentSupLogs) {
        supsByDate.set(log.date, (supsByDate.get(log.date) ?? 0) + 1)
      }
      let perfectDays = 0
      for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        if ((supsByDate.get(dateStr) ?? 0) >= totalSupplements) perfectDays++
      }
      if (perfectDays >= 7) tryUnlock('sups_7_days', 150)
    }

    // -- ROM achievements --
    if (romToday) tryUnlock('rom_first', 20)
    if (latestROM && latestROM.flexion >= 90)  tryUnlock('rom_90', 250)
    if (latestROM && latestROM.flexion >= 120) tryUnlock('rom_120', 500)

    // -- Sleep achievements --
    if (recentSleep && recentSleep.length >= 7) {
      const allGoodSleep = recentSleep.every(s => s.totalHours >= 7)
      if (allGoodSleep) tryUnlock('sleep_7h_week', 100)
    }

    // -- Score achievements --
    if (score.total >= 80)  tryUnlock('score_80', 80)
    if (score.total >= 100) tryUnlock('score_100', 300)

    // -- Streak freeze replenishment --
    if (streak > 0 && streak % 7 === 0) {
      replenishStreakFreeze()
    }
  }, [
    streak, totalSessions, sessionsToday, supplementsToday,
    latestROM, romToday, recentSleep, recentSupLogs,
    score, unlockedAchievements, unlockAchievement, replenishStreakFreeze,
  ])
}
