'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getCurrentPhase, getDaysSinceSurgery } from '@/data/patient'
import { getExercisesForPhase } from '@/data/exercises'
import { TrendUp, Target, Fire } from '@phosphor-icons/react'

export function Motivation() {
  const today = new Date().toISOString().split('T')[0]

  // Get recent ROM data (last 2 measurements)
  const recentROMs = useLiveQuery(
    () => db.romMeasurements.orderBy('date').reverse().limit(2).toArray(),
    []
  )

  // Get this week's sessions
  const weekStart = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + 1) // Monday
    return d.toISOString().split('T')[0]
  }, [])

  const weekSessions = useLiveQuery(
    () => db.exerciseSessions.where('date').aboveOrEqual(weekStart).toArray(),
    [weekStart]
  )

  // Calculate streak
  const streak = useMemo(() => {
    if (!weekSessions) return 0
    const dates = new Set(weekSessions.map(s => s.date))
    let count = 0
    const d = new Date()
    for (let i = 0; i < 30; i++) {
      const dateStr = d.toISOString().split('T')[0]
      if (dates.has(dateStr) || (i === 0 && dateStr === today)) {
        count++
      } else if (i > 0) {
        break
      }
      d.setDate(d.getDate() - 1)
    }
    return count
  }, [weekSessions, today])

  const message = useMemo(() => {
    if (!recentROMs || recentROMs.length === 0) {
      const days = getDaysSinceSurgery()
      return { text: `День ${days}. Каждая сессия приближает к восстановлению.`, icon: 'target' as const }
    }

    // ROM progress
    if (recentROMs.length >= 2) {
      const latest = recentROMs[0]
      const previous = recentROMs[1]
      const delta = latest.arc - previous.arc

      if (delta > 0) {
        return { text: `+${delta}° с последнего замера. Прогресс!`, icon: 'trend' as const }
      }
      if (delta === 0) {
        return { text: 'Амплитуда стабильна. Проверь: тепло перед сессией? Сон до 23:00?', icon: 'target' as const }
      }
    }

    // Streak
    if (streak >= 3) {
      return { text: `Серия: ${streak} дней подряд без пропусков!`, icon: 'fire' as const }
    }

    // Default
    const phase = getCurrentPhase()
    const exerciseCount = getExercisesForPhase(phase).length
    return { text: `Фаза ${phase}: ${exerciseCount} упражнений в протоколе. Каждое важно.`, icon: 'target' as const }
  }, [recentROMs, streak])

  if (!message) return null

  const Icon = message.icon === 'trend' ? TrendUp : message.icon === 'fire' ? Fire : Target

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--color-primary-light)',
      marginTop: '10px',
    }}>
      <Icon size={18} weight="duotone" style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-primary)',
        margin: 0,
        fontWeight: 500,
        lineHeight: 1.4,
      }}>
        {message.text}
      </p>
    </div>
  )
}
