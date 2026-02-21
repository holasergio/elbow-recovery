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
  { week: 6, arc: 30 },
  { week: 12, arc: 90 },
  { week: 20, arc: 115 },
  { week: 32, arc: 130 },
  { week: 52, arc: 140 },
]

const averageKeys: ScenarioPoint[] = [
  { week: 0, arc: 0 },
  { week: 6, arc: 20 },
  { week: 12, arc: 70 },
  { week: 20, arc: 95 },
  { week: 32, arc: 110 },
  { week: 52, arc: 125 },
]

const conservativeKeys: ScenarioPoint[] = [
  { week: 0, arc: 0 },
  { week: 6, arc: 10 },
  { week: 12, arc: 50 },
  { week: 20, arc: 75 },
  { week: 32, arc: 90 },
  { week: 52, arc: 105 },
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
