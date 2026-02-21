'use client'

import { getDaysSinceSurgery, getWeeksSinceSurgery, getCurrentPhase } from '@/data/patient'
import { phases } from '@/data/phases'

export function DayCounter() {
  const days = getDaysSinceSurgery()
  const weeks = getWeeksSinceSurgery()
  const phaseNum = getCurrentPhase()
  const phase = phases.find(p => p.number === phaseNum)

  return (
    <div className="py-6">
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Неделя {weeks}
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 600 }}>
        День {days}
      </h1>
      {phase && (
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
             style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
          Фаза {phase.number}: {phase.name}
        </div>
      )}
    </div>
  )
}
