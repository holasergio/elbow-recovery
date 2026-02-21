'use client'

import { GearSix, User, CalendarBlank } from '@phosphor-icons/react'
import { patient, getDaysSinceSurgery } from '@/data/patient'
import { ThemeToggle } from '@/components/settings/theme-toggle'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { DataExport } from '@/components/settings/data-export'
import { StorageInfo } from '@/components/settings/storage-info'

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        padding: '20px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h2
        style={{
          fontSize: 'var(--text-base)',
          fontWeight: 600,
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text)',
          marginBottom: '16px',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function SettingsPage() {
  const days = getDaysSinceSurgery()

  return (
    <div className="py-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GearSix size={28} weight="duotone" style={{ color: 'var(--color-primary)' }} />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 600,
            }}
          >
            Настройки
          </h1>
        </div>
        <p className="mt-2" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Тема, уведомления, экспорт
        </p>
      </div>

      {/* Patient info summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-primary-light)',
          border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <User size={22} weight="duotone" style={{ color: '#FFFFFF' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            {patient.name}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '2px',
            }}
          >
            <CalendarBlank size={14} weight="duotone" style={{ color: 'var(--color-primary)' }} />
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
              }}
            >
              День {days} после операции
            </p>
          </div>
        </div>
      </div>

      {/* Theme */}
      <SectionCard title="Тема">
        <ThemeToggle />
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Уведомления">
        <NotificationSettings />
      </SectionCard>

      {/* Data Export */}
      <SectionCard title="Экспорт данных">
        <DataExport />
      </SectionCard>

      {/* Storage */}
      <SectionCard title="Хранилище">
        <StorageInfo />
      </SectionCard>

      {/* App version */}
      <p
        style={{
          textAlign: 'center',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          paddingBottom: '8px',
        }}
      >
        Elbow Recovery v1.0.0-beta
      </p>
    </div>
  )
}
