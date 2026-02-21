'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, Barbell, ChartLineUp, Heart, GearSix } from '@phosphor-icons/react'

const tabs = [
  { href: '/', label: 'Сегодня', icon: House },
  { href: '/session', label: 'Сессия', icon: Barbell },
  { href: '/progress', label: 'Прогресс', icon: ChartLineUp },
  { href: '/health', label: 'Здоровье', icon: Heart },
  { href: '/settings', label: 'Настройки', icon: GearSix },
] as const

export function BottomTabs() {
  const pathname = usePathname()

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
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors"
              style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
            >
              <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
