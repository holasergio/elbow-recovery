'use client'

import { useEffect, useState } from 'react'
import { X } from '@phosphor-icons/react'
import type { InAppNotification, NotificationType } from '@/lib/notifications'

// ─── Type-based color scheme ─────────────────────────────────────────

const typeColors: Record<NotificationType, { bg: string; border: string; icon: string }> = {
  session: {
    bg: 'var(--color-primary)',
    border: 'var(--color-primary)',
    icon: 'var(--color-surface)',
  },
  supplement: {
    bg: 'var(--color-accent)',
    border: 'var(--color-accent)',
    icon: 'var(--color-surface)',
  },
  sleep: {
    bg: 'var(--color-info)',
    border: 'var(--color-info)',
    icon: 'var(--color-surface)',
  },
  rom: {
    bg: 'var(--color-text-secondary)',
    border: 'var(--color-text-secondary)',
    icon: 'var(--color-surface)',
  },
  general: {
    bg: 'var(--color-text)',
    border: 'var(--color-text)',
    icon: 'var(--color-surface)',
  },
}

const typeLabels: Record<NotificationType, string> = {
  session: 'Тренировка',
  supplement: 'Добавки',
  sleep: 'Сон',
  rom: 'Амплитуда',
  general: 'Уведомление',
}

// ─── Auto-dismiss duration ───────────────────────────────────────────

const AUTO_DISMISS_MS = 8_000

// ─── Component ───────────────────────────────────────────────────────

interface NotificationToastProps {
  notification: InAppNotification
  onDismiss: () => void
}

export function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const colors = typeColors[notification.type]

  // Slide in
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Auto-dismiss
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss()
    }, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleDismiss() {
    setExiting(true)
    setTimeout(() => {
      onDismiss()
    }, 300)
  }

  const transform = visible && !exiting ? 'translateY(0)' : 'translateY(-120%)'
  const opacity = visible && !exiting ? 1 : 0

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: 'var(--color-surface)',
        borderRadius: '14px',
        borderLeft: `4px solid ${colors.border}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        transform,
        opacity,
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
        willChange: 'transform, opacity',
        cursor: 'pointer',
      }}
      onClick={handleDismiss}
    >
      {/* Color dot */}
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: colors.bg,
          marginTop: '5px',
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 500,
              color: colors.bg,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {typeLabels[notification.type]}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
            }}
          >
            {new Date(notification.timestamp).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text)',
            lineHeight: 1.3,
            marginBottom: '2px',
          }}
        >
          {notification.title}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.4,
          }}
        >
          {notification.body}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        aria-label="Закрыть уведомление"
        onClick={(e) => {
          e.stopPropagation()
          handleDismiss()
        }}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          marginTop: '-2px',
          marginRight: '-4px',
        }}
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  )
}
