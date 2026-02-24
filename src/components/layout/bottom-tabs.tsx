'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { House, ListChecks, ChartLineUp, Heart, GearSix } from '@phosphor-icons/react'
import { db } from '@/lib/db'
import { dailySessions } from '@/data/schedule'

const tabs = [
  { href: '/', label: 'Сегодня', icon: House },
  { href: '/exercises', label: 'Упражнения', icon: ListChecks },
  { href: '/progress', label: 'Прогресс', icon: ChartLineUp },
  { href: '/health', label: 'Здоровье', icon: Heart },
  { href: '/settings', label: 'Настройки', icon: GearSix },
] as const

function useMissedCount(): number {
  const today = new Date().toISOString().split('T')[0]
  const [now, setNow] = useState(() => new Date())

  // Update current time every 60s so badge reflects newly missed sessions
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const todaySessions = useLiveQuery(
    () => db.exerciseSessions.where('date').equals(today).toArray(),
    [today]
  )

  return useMemo(() => {
    if (!todaySessions) return 0
    const currentTimeMin = now.getHours() * 60 + now.getMinutes()
    const completedSlots = new Set(todaySessions.map(s => s.sessionSlot))
    return dailySessions.filter(session => {
      const [h, m] = session.time.split(':').map(Number)
      return (currentTimeMin > h * 60 + m + 30) && !completedSlots.has(session.id)
    }).length
  }, [todaySessions, now])
}

export function BottomTabs() {
  const pathname = usePathname()
  const missedCount = useMissedCount()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t"
         style={{
           backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
           backdropFilter: 'blur(20px)',
           WebkitBackdropFilter: 'blur(20px)',
           borderColor: 'var(--color-border)',
           paddingBottom: 'env(safe-area-inset-bottom, 0px)',
         }}>
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          const showBadge = href === '/' && missedCount > 0

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors"
              style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)', position: 'relative' }}
            >
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                {showBadge && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -6,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-warning)',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}>
                    {missedCount > 9 ? '9+' : missedCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
