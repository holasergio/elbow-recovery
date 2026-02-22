'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { ArrowDown, Play, Pause, Timer } from '@phosphor-icons/react'

export function HangingTracker() {
  const today = new Date().toISOString().split('T')[0]
  const TARGET_HOURS = 6

  const dailyLog = useLiveQuery(
    () => db.dailyLogs.where('date').equals(today).first(),
    [today]
  )

  const [isTracking, setIsTracking] = useState(false)
  const [currentMinutes, setCurrentMinutes] = useState(0)
  const startTimeRef = useRef<number>(0)

  // Timer tick
  useEffect(() => {
    if (!isTracking) return
    startTimeRef.current = Date.now()
    const interval = setInterval(() => {
      setCurrentMinutes(Math.floor((Date.now() - startTimeRef.current) / 60000))
    }, 30000) // update every 30 sec
    return () => clearInterval(interval)
  }, [isTracking])

  const savedHours = dailyLog?.hangingHours ?? 0
  const totalMinutes = Math.round(savedHours * 60) + currentMinutes
  const totalHours = totalMinutes / 60
  const progress = Math.min(100, (totalHours / TARGET_HOURS) * 100)

  const handleToggle = useCallback(async () => {
    if (isTracking) {
      // Stop tracking — save accumulated time
      const addedMinutes = Math.floor((Date.now() - startTimeRef.current) / 60000)
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
    } else {
      setIsTracking(true)
    }
  }, [isTracking, savedHours, dailyLog, today])

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
