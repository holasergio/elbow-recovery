'use client'

import { WarningCircle } from '@phosphor-icons/react'
import type { RedFlag } from '@/lib/red-flags'

interface RedFlagAlertProps {
  flags: RedFlag[]
  onDismiss?: () => void
}

export function RedFlagAlert({ flags, onDismiss }: RedFlagAlertProps) {
  if (flags.length === 0) return null

  const redFlags = flags.filter((f) => f.severity === 'red')
  const yellowFlags = flags.filter((f) => f.severity === 'yellow')

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: 'var(--animate-slide-up)',
      }}
    >
      {redFlags.map((flag) => (
        <div
          key={flag.condition}
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'color-mix(in srgb, var(--color-error) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-error) 30%, transparent)',
          }}
        >
          <WarningCircle
            size={24}
            weight="duotone"
            style={{
              color: 'var(--color-error)',
              flexShrink: 0,
              marginTop: '1px',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-error)',
                marginBottom: '2px',
              }}
            >
              Внимание
            </p>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text)',
                lineHeight: 1.5,
              }}
            >
              {flag.message}
            </p>
          </div>
        </div>
      ))}

      {yellowFlags.map((flag) => (
        <div
          key={flag.condition}
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)',
          }}
        >
          <WarningCircle
            size={24}
            weight="duotone"
            style={{
              color: 'var(--color-warning)',
              flexShrink: 0,
              marginTop: '1px',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-warning)',
                marginBottom: '2px',
              }}
            >
              Рекомендация
            </p>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text)',
                lineHeight: 1.5,
              }}
            >
              {flag.message}
            </p>
          </div>
        </div>
      ))}

      {onDismiss && (
        <button
          onClick={onDismiss}
          type="button"
          style={{
            alignSelf: 'flex-end',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          Понятно
        </button>
      )}
    </div>
  )
}
