'use client'

import { useTodayData } from '@/hooks/use-today-data'
import { getCurrentPhase } from '@/data/patient'
import { phases } from '@/data/phases'

export function ROMBadge() {
  const { latestROM } = useTodayData()
  const phaseNum = getCurrentPhase()
  const phase = phases.find(p => p.number === phaseNum)
  const currentArc = latestROM?.arc ?? 30 // default to initial
  const targetMax = phase?.romTarget.max ?? 80

  return (
    <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)' }}>
      <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
        Амплитуда (ROM)
      </p>
      <div className="flex items-baseline gap-1 mt-1">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
          {currentArc}°
        </span>
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          / {targetMax}° цель
        </span>
      </div>
      {/* Simple progress bar */}
      <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-primary-light)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, (currentArc / targetMax) * 100)}%`,
            backgroundColor: 'var(--color-primary)',
          }}
        />
      </div>
    </div>
  )
}
