'use client'

import { useState } from 'react'
import { CaretDown, CaretUp, WarningCircle, Info } from '@phosphor-icons/react'
import type { SleepLog } from '@/lib/db'

// ─── Hormone Window Data ────────────────────────────────────────

interface HormoneWindow {
  startHour: number
  endHour: number
  label: string
  color: string
  bgOpacity: string
}

const HORMONE_WINDOWS: HormoneWindow[] = [
  {
    startHour: 22,
    endHour: 23,
    label: 'Мелатонин',
    color: 'var(--color-info)',
    bgOpacity: '20%',
  },
  {
    startHour: 23,
    endHour: 25, // 01:00 next day
    label: 'Гормон роста',
    color: 'var(--color-primary)',
    bgOpacity: '25%',
  },
  {
    startHour: 25,
    endHour: 27, // 03:00
    label: 'Глубокий сон',
    color: 'var(--color-accent)',
    bgOpacity: '20%',
  },
  {
    startHour: 27,
    endHour: 29, // 05:00
    label: 'Кортизол ↑',
    color: 'var(--color-secondary)',
    bgOpacity: '20%',
  },
  {
    startHour: 29,
    endHour: 31, // 07:00
    label: 'Тестостерон',
    color: 'var(--color-primary)',
    bgOpacity: '15%',
  },
  {
    startHour: 31,
    endHour: 32, // 08:00
    label: 'Пробуждение',
    color: 'var(--color-text-muted)',
    bgOpacity: '10%',
  },
]

const HORMONE_DESCRIPTIONS: Record<string, string> = {
  'Мелатонин':
    'Гормон сна. Вырабатывается при снижении освещённости. Регулирует циркадный ритм и запускает восстановительные процессы.',
  'Гормон роста':
    'Ключевой для регенерации кости. 60-70% суточной дозы выделяется в первые 2 часа глубокого сна. Стимулирует остеобласты.',
  'Глубокий сон':
    'Фаза максимальной репарации тканей. Иммунная система активна, воспаление снижается, мышцы восстанавливаются.',
  'Кортизол ↑':
    'Гормон бодрости. Растёт к утру, готовя организм к пробуждению. Умеренный уровень необходим для метаболизма кости.',
  'Тестостерон':
    'Влияет на плотность костной ткани и мышечную силу. Пик выработки — ранние утренние часы во время REM-сна.',
  'Пробуждение':
    'Оптимальное время подъёма. Кортизол на пике, мелатонин подавлен — организм готов к активности.',
}

const TIMELINE_START = 22 // 22:00
const TIMELINE_END = 32 // 08:00 next day (22 + 10)
const TOTAL_HOURS = TIMELINE_END - TIMELINE_START

function hourToLabel(h: number): string {
  const normalized = h >= 24 ? h - 24 : h
  return `${String(normalized).padStart(2, '0')}:00`
}

function timeToTimelinePos(time: string): number | null {
  const [h, m] = time.split(':').map(Number)
  let hour = h + m / 60
  // Normalize to 22-32 range
  if (hour < 12) hour += 24 // morning hours (00:00-11:59) become 24-35
  if (hour < TIMELINE_START || hour > TIMELINE_END) return null
  return ((hour - TIMELINE_START) / TOTAL_HOURS) * 100
}

// ─── Component ──────────────────────────────────────────────────

interface HormoneTimelineProps {
  todaySleep?: SleepLog | null
}

