'use client'

import { Pill, ArrowLeft } from '@phosphor-icons/react'
import Link from 'next/link'
import { SupplementChecklist } from '@/components/health/supplement-checklist'

export default function SupplementsPage() {
  const today = new Date()
  const formatted = today.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div style={{ paddingTop: '24px', paddingBottom: '32px' }}>
      {/* Back link */}
      <Link
        href="/health"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-primary)',
          textDecoration: 'none',
          marginBottom: '12px',
        }}
      >
        <ArrowLeft size={16} weight="bold" />
        Здоровье
      </Link>

      {/* Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '4px',
        }}
      >
        <Pill
          size={28}
          weight="duotone"
          style={{ color: 'var(--color-primary)' }}
        />
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          Добавки
        </h1>
      </div>

      {/* Date */}
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          marginBottom: '20px',
          textTransform: 'capitalize',
        }}
      >
        {formatted}
      </p>

      {/* Checklist */}
      <SupplementChecklist />
    </div>
  )
}
