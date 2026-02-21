'use client'

import Link from 'next/link'
import { ChartLine, Plus } from '@phosphor-icons/react'
import { ROMChart } from '@/components/progress/rom-chart'
import { StreakCalendar } from '@/components/progress/streak-calendar'

export default function ProgressPage() {
  return (
    <div style={{ paddingTop: '24px', paddingBottom: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        <ChartLine
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
          Прогресс
        </h1>
      </div>

      {/* ROM Chart */}
      <section style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          Амплитуда движений
        </h2>
        <ROMChart />
      </section>

      {/* Streak Calendar */}
      <section style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          Активность
        </h2>
        <StreakCalendar />
      </section>

      {/* Quick action link */}
      <Link
        href="/progress/rom"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-primary)',
          fontSize: 'var(--text-base)',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'background-color 0.2s, border-color 0.2s',
        }}
      >
        <Plus size={20} weight="bold" />
        Новый замер
      </Link>
    </div>
  )
}
