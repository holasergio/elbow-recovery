// ──────────────────────────────────────────────
// patient.ts — Данные пациента и вычисляемые
// параметры реабилитации
// ──────────────────────────────────────────────

export const patient = {
  name: 'Серж',
  age: 33,
  surgeryDate: '2026-01-05',
  injuryDate: '2025-12-24',
  targetArm: 'right' as const,
  initialROM: 30,
} as const

/**
 * Returns the effective surgery date: user-overridden (from store) or default from patient.
 */
export function getEffectiveSurgeryDate(): string {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('elbow-recovery-settings')
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { surgeryDate?: string | null } }
        if (parsed.state?.surgeryDate) return parsed.state.surgeryDate
      }
    } catch { /* ignore */ }
  }
  return patient.surgeryDate
}

/**
 * Количество дней с момента операции
 */
export function getDaysSinceSurgery(): number {
  const surgery = new Date(getEffectiveSurgeryDate())
  const today = new Date()
  return Math.floor(
    (today.getTime() - surgery.getTime()) / (1000 * 60 * 60 * 24)
  )
}

/**
 * Количество полных недель с момента операции
 */
export function getWeeksSinceSurgery(): number {
  return Math.floor(getDaysSinceSurgery() / 7)
}

/**
 * Текущая фаза реабилитации (1–5) на основе недель после операции
 */
export function getCurrentPhase(): number {
  const weeks = getWeeksSinceSurgery()
  if (weeks <= 6) return 1
  if (weeks <= 12) return 2
  if (weeks <= 20) return 3
  if (weeks <= 32) return 4
  return 5
}

/**
 * Количество дней с момента травмы
 */
export function getDaysSinceInjury(): number {
  const injury = new Date(patient.injuryDate)
  const today = new Date()
  return Math.floor(
    (today.getTime() - injury.getTime()) / (1000 * 60 * 60 * 24)
  )
}