export function HormoneTimeline({ todaySleep }: HormoneTimelineProps) {
  const [expanded, setExpanded] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  // Check if user missed the GH window (bed after 23:00)
  const missedGHWindow = (() => {
    if (!todaySleep) return false
    const [h] = todaySleep.bedTime.split(':').map(Number)
    // If bedTime hour is between 0 and 12, they went to bed very late (after midnight)
    // If bedTime hour is >= 23, they missed the window
    return (h >= 23 && h < 24) || (h >= 0 && h < 12)
  })()

  // Compute sleep coverage overlay positions
  const sleepStart = todaySleep ? timeToTimelinePos(todaySleep.bedTime) : null
  const sleepEnd = todaySleep ? timeToTimelinePos(todaySleep.wakeTime) : null

  return (
    <div
      style={{
        padding: '20px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Section Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <Info
          size={18}
          weight="duotone"
          style={{ color: 'var(--color-info)', flexShrink: 0 }}
        />
        <span
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Гормональное окно восстановления
        </span>
      </div>

      {/* Timeline Bar */}
      <div style={{ marginBottom: '8px' }}>
        <div
          style={{
            display: 'flex',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            height: '40px',
            position: 'relative',
          }}
        >
          {HORMONE_WINDOWS.map((window) => {
            const widthPercent =
              ((window.endHour - window.startHour) / TOTAL_HOURS) * 100

            return (
              <button
                key={window.label}
                type="button"
                onClick={() =>
                  setActiveTooltip(
                    activeTooltip === window.label ? null : window.label
                  )
                }
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: `color-mix(in srgb, ${window.color} ${window.bgOpacity}, transparent)`,
                  borderRight: '1px solid var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  border: 'none',
                  padding: 0,
                  height: '100%',
                  outline:
                    activeTooltip === window.label
                      ? `2px solid ${window.color}`
                      : 'none',
                  outlineOffset: '-2px',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: window.color,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    padding: '0 2px',
                  }}
                >
                  {window.label}
                </span>
              </button>
            )
          })}

          {/* Sleep Coverage Overlay */}
          {sleepStart !== null && sleepEnd !== null && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: `${sleepStart}%`,
                width: `${sleepEnd - sleepStart}%`,
                height: '100%',
                border: '2px solid var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                pointerEvents: 'none',
                boxSizing: 'border-box',
              }}
            />
          )}
        </div>

        {/* Time labels below bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
          }}
        >
          {[22, 23, 25, 27, 29, 31, 32].map((h) => (
            <span
              key={h}
              style={{
                fontSize: '10px',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
              }}
            >
              {hourToLabel(h)}
            </span>
          ))}
        </div>
        {/* Tooltip */}
        {activeTooltip && (
          <div
            style={{
              marginTop: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              animation: 'var(--animate-fade-in)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--color-text)',
                marginBottom: '4px',
              }}
            >
              {activeTooltip}
            </p>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {HORMONE_DESCRIPTIONS[activeTooltip]}
            </p>
          </div>
        )}
      </div>

      {/* GH Window Warning */}
      {missedGHWindow && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: `color-mix(in srgb, var(--color-warning) 10%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)`,
            marginTop: '12px',
          }}
        >
          <WarningCircle
            size={18}
            weight="duotone"
            style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '1px' }}
          />
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Сегодня вы легли после 23:00 и пропустили пик выработки гормона роста.
            Старайтесь засыпать до 22:30 для оптимального восстановления костной ткани.
          </p>
        </div>
      )}

      {/* Recommendation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '12px',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-primary-light)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-primary)',
          }}
        >
          Рекомендуемое время сна: 22:30
        </span>
      </div>

      {/* Expandable Explanation */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '12px 0 0 0',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--color-primary)',
        }}
        aria-expanded={expanded}
      >
        {expanded ? (
          <CaretUp size={16} weight="bold" />
        ) : (
          <CaretDown size={16} weight="bold" />
        )}
        Почему это важно?
      </button>

      {expanded && (
        <div
          style={{
            marginTop: '12px',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-alt)',
            animation: 'var(--animate-fade-in)',
          }}
        >
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            60-70% гормона роста выделяется в первые 2 часа глубокого сна
            (23:00-01:00). Этот гормон критичен для регенерации костной ткани
            после перелома. Засыпание до 22:30 обеспечивает вход в фазу
            глубокого сна к моменту пика выработки ГР.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            <TimelineNote
              time="22:00-23:00"
              text="Пик мелатонина — начало засыпания"
            />
            <TimelineNote
              time="23:00-01:00"
              text="Максимальная выработка гормона роста — ключевое окно для восстановления кости"
            />
            <TimelineNote
              time="01:00-03:00"
              text="Глубокий сон — репарация тканей, иммунная функция"
            />
            <TimelineNote
              time="03:00-05:00"
              text="Повышение кортизола — подготовка к пробуждению"
            />
            <TimelineNote
              time="05:00-07:00"
              text="Пик тестостерона — важен для плотности костной ткани"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function TimelineNote({ time, text }: { time: string; text: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          whiteSpace: 'nowrap',
          minWidth: '80px',
        }}
      >
        {time}
      </span>
      <span
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
        }}
      >
        {text}
      </span>
    </div>
  )
}
