'use client'

import { Sun, Moon, Desktop } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/app-store'

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Светлая', Icon: Sun },
  { value: 'dark' as const, label: 'Тёмная', Icon: Moon },
  { value: 'system' as const, label: 'Системная', Icon: Desktop },
]

export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  return (
    <div>
      <p
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          marginBottom: '8px',
        }}
      >
        Тема оформления
      </p>
      <div
        role="radiogroup"
        aria-label="Тема оформления"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2px',
          padding: '2px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-surface-alt)',
        }}
      >
        {THEME_OPTIONS.map(({ value, label, Icon }) => {
          const isSelected = theme === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={label}
              onClick={() => setTheme(value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 4px',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                fontSize: 'var(--text-sm)',
                fontWeight: isSelected ? 600 : 400,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: isSelected
                  ? 'var(--color-surface)'
                  : 'transparent',
                color: isSelected
                  ? 'var(--color-text)'
                  : 'var(--color-text-secondary)',
                boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Icon size={18} weight="duotone" />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
