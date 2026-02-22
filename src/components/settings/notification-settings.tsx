'use client'

import { useState } from 'react'
import { Bell, BellSlash, Barbell, Pill, Moon, Ruler, WarningCircle } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/app-store'
import { requestNotificationPermission, canNotify } from '@/lib/notifications'

const CATEGORIES: Array<{
  key: 'sessions' | 'supplements' | 'sleep' | 'rom'
  label: string
  description: string
  Icon: typeof Barbell
}> = [
  { key: 'sessions', label: 'Тренировки', description: 'Напоминания о сессиях упражнений', Icon: Barbell },
  { key: 'supplements', label: 'Добавки', description: 'Приём витаминов и добавок', Icon: Pill },
  { key: 'sleep', label: 'Сон', description: 'Напоминание записать сон', Icon: Moon },
  { key: 'rom', label: 'ROM измерения', description: 'Еженедельное измерение амплитуды', Icon: Ruler },
]

function Toggle({
  checked,
  onChange,
  ariaLabel,
  activeColor,
}: {
  checked: boolean
  onChange: () => void
  ariaLabel: string
  activeColor?: string
}) {
  const color = activeColor || 'var(--color-primary)'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      style={{
        position: 'relative',
        width: '48px',
        height: '28px',
        borderRadius: 'var(--radius-full)',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: checked ? color : 'var(--color-border)',
        transition: 'background-color 0.2s ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'left 0.2s ease',
        }}
      />
    </button>
  )
}

export function NotificationSettings() {
  const enabled = useAppStore((s) => s.notificationsEnabled)
  const categories = useAppStore((s) => s.notificationCategories)
  const setEnabled = useAppStore((s) => s.setNotificationsEnabled)
  const toggleCategory = useAppStore((s) => s.toggleNotificationCategory)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const handleMasterToggle = async () => {
    if (!enabled) {
      // Turning ON — request browser permission first
      const granted = await requestNotificationPermission()
      if (granted) {
        setEnabled(true)
        setPermissionDenied(false)
      } else {
        // Permission denied or unavailable
        setPermissionDenied(true)
        // Still enable in-app notifications (they work without permission)
        setEnabled(true)
      }
    } else {
      setEnabled(false)
    }
  }

  const browserPermissionOk = canNotify()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Master toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: enabled
            ? 'var(--color-primary-light)'
            : 'var(--color-surface-alt)',
          transition: 'background-color 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {enabled ? (
            <Bell size={22} weight="duotone" style={{ color: 'var(--color-primary)' }} />
          ) : (
            <BellSlash size={22} weight="duotone" style={{ color: 'var(--color-text-muted)' }} />
          )}
          <div>
            <p
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              Уведомления
            </p>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginTop: '2px',
              }}
            >
              {enabled ? (browserPermissionOk ? 'Включены' : 'Только в приложении') : 'Выключены'}
            </p>
          </div>
        </div>
        <Toggle
          checked={enabled}
          onChange={handleMasterToggle}
          ariaLabel="Включить уведомления"
        />
      </div>

      {/* Permission warning */}
      {enabled && (permissionDenied || !browserPermissionOk) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)',
          }}
        >
          <WarningCircle size={18} weight="duotone" style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Браузер не разрешил push-уведомления. Напоминания будут работать только когда приложение открыто.
            </p>
            <button
              onClick={async () => {
                const granted = await requestNotificationPermission()
                if (granted) setPermissionDenied(false)
              }}
              style={{
                marginTop: '8px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Запросить разрешение повторно
            </button>
          </div>
        </div>
      )}

      {/* Category toggles */}
      {enabled && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'var(--animate-fade-in)',
          }}
        >
          {CATEGORIES.map(({ key, label, description, Icon }) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <Icon
                  size={20}
                  weight="duotone"
                  style={{
                    color: categories[key]
                      ? 'var(--color-primary)'
                      : 'var(--color-text-muted)',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      marginTop: '1px',
                    }}
                  >
                    {description}
                  </p>
                </div>
              </div>
              <Toggle
                checked={categories[key]}
                onChange={() => toggleCategory(key)}
                ariaLabel={label}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
