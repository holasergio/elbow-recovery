'use client'

import { useSWUpdate } from './sw-register'
import { ArrowClockwise } from '@phosphor-icons/react'

export function UpdatePrompt() {
  const { updateAvailable, applyUpdate } = useSWUpdate()

  if (!updateAvailable) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '72px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        boxShadow: 'var(--shadow-lg)',
        cursor: 'pointer',
        animation: 'slide-up 0.4s ease-out',
        whiteSpace: 'nowrap',
      }}
      onClick={applyUpdate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') applyUpdate() }}
    >
      <ArrowClockwise size={18} weight="bold" />
      <span>Обновить приложение</span>
    </div>
  )
}
