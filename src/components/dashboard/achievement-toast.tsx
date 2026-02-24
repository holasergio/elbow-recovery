'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/stores/app-store'
import { getAchievementById } from '@/data/achievements'
import { Confetti } from '@phosphor-icons/react'
import { haptic } from '@/lib/haptic'

export function AchievementToast() {
  const { unlockedAchievements } = useAppStore()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<{ name: string; xp: number } | null>(null)
  const prevCountRef = useRef(Object.keys(unlockedAchievements).length)

  useEffect(() => {
    const keys = Object.keys(unlockedAchievements)
    const currentCount = keys.length

    if (currentCount > prevCountRef.current) {
      // Find the newest achievement (highest timestamp)
      let newestId = ''
      let newestTime = 0
      for (const [id, ts] of Object.entries(unlockedAchievements)) {
        if (ts > newestTime) { newestTime = ts; newestId = id }
      }

      const def = getAchievementById(newestId)
      if (def) {
        setCurrent({ name: def.name, xp: def.xp })
        setVisible(true)
        haptic('milestone')

        const timer = setTimeout(() => setVisible(false), 4000)
        prevCountRef.current = currentCount
        return () => clearTimeout(timer)
      }
    }

    prevCountRef.current = currentCount
  }, [unlockedAchievements])

  if (!visible || !current) return null

  return (
    <div style={{
      position: 'fixed',
      top: 'calc(12px + env(safe-area-inset-top, 0px))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 300,
      animation: 'slide-up 0.4s ease-out',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 20px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-accent)',
        color: '#fff',
        boxShadow: 'var(--shadow-lg)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        <Confetti size={20} weight="fill" />
        <span>{current.name}</span>
        <span style={{ opacity: 0.8, fontWeight: 400 }}>+{current.xp} XP</span>
      </div>
    </div>
  )
}
