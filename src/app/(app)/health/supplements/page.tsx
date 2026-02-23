'use client'

import { useState, useMemo } from 'react'
import { Pill, ArrowLeft } from '@phosphor-icons/react'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { supplements } from '@/data/supplements'
import { SupplementChecklist } from '@/components/health/supplement-checklist'
import { MonthCalendar, type CalendarDay } from '@/components/health/month-calendar'

export default function SupplementsPage() {
  const today = new Date()
  const formatted = today.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null)
  const allSupplementLogs = useLiveQuery(() => db.supplementLogs.orderBy('date').toArray(), []) ?? []

  // Name lookup: sup_collagen → "Коллаген"
  const suppNameMap = useMemo(
    () => new Map(supplements.map(s => [s.id, s.name])),
    []
  )

  const supplementCalendarDays = useMemo((): CalendarDay[] => {
    const byDate = new Map<string, { taken: number; total: number }>()
    for (const log of allSupplementLogs) {
      if (!byDate.has(log.date)) byDate.set(log.date, { taken: 0, total: 0 })
      const d = byDate.get(log.date)!
      d.total++
      if (log.taken) d.taken++
    }
    return Array.from(byDate.entries()).map(([date, { taken, total }]) => {
      const pct = total > 0 ? taken / total : 0
      return {
        date,
        hasData: total > 0,
        quality: pct >= 0.9 ? 'good' : pct >= 0.6 ? 'warning' : 'bad',
        label: `${taken}/${total}`,
      }
    })
  }, [allSupplementLogs])

  const selectedDateLogs = useLiveQuery(
    async () => {
      if (!calendarSelectedDate) return []
      return db.supplementLogs.where('date').equals(calendarSelectedDate).toArray()
    },
    [calendarSelectedDate]
  ) ?? []

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

      <MonthCalendar
        days={supplementCalendarDays}
        onSelectDate={setCalendarSelectedDate}
        selectedDate={calendarSelectedDate}
        title="История добавок"
      />

      {calendarSelectedDate && selectedDateLogs.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            {new Date(calendarSelectedDate + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            {' — '}{selectedDateLogs.filter(l => l.taken).length}/{selectedDateLogs.length} принято
          </p>
          {selectedDateLogs.map(log => (
            <div key={log.id} style={{
              padding: '8px 14px',
              background: 'var(--color-surface)',
              borderRadius: 10,
              border: `1px solid ${log.taken ? 'color-mix(in srgb, var(--color-primary) 30%, transparent)' : 'var(--color-border)'}`,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>{log.taken ? '✓' : '○'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 500 }}>{suppNameMap.get(log.supplementId) ?? log.supplementId}</p>
                <p style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{log.slot}{log.takenAt ? ' · ' + new Date(log.takenAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checklist */}
      <SupplementChecklist />
    </div>
  )
}
