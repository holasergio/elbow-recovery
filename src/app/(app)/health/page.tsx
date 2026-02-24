'use client'

import Link from 'next/link'
import { Pill, Moon, Heartbeat, CalendarBlank, ArrowDown, Wind, NotePencil } from '@phosphor-icons/react'

const healthSections = [
  {
    href: '/health/pain',
    icon: Heartbeat,
    label: 'Дневник боли',
    desc: 'Отслеживание боли и красных флагов',
  },
  {
    href: '/health/supplements',
    icon: Pill,
    label: 'Добавки',
    desc: 'Ежедневный чек-лист нутрицевтиков',
  },
  {
    href: '/health/sleep',
    icon: Moon,
    label: 'Протокол сна',
    desc: 'Контроль сна и гормонального окна',
  },
  {
    href: '/health/breathing',
    icon: Wind,
    label: 'Дыхание',
    desc: 'Техники релаксации 4-7-8 и квадратное дыхание',
  },
  {
    href: '/health/journal',
    icon: NotePencil,
    label: 'Дневник восстановления',
    desc: 'Записи, мысли и наблюдения',
  },
  {
    href: '/health/hanging',
    icon: ArrowDown,
    label: 'Свисание руки',
    desc: 'История и аналитика по часам',
  },
  {
    href: '/health/calendar',
    icon: CalendarBlank,
    label: 'Календарь',
    desc: 'Визиты к врачу и контрольные даты',
  },
] as const

export default function HealthPage() {
  return (
    <div style={{ paddingTop: '24px', paddingBottom: '32px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 600,
          color: 'var(--color-text)',
        }}
      >
        Здоровье
      </h1>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          marginTop: '8px',
        }}
      >
        Дневник, добавки, сон и дыхание
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginTop: '20px',
        }}
      >
        {healthSections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              textDecoration: 'none',
              transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-light)',
                flexShrink: 0,
              }}
            >
              <s.icon
                size={24}
                weight="duotone"
                style={{ color: 'var(--color-primary)' }}
              />
            </div>
            <div>
              <p
                style={{
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-base)',
                  margin: 0,
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                  marginTop: '2px',
                }}
              >
                {s.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
