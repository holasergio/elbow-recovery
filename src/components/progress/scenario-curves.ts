// ──────────────────────────────────────────────
// scenario-curves.ts — 3 recovery scenario curves
// for ROM arc progress visualization
// ──────────────────────────────────────────────

export interface ScenarioPoint {
  week: number
  arc: number
}

// Key data points for each scenario
const optimisticKeys: ScenarioPoint[] = [
  { week: 0, arc: 0 },
  { week: 2, arc: 10 },
  { week: 4, arc: 20 },
  { week: 6, arc: 35 },
  { week: 8, arc: 55 },
  { week: 10, arc: 70 },
  { week: 12, arc: 85 },
  { week: 16, arc: 100 },
  { week: 20, arc: 110 },
  { week: 26, arc: 120 },
  { week: 32, arc: 125 },
  { week: 52, arc: 130 },
]

const averageKeys: ScenarioPoint[] = [
  { week: 0, arc: 0 },
  { week: 2, arc: 5 },
  { week: 4, arc: 15 },
  { week: 6, arc: 25 },
  { week: 8, arc: 35 },
  { week: 10, arc: 45 },
  { week: 12, arc: 55 },
  { week: 16, arc: 70 },
  { week: 20, arc: 80 },
  { week: 26, arc: 90 },
  { week: 32, arc: 95 },
  { week: 40, arc: 100 },
  { week: 52, arc: 105 },
]

const conservativeKeys: ScenarioPoint[] = [
  { week: 0, arc: 0 },
  { week: 2, arc: 5 },
  { week: 4, arc: 10 },
  { week: 6, arc: 15 },
  { week: 8, arc: 25 },
  { week: 10, arc: 30 },
  { week: 12, arc: 35 },
  { week: 16, arc: 45 },
  { week: 20, arc: 55 },
  { week: 26, arc: 60 },
  { week: 32, arc: 70 },
  { week: 40, arc: 85 },
  { week: 52, arc: 90 },
]

/**
 * Linear interpolation between key data points,
 * generating a point every 2 weeks for smooth curves.
 */
function interpolate(keys: ScenarioPoint[]): ScenarioPoint[] {
  const result: ScenarioPoint[] = []
  const maxWeek = keys[keys.length - 1].week

  for (let week = 0; week <= maxWeek; week += 2) {
    // Find the two key points that bracket this week
    let lower = keys[0]
    let upper = keys[keys.length - 1]

    for (let i = 0; i < keys.length - 1; i++) {
      if (week >= keys[i].week && week <= keys[i + 1].week) {
        lower = keys[i]
        upper = keys[i + 1]
        break
      }
    }

    if (lower.week === upper.week) {
      result.push({ week, arc: lower.arc })
    } else {
      const t = (week - lower.week) / (upper.week - lower.week)
      // Ease-out interpolation for more natural recovery curve
      const eased = 1 - (1 - t) * (1 - t)
      const arc = Math.round(lower.arc + (upper.arc - lower.arc) * eased)
      result.push({ week, arc })
    }
  }

  // Ensure all key points are included exactly
  for (const key of keys) {
    const existing = result.find((p) => p.week === key.week)
    if (existing) {
      existing.arc = key.arc
    } else {
      result.push(key)
      result.sort((a, b) => a.week - b.week)
    }
  }

  return result
}

export const optimisticCurve: ScenarioPoint[] = interpolate(optimisticKeys)
export const averageCurve: ScenarioPoint[] = interpolate(averageKeys)
export const conservativeCurve: ScenarioPoint[] = interpolate(conservativeKeys)

export interface FunctionalMilestone {
  arc: number
  label: string
}

export const functionalMilestones: FunctionalMilestone[] = [
  { arc: 30, label: 'Клавиатура' },
  { arc: 50, label: 'Руль авто' },
  { arc: 60, label: 'Вилка/ложка' },
  { arc: 80, label: 'Расчёска' },
  { arc: 100, label: 'Функц. минимум' },
  { arc: 120, label: 'Телефон к уху' },
  { arc: 140, label: 'Полная норма' },
]
