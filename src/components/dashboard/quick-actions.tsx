'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptic } from '@/lib/haptic'
import {
  Plus, X, Play, Ruler, Pill, Moon, Heartbeat, NotePencil, Wind,
} from '@phosphor-icons/react'

const actions = [
  { href: '/session/1', icon: Play, label: 'Сессия', color: 'var(--color-primary)' },
  { href: '/progress/rom', icon: Ruler, label: 'ROM', color: 'var(--color-info)' },
  { href: '/health/pain', icon: Heartbeat, label: 'Боль', color: 'var(--color-error)' },
  { href: '/health/supplements', icon: Pill, label: 'Добавки', color: 'var(--color-accent)' },
  { href: '/health/sleep', icon: Moon, label: 'Сон', color: 'var(--color-info)' },
  { href: '/health/journal', icon: NotePencil, label: 'Дневник', color: 'var(--color-accent)' },
  { href: '/health/breathing', icon: Wind, label: 'Дыхание', color: 'var(--color-primary)' },
]

export function QuickActions() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 998,
            backgroundColor: 'rgba(0,0,0,0.3)',
            animation: 'fade-in 0.2s ease-out',
          }}
        />
      )}

      {/* Action buttons — positioned above and to the left of FAB */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px) + 76px)',
          right: 72,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column-reverse',
          alignItems: 'flex-end',
          gap: 8,
          animation: 'slide-up 0.25s ease-out',
        }}>
          {actions.map((action, i) => (
            <button
              key={action.href}
              onClick={() => {
                haptic('light')
                setOpen(false)
                router.push(action.href)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)',
                cursor: 'pointer',
                animation: `slide-up 0.2s ease-out ${i * 0.03}s both`,
              }}
            >
              <action.icon size={18} weight="duotone" style={{ color: action.color }} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text)' }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { haptic('light'); setOpen(o => !o) }}
        style={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px) + 16px)',
          right: 16,
          zIndex: 1000,
          width: 52, height: 52,
          borderRadius: '50%',
          backgroundColor: open ? 'var(--color-text)' : 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s, background-color 0.2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {open ? <X size={22} weight="bold" /> : <Plus size={22} weight="bold" />}
      </button>
    </>
  )
}
