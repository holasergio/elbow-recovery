'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getTodayChallenges, type DailyChallenge } from '@/data/daily-challenges'
import { supplements } from '@/data/supplements'
import { useRecoveryScore } from '@/hooks/use-recovery-score'
import { useAppStore } from '@/stores/app-store'
import { haptic } from '@/lib/haptic'
import {
  Lightning, Trophy, Pill, Moon, Ruler, NotePencil, Smiley, Wind, Target,
  CheckCircle,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const iconMap: Record<string, Icon> = { Lightning, Trophy, Pill, Moon, Ruler, NotePencil, Smiley, Wind, Target }

export function DailyChallengeCard() {
  const today = new Date().toISOString().split('T')[0]
  const challenges = useMemo(() => getTodayChallenges(), [today])
  const score = useRecoveryScore()
  const { unlockAchievement } = useAppStore()

  const sessionsToday = useLiveQuery(
    () => db.exerciseSessions.where('date').equals(today).toArray(),
    [today]
  )
  const supplementsToday = useLiveQuery(
    () => db.supplementLogs.where('date').equals(today).filter(l => l.taken).toArray(),
    [today]
  )
  const sleepToday = useLiveQuery(
    () => db.sleepLogs.where('date').equals(today).first(),
    [today]
  )
  const romToday = useLiveQuery(
    () => db.romMeasurements.where('date').equals(today).first(),
    [today]
  )
  const journalToday = useLiveQuery(
    () => db.journalEntries.where('date').equals(today).first(),
    [today]
  )
  const moodToday = useLiveQuery(
    () => db.moodEntries.where('date').equals(today).first(),
    [today]
  )

  const completedMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    const slots = new Set(sessionsToday?.map(s => s.sessionSlot) ?? [])
    const takenCount = supplementsToday?.length ?? 0

    for (const ch of challenges) {
      switch (ch.condition) {
        case 'sessions_3': map[ch.id] = slots.size >= 3; break
        case 'all_5_sessions': map[ch.id] = slots.size >= 5; break
        case 'all_supplements': map[ch.id] = takenCount >= supplements.length; break
        case 'sleep_7h': map[ch.id] = (sleepToday?.totalHours ?? 0) >= 7; break
        case 'rom_measure': map[ch.id] = !!romToday; break
        case 'journal_entry': map[ch.id] = !!journalToday; break
        case 'mood_log': map[ch.id] = !!moodToday; break
        case 'breathing': map[ch.id] = false; break // checked via localStorage
        case 'score_70': map[ch.id] = score.total >= 70; break
        default: map[ch.id] = false
      }
    }
    return map
  }, [challenges, sessionsToday, supplementsToday, sleepToday, romToday, journalToday, moodToday, score])

  // Check localStorage for breathing
  if (typeof window !== 'undefined') {
    const breathingKey = `breathing_${today}`
    for (const ch of challenges) {
      if (ch.condition === 'breathing' && localStorage.getItem(breathingKey)) {
        completedMap[ch.id] = true
      }
    }
  }

  const completedCount = challenges.filter(ch => completedMap[ch.id]).length

  return (
    <div style={{
      padding: 16,
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      marginTop: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lightning size={16} weight="duotone" style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Челленджи дня
          </span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600,
          color: completedCount === 3 ? 'var(--color-success)' : 'var(--color-text-muted)',
        }}>
          {completedCount}/3
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {challenges.map(ch => {
          const done = completedMap[ch.id]
          const IconComp = iconMap[ch.icon] || Lightning
          return (
            <div key={ch.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: done ? 'color-mix(in srgb, var(--color-success) 8%, transparent)' : 'var(--color-surface-alt)',
              border: `1px solid ${done ? 'color-mix(in srgb, var(--color-success) 20%, transparent)' : 'var(--color-border)'}`,
              opacity: done ? 0.85 : 1,
            }}>
              {done
                ? <CheckCircle size={18} weight="fill" style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                : <IconComp size={18} weight="duotone" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontSize: 13, fontWeight: 500,
                  color: done ? 'var(--color-success)' : 'var(--color-text)',
                  textDecoration: done ? 'line-through' : 'none',
                }}>
                  {ch.title}
                </span>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '1px 0 0' }}>
                  {ch.description}
                </p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: done ? 'var(--color-success)' : 'var(--color-accent)', flexShrink: 0 }}>
                +{ch.xpReward}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
