'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { ArrowDown, Play, Pause, Timer } from '@phosphor-icons/react'

const LS_KEY = 'hanging-tracker'

interface HangingState {
  isTracking: boolean
  startedAt: number // Date.now() when tracking started
  date: string // YYYY-MM-DD — reset if day changed
}

function loadHangingState(): HangingState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveHangingState(state: HangingState | null) {
  if (typeof window === 'undefined') return
  if (!state) {
    localStorage.removeItem(LS_KEY)
  } else {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  }
}

export function HangingTracker() {
  const today = new Date().toISOString().split('T')[0]
  const TARGET_HOURS = 6

  const dailyLog = useLiveQuery(
    () => db.dailyLogs.where('date').equals(today).first(),
    [today]
  )

  // Restore state from localStorage on mount
  const [isTracking, setIsTracking] = useState(() => {
    const saved = loadHangingState()
    // Only restore if same day
    return saved?.isTracking === true && saved.date === today
  })
  const [startedAt] = useState(() => {
    const saved = loadHangingState()
    if (saved?.isTracking && saved.date === today) return saved.startedAt
    return 0
  })
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const saved = loadHangingState()
    if (saved?.isTracking && saved.date === today) {
      return Math.floor((Date.now() - saved.startedAt) / 60000)
    }
    return 0
  })
  const [trackingStartedAt, setTrackingStartedAt] = useState(startedAt)

  // Timer tick — recalculate from wall clock
  useEffect(() => {
    if (!isTracking || !trackingStartedAt) return
    const tick = () => {
      setCurrentMinutes(Math.floor((Date.now() - trackingStartedAt) / 60000))
    }
    tick() // immediate
    const interval = setInterval(tick, 15000) // update every 15 sec
    return () => clearInterval(interval)
  }, [isTracking, trackingStartedAt])

  // Auto-save to DB every 5 minutes while tracking (crash protection)
  useEffect(() => {
    if (!isTracking || !trackingStartedAt) return
    const interval = setInterval(async () => {
      const addedMinutes = Math.floor((Date.now() - trackingStartedAt) / 60000)
      const savedH = dailyLog?.hangingHours ?? 0
      const newTotal = savedH + addedMinutes / 60
      if (dailyLog) {
        await db.dailyLogs.update(dailyLog.id!, { hangingHours: Math.round(newTotal * 10) / 10 })
      } else {
        await db.dailyLogs.add({
          date: today,
          hangingHours: Math.round((addedMinutes / 60) * 10) / 10,
          fineMotor: [],
          sessionsCompleted: 0,
        })
      }
      // Reset tracking anchor after saving (so we don't double-count)
      const newStart = Date.now()
      setTrackingStartedAt(newStart)
      setCurrentMinutes(0)
      saveHangingState({ isTracking: true, startedAt: newStart, date: today })
    }, 300000) // every 5 min
    return () => clearInterval(interval)
  }, [isTracking, trackingStartedAt, dailyLog, today])

  const savedHours = dailyLog?.hangingHours ?? 0
  const totalMinutes = Math.round(savedHours * 60) + currentMinutes
  const totalHours = totalMinutes / 60
  const progress = Math.min(100, (totalHours / TARGET_HOURS) * 100)

  const handleToggle = useCallback(async () => {
    if (isTracking) {
      // Stop tracking — save accumulated time to DB
      const addedMinutes = Math.floor((Date.now() - trackingStartedAt) / 60000)
      const newTotal = savedHours + addedMinutes / 60

      if (dailyLog) {
        await db.dailyLogs.update(dailyLog.id!, { hangingHours: Math.round(newTotal * 10) / 10 })
      } else {
        await db.dailyLogs.add({
          date: today,
          hangingHours: Math.round((addedMinutes / 60) * 10) / 10,
          fineMotor: [],
          sessionsCompleted: 0,
        })
      }
      setCurrentMinutes(0)
      setIsTracking(false)
      saveHangingState(null) // clear persisted state
    } else {
      const now = Date.now()
      setTrackingStartedAt(now)
      setIsTracking(true)
      saveHangingState({ isTracking: true, startedAt: now, date: today })
    }
  }, [isTracking, trackingStartedAt, savedHours, dailyLog, today])

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      padding: '14px 16px',
      marginTop: '12px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowDown size={24} weight="duotone" style={{ color: 'var(--color-info)' }} />
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>
              Свисание руки
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
              {totalHours.toFixed(1)} / {TARGET_HOURS} ч
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-full, 9999px)',
            backgroundColor: isTracking ? 'color-mix(in srgb, var(--color-warning) 15%, transparent)' : 'var(--color-primary)',
            color: isTracking ? 'var(--color-text)' : 'white',
            border: isTracking ? '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)' : 'none',
            fontWeight: 500,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {isTracking ? (
            <><Pause size={16} weight="fill" /> Стоп</>
          ) : (
            <><Play size={16} weight="fill" /> Свисает</>
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '6px',
        borderRadius: '3px',
        backgroundColor: 'var(--color-border)',
        overflow: 'hidden',
        marginTop: '12px',
      }}>
        <div style={{
          height: '100%',
          borderRadius: '3px',
          width: `${progress}%`,
          backgroundColor: progress >= 100 ? 'var(--color-primary)' : 'var(--color-info)',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {isTracking && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '8px',
        }}>
          <Timer size={14} weight="duotone" style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 500 }}>
            Отслеживается...
            {currentMinutes > 0 && ` +${currentMinutes} мин`}
          </span>
        </div>
      )}
    </div>
  )
}
