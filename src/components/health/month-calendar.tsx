'use client'

import { useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'

export interface CalendarDay {
  date: string          // YYYY-MM-DD
  hasData: boolean
  quality?: 'good' | 'warning' | 'bad' | 'neutral'
  label?: string        // short label shown below day number
}

interface MonthCalendarProps {
  days: CalendarDay[]
  onSelectDate: (date: string) => void
  selectedDate: string | null
  title?: string
}

export function MonthCalendar({ days, onSelectDate, selectedDate, title }: MonthCalendarProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const dayMap = new Map(days.map(d => [d.date, d]))

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const startOffset = (firstDayOfWeek + 6) % 7 // Monday-first

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })

  const todayStr = today.toISOString().split('T')[0]

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function qualityColor(q?: CalendarDay['quality']) {
    switch (q) {
      case 'good': return 'var(--color-primary)'
      case 'warning': return '#f59e0b'
      case 'bad': return 'var(--color-error)'
      default: return 'var(--color-border)'
    }
  }

  return (
    <div style={{ marginTop: 24 }}>
      {title && (
        <p style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}>
          {title}
        </p>
      )}

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button
          onClick={prevMonth}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, display: 'flex', alignItems: 'center' }}
        >
          <CaretLeft size={18} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', textTransform: 'capitalize' }}>
          {monthName}
        </span>
        <button
          onClick={nextMonth}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, display: 'flex', alignItems: 'center' }}
        >
          <CaretRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--color-text-muted)', padding: '2px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
          const dayData = dayMap.get(dateStr)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const isFuture = dateStr > todayStr

          const bgColor = isSelected
            ? 'var(--color-primary-light)'
            : dayData?.hasData
            ? `color-mix(in srgb, ${qualityColor(dayData.quality)} 15%, transparent)`
            : 'transparent'

          const borderStr = isSelected
            ? '2px solid var(--color-primary)'
            : isToday
            ? '1.5px solid var(--color-primary)'
            : '1px solid transparent'

          return (
            <button
              key={dateStr}
              onClick={() => !isFuture && onSelectDate(isSelected ? '' : dateStr)}
              disabled={isFuture}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                border: borderStr,
                background: bgColor,
                cursor: isFuture ? 'default' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                padding: 2,
                opacity: isFuture ? 0.3 : 1,
                minWidth: 0,
              }}
            >
              <span style={{
                fontSize: 11,
                fontWeight: isToday ? 700 : 400,
                color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                lineHeight: 1,
              }}>
                {dayNum}
              </span>
              {dayData?.hasData && dayData.label && (
                <span style={{ fontSize: 8, color: qualityColor(dayData.quality), fontWeight: 600, lineHeight: 1 }}>
                  {dayData.label}
                </span>
              )}
              {dayData?.hasData && !dayData.label && (
                <div style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: qualityColor(dayData.quality),
                }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
