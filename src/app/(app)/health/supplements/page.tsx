'use client'

import { useState, useMemo } from 'react'
import { Pill, ArrowLeft, Plus } from '@phosphor-icons/react'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { supplements, slotLabels, type Supplement } from '@/data/supplements'
import { SupplementChecklist } from '@/components/health/supplement-checklist'
import { AddSupplementModal } from '@/components/health/add-supplement-modal'
import { MonthCalendar, type CalendarDay } from '@/components/health/month-calendar'

export default function SupplementsPage() {
  const today = new Date()
  const formatted = today.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const allSupplementLogs = useLiveQuery(() => db.supplementLogs.orderBy('date').toArray(), []) ?? []
  const customDefs = useLiveQuery(async () => {
    try {
      return await db.customSupplements.orderBy('supplementId').toArray()
    } catch {
      return []
    }
  }, []) ?? []

  const allSupplementDefs: Supplement[] = useMemo(() => [
    ...supplements,
    ...customDefs.map((cs) => ({
      id: cs.supplementId,
      name: cs.name,
      dose: cs.dose,
      timing: cs.timing,
      slot: cs.slot,
      priority: cs.priority,
      category: cs.category,
      reason: cs.reason,
      roleDetailed: cs.reason,
    } as Supplement)),
  ], [customDefs])

  const TOTAL_DAILY_SUPPLEMENTS = allSupplementDefs.length

  const supplementCalendarDays = useMemo((): CalendarDay[] => {
    const byDate = new Map<string, { taken: number }>()
    for (const log of allSupplementLogs) {
      if (!byDate.has(log.date)) byDate.set(log.date, { taken: 0 })
      if (log.taken) byDate.get(log.date)!.taken++
    }
    return Array.from(byDate.entries()).map(([date, { taken }]) => {
      const pct = taken / TOTAL_DAILY_SUPPLEMENTS
      return {
        date,
        hasData: true,
        quality: pct >= 0.9 ? 'good' : pct >= 0.6 ? 'warning' : 'bad',
        label: `${taken}/${TOTAL_DAILY_SUPPLEMENTS}`,
      }
    })
  }, [allSupplementLogs, TOTAL_DAILY_SUPPLEMENTS])

  const selectedDateLogs = useLiveQuery(
    async () => {
      if (!calendarSelectedDate) return []
      return db.supplementLogs.where('date').equals(calendarSelectedDate).toArray()
    },
    [calendarSelectedDate]
  ) ?? []

  return (
    <div style={{ paddingTop: '24px', paddingBottom: '80px' }}>
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

      {/* Title + Add button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          aria-label="Добавить добавку"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Plus size={18} weight="bold" />
        </button>
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

      {calendarSelectedDate && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            {new Date(calendarSelectedDate + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            {' — '}{selectedDateLogs.filter(l => l.taken).length}/{TOTAL_DAILY_SUPPLEMENTS} принято
          </p>
          {allSupplementDefs.map(supplement => {
            const log = selectedDateLogs.find(l => l.supplementId === supplement.id)
            const taken = log?.taken ?? null // null = не залогировано
            return (
              <div key={supplement.id} style={{
                padding: '8px 14px',
                background: 'var(--color-surface)',
                borderRadius: 10,
                border: `1px solid ${taken === true ? 'color-mix(in srgb, var(--color-primary) 30%, transparent)' : 'var(--color-border)'}`,
                marginBottom: 6,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                opacity: taken === null ? 0.55 : 1,
              }}>
                <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>
                  {taken === true ? '✓' : taken === false ? '○' : '−'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 500 }}>{supplement.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    {slotLabels[supplement.slot]}{supplement.dose ? ` · ${supplement.dose}` : ''}
                    {log?.takenAt ? ' · ' + new Date(log.takenAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
                    {taken === null ? ' · не отмечено' : ''}
                  </p>
                  {supplement.form && (
                    <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1, fontStyle: 'italic' }}>
                      {supplement.form}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Checklist */}
      <SupplementChecklist />

      {showAddModal && (
        <AddSupplementModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
