'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

// ──────────────────────────────────────────────
// useCalendarColors — reads CSS vars
// ──────────────────────────────────────────────

function useCalendarColors() {
  const [colors, setColors] = useState({
    primary: '#5B8A72',
    surfaceAlt: '#F5F2ED',
    text: '#2D2A26',
    textMuted: '#9C9690',
    border: '#E5E0D8',
    surface: '#FFFFFF',
    accent: '#D4A76A',
  })

  useEffect(() => {
    function read() {
      const style = getComputedStyle(document.documentElement)
      const get = (v: string, fb: string) => style.getPropertyValue(v).trim() || fb
      setColors({
        primary: get('--color-primary', '#5B8A72'),
        surfaceAlt: get('--color-surface-alt', '#F5F2ED'),
        text: get('--color-text', '#2D2A26'),
        textMuted: get('--color-text-muted', '#9C9690'),
        border: get('--color-border', '#E5E0D8'),
        surface: get('--color-surface', '#FFFFFF'),
        accent: get('--color-accent', '#D4A76A'),
      })
    }

    read()

    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return colors
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const MONTH_LABELS = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
]

const DAY_LABELS: { label: string; row: number }[] = [
  { label: 'Пн', row: 0 },
  { label: 'Ср', row: 2 },
  { label: 'Пт', row: 4 },
]

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Returns Monday-based day index (0=Mon, 6=Sun) */
function getMondayIndex(d: Date): number {
  const jsDay = d.getDay() // 0=Sun, 1=Mon...
  return jsDay === 0 ? 6 : jsDay - 1
}

function getIntensityLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  return 3
}

function pluralSessions(count: number): string {
  if (count === 1) return 'сессия'
  if (count >= 2 && count <= 4) return 'сессии'
  return 'сессий'
}

// ──────────────────────────────────────────────
// Grid cell data
// ──────────────────────────────────────────────

interface CellData {
  date: Date
  dateStr: string
  count: number
  hasRom: boolean
  inYear: boolean // whether this cell belongs to the current year
}

// ──────────────────────────────────────────────
// StreakCalendar component
// ──────────────────────────────────────────────

export function StreakCalendar() {
  const colors = useCalendarColors()
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayMarkerRef = useRef<HTMLButtonElement>(null)
  const [selectedCell, setSelectedCell] = useState<{ dateStr: string; count: number; hasRom: boolean } | null>(null)

  const currentYear = new Date().getFullYear()
  const today = new Date()
  const todayStr = toDateStr(today)

  // Year boundaries as date strings for DB queries
  const yearStart = `${currentYear}-01-01`
  const yearEnd = `${currentYear}-12-31`

  // Query exercise sessions for the full year
  const sessions = useLiveQuery(
    () =>
      db.exerciseSessions
        .where('date')
        .between(yearStart, yearEnd, true, true)
        .toArray(),
    [yearStart, yearEnd],
  )

  // Query ROM measurements for the full year
  const romMeasurements = useLiveQuery(
    () =>
      db.romMeasurements
        .where('date')
        .between(yearStart, yearEnd, true, true)
        .toArray(),
    [yearStart, yearEnd],
  )

  // Build date -> session count map
  const countMap = useMemo(() => {
    const map = new Map<string, number>()
    if (!sessions) return map
    for (const s of sessions) {
      map.set(s.date, (map.get(s.date) ?? 0) + 1)
    }
    return map
  }, [sessions])

  // Build date -> has ROM measurement set
  const romSet = useMemo(() => {
    const set = new Set<string>()
    if (!romMeasurements) return set
    for (const r of romMeasurements) {
      set.add(r.date)
    }
    return set
  }, [romMeasurements])

  // ROM data for selected cell (picked from already-loaded romMeasurements)
  const selectedRom = useMemo(() => {
    if (!selectedCell?.hasRom || !romMeasurements) return null
    return romMeasurements
      .filter(r => r.date === selectedCell.dateStr)
      .sort((a, b) => b.arc - a.arc)[0] ?? null
  }, [selectedCell, romMeasurements])

  // Build the full-year grid:
  // - Find Jan 1 of current year
  // - Find the Monday of that week (may be in the previous year)
  // - Build weekly columns until we pass Dec 31
  const { grid, monthPositions, todayWeekIdx } = useMemo(() => {
    const jan1 = new Date(currentYear, 0, 1)
    const jan1DayIdx = getMondayIndex(jan1)

    // Start from the Monday of the week containing Jan 1
    const gridStart = new Date(jan1)
    gridStart.setDate(gridStart.getDate() - jan1DayIdx)
    gridStart.setHours(0, 0, 0, 0)

    const dec31 = new Date(currentYear, 11, 31)

    const weeks: CellData[][] = []
    let currentDate = new Date(gridStart)
    let foundTodayWeek = -1

    // Build weeks until we've covered Dec 31
    while (true) {
      const weekDays: CellData[] = []
      let weekHasYearDay = false

      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(currentDate)
        cellDate.setDate(cellDate.getDate() + d)
        const dateStr = toDateStr(cellDate)
        const inYear = cellDate.getFullYear() === currentYear

        if (inYear) weekHasYearDay = true

        if (dateStr === todayStr) {
          foundTodayWeek = weeks.length
        }

        weekDays.push({
          date: cellDate,
          dateStr,
          count: countMap.get(dateStr) ?? 0,
          hasRom: romSet.has(dateStr),
          inYear,
        })
      }

      weeks.push(weekDays)

      // Move to next Monday
      currentDate.setDate(currentDate.getDate() + 7)

      // Stop if the previous week already covered Dec 31
      // We check if Monday of next week is past Dec 31 AND the last week had a year day
      if (currentDate > dec31 && weekHasYearDay) {
        // Check if we need one more partial week
        // If Dec 31 is not Sunday, the last week already captured it
        break
      }

      // Safety: don't go past 54 weeks
      if (weeks.length >= 54) break
    }

    // Calculate month label positions
    // For each month, find the first week column where that month's first day appears
    const monthPos: { month: number; weekIdx: number }[] = []
    const seenMonths = new Set<number>()

    for (let w = 0; w < weeks.length; w++) {
      for (let d = 0; d < 7; d++) {
        const cell = weeks[w][d]
        if (cell.inYear) {
          const month = cell.date.getMonth()
          if (!seenMonths.has(month)) {
            seenMonths.add(month)
            monthPos.push({ month, weekIdx: w })
          }
        }
      }
    }

    return {
      grid: weeks,
      monthPositions: monthPos,
      todayWeekIdx: foundTodayWeek,
    }
  }, [currentYear, countMap, romSet, todayStr])

  // Intensity colors (4 levels: 0, 1, 2, 3)
  const intensityColors = useMemo(() => {
    const base = colors.primary
    return [
      colors.surfaceAlt,   // level 0: empty
      `${base}40`,         // level 1: ~25% opacity
      `${base}80`,         // level 2: ~50% opacity
      base,                // level 3: full
    ]
  }, [colors.primary, colors.surfaceAlt])

  const cellSize = 12
  const cellGap = 2
  const labelWidth = 28

  // Auto-scroll to show current week
  useEffect(() => {
    if (scrollRef.current && todayWeekIdx >= 0) {
      const scrollContainer = scrollRef.current
      // Position of the current week in pixels
      const targetScrollLeft = todayWeekIdx * (cellSize + cellGap) - scrollContainer.clientWidth / 2
      scrollContainer.scrollLeft = Math.max(0, targetScrollLeft)
    }
  }, [todayWeekIdx, grid.length])

  const isFuture = (d: Date) => {
    const dStr = toDateStr(d)
    return dStr > todayStr
  }

  const isToday = (dateStr: string) => dateStr === todayStr

  // Total grid width for positioning month labels
  const gridWidth = grid.length * (cellSize + cellGap) - cellGap

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: '4px',
        }}
      >
        {/* Inner wrapper with fixed width to contain grid + labels */}
        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            minWidth: `${labelWidth + gridWidth + 8}px`,
          }}
        >
          {/* Month labels row */}
          <div
            style={{
              position: 'relative',
              height: '16px',
              marginLeft: `${labelWidth + 4}px`,
              marginBottom: '4px',
              width: `${gridWidth}px`,
            }}
          >
            {monthPositions.map((mp) => (
              <span
                key={mp.month}
                style={{
                  position: 'absolute',
                  left: `${mp.weekIdx * (cellSize + cellGap)}px`,
                  top: 0,
                  fontSize: '10px',
                  color: 'var(--color-text-muted)',
                  lineHeight: '16px',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
              >
                {MONTH_LABELS[mp.month]}
              </span>
            ))}
          </div>

          {/* Grid area: day labels + cells */}
          <div style={{ display: 'flex' }}>
            {/* Day labels column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `${cellGap}px`,
                marginRight: '4px',
                flexShrink: 0,
                width: `${labelWidth}px`,
              }}
            >
              {Array.from({ length: 7 }).map((_, i) => {
                const dayLabel = DAY_LABELS.find((dl) => dl.row === i)
                return (
                  <div
                    key={i}
                    style={{
                      height: `${cellSize}px`,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '9px',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1,
                      userSelect: 'none',
                    }}
                  >
                    {dayLabel?.label ?? ''}
                  </div>
                )
              })}
            </div>

            {/* Heatmap grid */}
            <div
              style={{
                display: 'flex',
                gap: `${cellGap}px`,
              }}
            >
              {grid.map((week, wIdx) => (
                <div
                  key={wIdx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${cellGap}px`,
                  }}
                >
                  {week.map((day, dIdx) => {
                    const future = isFuture(day.date)
                    const todayCell = isToday(day.dateStr)
                    const level = future || !day.inYear ? 0 : getIntensityLevel(day.count)
                    const showRomDot = day.hasRom && day.inYear

                    // Cells outside the current year: invisible
                    if (!day.inYear) {
                      return (
                        <div
                          key={dIdx}
                          style={{
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                            borderRadius: '2px',
                          }}
                        />
                      )
                    }

                    let backgroundColor: string
                    let border: string

                    if (todayCell) {
                      backgroundColor = future ? 'transparent' : intensityColors[level]
                      border = '2px solid var(--color-primary)'
                    } else if (future) {
                      backgroundColor = 'transparent'
                      border = `1px dashed var(--color-border)`
                    } else if (level === 0) {
                      backgroundColor = intensityColors[0]
                      border = `1px solid var(--color-border)`
                    } else {
                      backgroundColor = intensityColors[level]
                      border = 'none'
                    }

                    const title = future
                      ? day.dateStr
                      : `${day.dateStr}: ${day.count} ${pluralSessions(day.count)}${showRomDot ? ' + замер ROM' : ''}`

                    const isSelected = selectedCell?.dateStr === day.dateStr

                    return (
                      <button
                        key={dIdx}
                        ref={todayCell ? todayMarkerRef : undefined}
                        onClick={() => {
                          if (future || !day.inYear) return
                          setSelectedCell(prev =>
                            prev?.dateStr === day.dateStr ? null : { dateStr: day.dateStr, count: day.count, hasRom: day.hasRom }
                          )
                        }}
                        style={{
                          position: 'relative',
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                          borderRadius: '2px',
                          backgroundColor,
                          border: isSelected ? '2px solid var(--color-primary)' : border,
                          transition: 'background-color 0.2s',
                          boxSizing: 'border-box',
                          cursor: future || !day.inYear ? 'default' : 'pointer',
                          padding: 0,
                        }}
                      >
                        {/* ROM measurement golden dot */}
                        {showRomDot && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '1px',
                              right: '1px',
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-accent)',
                            }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected day info */}
      {selectedCell && (
        <div style={{
          marginTop: 10,
          padding: '10px 12px',
          background: 'var(--color-surface-alt)',
          borderRadius: 8,
          fontSize: 12,
          color: 'var(--color-text)',
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: selectedRom ? 8 : 0 }}>
            <span style={{ color: 'var(--color-text-muted)' }}>
              {new Date(selectedCell.dateStr + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </span>
            <span style={{ fontWeight: 600 }}>
              {selectedCell.count > 0
                ? `${selectedCell.count} ${pluralSessions(selectedCell.count)}`
                : 'Нет сессий'}
              {selectedCell.hasRom && !selectedRom && ' · замер ROM'}
            </span>
            <button
              onClick={() => setSelectedCell(null)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0, fontSize: 14 }}
            >
              ×
            </button>
          </div>

          {/* ROM details if available */}
          {selectedRom && (
            <div style={{
              padding: '8px 10px',
              background: 'var(--color-surface)',
              borderRadius: 6,
              border: '1px solid var(--color-border)',
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
            }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 10, display: 'block', marginBottom: 1 }}>Дуга</span>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
                  {selectedRom.arc}°
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 10, display: 'block', marginBottom: 1 }}>Сгибание</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text)' }}>
                  {selectedRom.flexion}°
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 10, marginLeft: 3 }}>/ 145°</span>
              </div>
              {selectedRom.extensionDeficit > 0 ? (
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 10, display: 'block', marginBottom: 1 }}>Дефицит разгибания</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-warning)' }}>
                    {selectedRom.extensionDeficit}°
                  </span>
                </div>
              ) : (
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 10, display: 'block', marginBottom: 1 }}>Разгибание</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-success)' }}>полное</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          justifyContent: 'flex-end',
          marginTop: '10px',
          fontSize: '10px',
          color: 'var(--color-text-muted)',
          flexWrap: 'wrap',
        }}
      >
        <span>Мало</span>
        {intensityColors.map((c, i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              backgroundColor: c,
              border: i === 0 ? '1px solid var(--color-border)' : 'none',
            }}
          />
        ))}
        <span>Много</span>

        {/* Separator */}
        <div
          style={{
            width: '1px',
            height: '10px',
            backgroundColor: 'var(--color-border)',
            marginLeft: '4px',
            marginRight: '4px',
          }}
        />

        {/* ROM legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
            }}
          />
          <span>Замер ROM</span>
        </div>
      </div>
    </div>
  )
}
