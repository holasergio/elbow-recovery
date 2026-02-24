'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useStreak } from '@/hooks/use-streak'
import { useRecoveryScore } from '@/hooks/use-recovery-score'
import { getCurrentPhase, getDaysSinceSurgery } from '@/data/patient'

export interface SmartTip {
  id: string
  text: string
  category: 'exercise' | 'sleep' | 'nutrition' | 'pain' | 'progress' | 'motivation'
  priority: number // 1 = highest
  icon: string
}

export function useSmartTips(): SmartTip[] {
  const today = new Date().toISOString().split('T')[0]
  const { streak } = useStreak()
  const score = useRecoveryScore()
  const days = getDaysSinceSurgery()
  const phase = getCurrentPhase()

  const since7 = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] })()

  const recentSleep = useLiveQuery(
    () => db.sleepLogs.where('date').between(since7, today, true, true).toArray(),
    [since7, today]
  )
  const recentPain = useLiveQuery(
    () => db.painEntries.where('date').between(since7, today, true, true).toArray(),
    [since7, today]
  )
  const recentSessions = useLiveQuery(
    () => db.exerciseSessions.where('date').between(since7, today, true, true).toArray(),
    [since7, today]
  )
  const recentROMs = useLiveQuery(
    () => db.romMeasurements.orderBy('date').reverse().limit(3).toArray()
  )

  return useMemo(() => {
    if (score.isLoading) return []

    const tips: SmartTip[] = []

    // Sleep analysis
    if (recentSleep && recentSleep.length >= 3) {
      const avgHours = recentSleep.reduce((s, l) => s + l.totalHours, 0) / recentSleep.length
      if (avgHours < 6.5) {
        tips.push({ id: 'sleep_low', text: `Средний сон ${avgHours.toFixed(1)}ч за неделю. Гормон роста выделяется в глубоком сне — старайся спать 7-8ч для лучшего сращения кости.`, category: 'sleep', priority: 1, icon: 'Moon' })
      }
      const lateNights = recentSleep.filter(s => {
        const h = parseInt(s.bedTime.split(':')[0])
        return h >= 0 && h < 6 ? true : h >= 23
      }).length
      if (lateNights >= 3) {
        tips.push({ id: 'sleep_late', text: 'Частые поздние отбои. Ложись до 23:00 — пик гормона роста приходится на 23:00-01:00.', category: 'sleep', priority: 2, icon: 'Clock' })
      }
    }

    // Pain trends
    if (recentPain && recentPain.length >= 3) {
      const avg = recentPain.reduce((s, p) => s + p.level, 0) / recentPain.length
      if (avg > 5) {
        tips.push({ id: 'pain_high', text: `Средняя боль ${avg.toFixed(1)}/10 за неделю — выше нормы. Проверь: не перегружаешь ли сустав? Используй лёд после сессий.`, category: 'pain', priority: 1, icon: 'Warning' })
      }
      // Check if pain is increasing
      const firstHalf = recentPain.slice(0, Math.floor(recentPain.length / 2))
      const secondHalf = recentPain.slice(Math.floor(recentPain.length / 2))
      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const avgFirst = firstHalf.reduce((s, p) => s + p.level, 0) / firstHalf.length
        const avgSecond = secondHalf.reduce((s, p) => s + p.level, 0) / secondHalf.length
        if (avgSecond - avgFirst > 1.5) {
          tips.push({ id: 'pain_rising', text: 'Боль растёт за последние дни. Снизь интенсивность упражнений и проконсультируйся с физиотерапевтом.', category: 'pain', priority: 1, icon: 'TrendUp' })
        }
      }
    }

    // Session consistency
    if (recentSessions) {
      const uniqueDays = new Set(recentSessions.map(s => s.date)).size
      if (uniqueDays < 4 && days > 14) {
        tips.push({ id: 'sessions_low', text: `Активных дней за неделю: ${uniqueDays}. Для фазы ${phase} рекомендуется ежедневная работа — даже 1 сессия лучше, чем пропуск.`, category: 'exercise', priority: 2, icon: 'Calendar' })
      }
    }

    // ROM plateau detection
    if (recentROMs && recentROMs.length >= 2) {
      const diffs = []
      for (let i = 0; i < recentROMs.length - 1; i++) {
        diffs.push(recentROMs[i].arc - recentROMs[i + 1].arc)
      }
      const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length
      if (Math.abs(avgDiff) < 2 && days > 30) {
        tips.push({ id: 'rom_plateau', text: 'ROM на плато. Попробуй: 1) увеличить время прогрева, 2) добавить статические растяжки, 3) обсудить с хирургом Low Load Long Duration (LLLD) протокол.', category: 'progress', priority: 2, icon: 'TrendUp' })
      }
    }

    // Streak motivation
    if (streak >= 5 && streak < 7) {
      tips.push({ id: 'streak_almost', text: `${streak} дней подряд — до недельного стрика осталось ${7 - streak}! Не останавливайся.`, category: 'motivation', priority: 3, icon: 'Fire' })
    }

    // Score-based tips
    if (score.sleep === 0) {
      tips.push({ id: 'no_sleep_log', text: 'Сон не залогирован сегодня. Данные о сне — 20 баллов к Recovery Score.', category: 'sleep', priority: 3, icon: 'Moon' })
    }
    if (score.rom === 0 && days > 14) {
      tips.push({ id: 'no_rom', text: 'Сегодня нет замера ROM. Регулярные замеры помогают отслеживать прогресс и мотивируют.', category: 'progress', priority: 3, icon: 'Ruler' })
    }

    // Sort by priority
    tips.sort((a, b) => a.priority - b.priority)
    return tips.slice(0, 3) // max 3 tips
  }, [score, recentSleep, recentPain, recentSessions, recentROMs, streak, days, phase])
}
