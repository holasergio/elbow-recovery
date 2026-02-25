'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getDaysSinceSurgery, getWeeksSinceSurgery } from '@/data/patient'
import { phases } from '@/data/phases'

// Физиологический максимум для пост-ORIF локтя: ~15°/нед (литература: Morrey 2000)
const PHYS_MAX_WEEKLY_GAIN = 15

export interface RecoveryForecast {
  currentArc: number | null
  projectedArc: number | null     // projected arc in 4 weeks (capped at 130°)
  weeklyGain: number              // avg degrees per week (physiologically capped)
  rawWeeklyGain: number           // uncapped raw calculation
  weeklyGainCapped: boolean       // true when raw > PHYS_MAX
  projectedCapped: boolean        // true when projection hit 130° ceiling
  normalArc: number               // 130 degrees (functional norm for ORIF)
  weeksToFunctional: number | null
  weeksToNormal: number | null
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
      return {
        currentArc: null, projectedArc: null,
        weeklyGain: 0, rawWeeklyGain: 0, weeklyGainCapped: false, projectedCapped: false,
        normalArc: 130, weeksToFunctional: null, weeksToNormal: null,
        trajectory: 'unknown', phaseTarget, isLoading: false,
      }
    }

    const currentArc = allROMs[allROMs.length - 1].arc

    // Рассчитываем недельный прирост из истории замеров.
    // Дуга (arc) = сгибание − дефицит разгибания.
    // Предпочитаем последние 21 день для актуального тренда; расширяем до 60 дней при нехватке точек.
    let rawWeeklyGain = 0
    if (allROMs.length >= 2) {
      const last = allROMs[allROMs.length - 1]
      const lastDate = new Date(last.date).getTime()
      const recentCutoff = lastDate - 21 * 86400000

      let recentROMs = allROMs.filter(r => new Date(r.date).getTime() >= recentCutoff)
      if (recentROMs.length < 2) {
        const widerCutoff = lastDate - 60 * 86400000
        recentROMs = allROMs.filter(r => new Date(r.date).getTime() >= widerCutoff)
      }

      if (recentROMs.length >= 2) {
        const baseROM = recentROMs[0]
        const daysBetween = (lastDate - new Date(baseROM.date).getTime()) / 86400000
        if (daysBetween >= 3) {
          rawWeeklyGain = Math.round(((last.arc - baseROM.arc) / daysBetween) * 7 * 10) / 10
        }
      }
    }

    // Физиологический кап: post-ORIF локоть не может восстанавливаться быстрее ~15°/нед.
    // Без капа единственный ранний замер (напр., 0° → 89° за 7 дней) даёт 89°/нед → прогноз 467°.
    const weeklyGainCapped = rawWeeklyGain > PHYS_MAX_WEEKLY_GAIN
    const weeklyGain = weeklyGainCapped
      ? PHYS_MAX_WEEKLY_GAIN
      : rawWeeklyGain

    // Прогноз через 4 недели — кап на анатомическом максимуме 130°
    const rawProjection = weeklyGain > 0 ? currentArc + weeklyGain * 4 : null
    const projectedRaw = rawProjection !== null ? Math.round(rawProjection) : null
    const projectedCapped = projectedRaw !== null && projectedRaw >= 130
    const projectedArc = projectedRaw !== null ? Math.min(projectedRaw, 130) : null

    // Недель до функциональной нормы (100°) и полной нормы (130°)
    const weeksToFunctional = currentArc < 100 && weeklyGain > 0
      ? Math.ceil((100 - currentArc) / weeklyGain)
      : currentArc >= 100 ? 0 : null

    const weeksToNormal = currentArc < 130 && weeklyGain > 0
      ? Math.ceil((130 - currentArc) / weeklyGain)
      : currentArc >= 130 ? 0 : null

    let trajectory: RecoveryForecast['trajectory'] = 'unknown'
    if (currentArc >= phaseTarget.max) {
      trajectory = 'ahead'
    } else if (currentArc >= phaseTarget.min) {
      trajectory = 'on_track'
    } else {
      trajectory = 'behind'
    }

    return {
      currentArc, projectedArc,
      weeklyGain, rawWeeklyGain, weeklyGainCapped, projectedCapped,
      normalArc: 130, weeksToFunctional, weeksToNormal,
      trajectory, phaseTarget, isLoading: false,
    }
  }, [allROMs, weeks])
}
