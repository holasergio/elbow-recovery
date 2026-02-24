'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getDaysSinceSurgery, getWeeksSinceSurgery } from '@/data/patient'
import { phases } from '@/data/phases'

export interface RecoveryForecast {
  currentArc: number | null
  projectedArc: number | null     // projected arc in 4 weeks
  weeklyGain: number              // avg degrees per week
  normalArc: number               // 130 degrees (functional norm for ORIF)
  weeksToFunctional: number | null // weeks until 100° arc (functional minimum)
  weeksToNormal: number | null     // weeks until 130° arc
  trajectory: 'ahead' | 'on_track' | 'behind' | 'unknown'
  phaseTarget: { min: number; max: number }
  isLoading: boolean
}

export function useRecoveryForecast(): RecoveryForecast {
  const weeks = getWeeksSinceSurgery()

  const allROMs = useLiveQuery(
    () => db.romMeasurements.orderBy('date').toArray()
  )

  return useMemo((): RecoveryForecast => {
    const phase = phases.find(p => weeks >= p.startWeek && weeks <= p.endWeek) ?? phases[phases.length - 1]
    const phaseTarget = phase.romTarget

    if (!allROMs || allROMs.length === 0) {
      return { currentArc: null, projectedArc: null, weeklyGain: 0, normalArc: 130, weeksToFunctional: null, weeksToNormal: null, trajectory: 'unknown', phaseTarget, isLoading: false }
    }

    const currentArc = allROMs[allROMs.length - 1].arc

    // Calculate weekly gain from ROM history
    let weeklyGain = 0
    if (allROMs.length >= 2) {
      const first = allROMs[0]
      const last = allROMs[allROMs.length - 1]
      const daysBetween = (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000
      if (daysBetween > 0) {
        weeklyGain = Math.round(((last.arc - first.arc) / daysBetween) * 7 * 10) / 10
      }
    }

    // Project 4 weeks ahead
    const projectedArc = weeklyGain > 0 ? Math.round(currentArc + weeklyGain * 4) : null

    // Weeks to functional (100°) and normal (130°)
    const weeksToFunctional = currentArc < 100 && weeklyGain > 0
      ? Math.ceil((100 - currentArc) / weeklyGain)
      : currentArc >= 100 ? 0 : null

    const weeksToNormal = currentArc < 130 && weeklyGain > 0
      ? Math.ceil((130 - currentArc) / weeklyGain)
      : currentArc >= 130 ? 0 : null

    // Determine trajectory vs phase target
    let trajectory: RecoveryForecast['trajectory'] = 'unknown'
    if (currentArc >= phaseTarget.max) {
      trajectory = 'ahead'
    } else if (currentArc >= phaseTarget.min) {
      trajectory = 'on_track'
    } else {
      trajectory = 'behind'
    }

    return { currentArc, projectedArc, weeklyGain, normalArc: 130, weeksToFunctional, weeksToNormal, trajectory, phaseTarget, isLoading: false }
  }, [allROMs, weeks])
}
