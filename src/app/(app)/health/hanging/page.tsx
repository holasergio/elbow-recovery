'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, ArrowDown, TrendUp, CalendarBlank, Clock } from '@phosphor-icons/react'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { MonthCalendar, type CalendarDay } from '@/components/health/month-calendar'

const TARGET_HOURS = 6

export default function HangingHistoryPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const allLogs = useLiveQuery(() => db.dailyLogs.orderBy('date').toArray(), []) ?? []

  const calendarDays = useMemo((): CalendarDay[] => {
    return allLogs
      .filter(log => log.hangingHours > 0)
      .map(log => {
        const h = log.hangingHours
        const quality = h >= TARGET_HOURS ? 'good' : h >= 2 ? 'warning' : 'bad'
        return {
          date: log.date,
          hasData: true,
          quality,
          label: `${h}ч`,
        }
      })
  }, [allLogs])

  // Stats
  const stats = useMemo(() => {
    const withData = allLogs.filter(l => l.hangingHours > 0)
    if (withData.length === 0) return null
    const total = withData.reduce((sum, l) => sum + l.hangingHours, 0)
    const best = withData.reduce((a, b) => a.hangingHours >= b.hangingHours ? a : b)
    const avg = total / withData.length

    // Last 7 days average
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 6)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
    const last7 = withData.filter(l => l.date >= sevenDaysAgoStr)
    const weekAvg = last7.length > 0
      ? last7.reduce((sum, l) => sum + l.hangingHours, 0) / 7
      : 0

    return { total, best, avg, weekAvg, daysTracked: withData.length }
  }, [allLogs])

  const selectedLog = useMemo(
    () => selectedDate ? allLogs.find(l => l.date === selectedDate) ?? null : null,
    [allLogs, selectedDate]
  )

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <ArrowDown size={28} weight="duotone" style={{ color: 'var(--color-info)' }} />
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 600,
          color: 'var(--color-text)',
          margin: 0,
        }}>
          Свисание руки
        </h1>
      </div>
      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
        marginBottom: '20px',
      }}>
        Цель: {TARGET_HOURS} ч / день
      </p>

      {/* Stats row */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px',
          marginBottom: '8px',
        }}>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
              <TrendUp size={14} weight="duotone" style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>7 дней</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-display)', margin: 0, lineHeight: 1 }}>
              {stats.weekAvg.toFixed(1)}ч
            </p>
            <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>среднее</p>
          </div>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
              <Clock size={14} weight="duotone" style={{ color: 'var(--color-info)' }} />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Лучший</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-info)', fontFamily: 'var(--font-display)', margin: 0, lineHeight: 1 }}>
              {stats.best.hangingHours}ч
            </p>
            <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
              {new Date(stats.best.date + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
              <CalendarBlank size={14} weight="duotone" style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Дней</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-display)', margin: 0, lineHeight: 1 }}>
              {stats.daysTracked}
            </p>
            <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
              из {stats.total.toFixed(0)}ч всего
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4, marginTop: 4 }}>
        {[
          { color: 'var(--color-primary)', label: `≥ ${TARGET_HOURS}ч — цель` },
          { color: '#f59e0b', label: '2–5.9ч' },
          { color: 'var(--color-error)', label: '< 2ч' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <MonthCalendar
        days={calendarDays}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
        title="История по дням"
      />

      {/* Selected day detail */}
      {selectedDate && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 10 }}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>

          {selectedLog && selectedLog.hangingHours > 0 ? (
            <div style={{
              padding: '16px',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}>
              {/* Hours bar */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                <span style={{
                  fontSize: 36,
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1,
                  color: selectedLog.hangingHours >= TARGET_HOURS
                    ? 'var(--color-primary)'
                    : selectedLog.hangingHours >= 2
                    ? '#f59e0b'
                    : 'var(--color-error)',
                }}>
                  {selectedLog.hangingHours}ч
                </span>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  из {TARGET_HOURS}ч цели
                </span>
              </div>
              <div style={{
                height: 8,
                borderRadius: 4,
                background: 'var(--color-border)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  borderRadius: 4,
                  width: `${Math.min(100, (selectedLog.hangingHours / TARGET_HOURS) * 100)}%`,
                  background: selectedLog.hangingHours >= TARGET_HOURS
                    ? 'var(--color-primary)'
                    : selectedLog.hangingHours >= 2
                    ? '#f59e0b'
                    : 'var(--color-error)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8, margin: '8px 0 0 0' }}>
                {selectedLog.hangingHours >= TARGET_HOURS
                  ? '✓ Цель выполнена'
                  : `До цели: ${(TARGET_HOURS - selectedLog.hangingHours).toFixed(1)}ч`}
              </p>
            </div>
          ) : (
            <div style={{
              padding: '16px',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 13,
            }}>
              Нет данных за этот день
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {allLogs.filter(l => l.hangingHours > 0).length === 0 && (
        <div style={{
          marginTop: 32,
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}>
          <ArrowDown size={40} weight="duotone" style={{ color: 'var(--color-border)', marginBottom: 8 }} />
          <p>Начни отслеживать свисание руки на главной странице</p>
        </div>
      )}
    </div>
  )
}
