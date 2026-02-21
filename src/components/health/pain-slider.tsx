'use client'

import { useId, useMemo } from 'react'

interface PainSliderProps {
  value: number
  onChange: (value: number) => void
}

const LABELS: Record<number, string> = {
  0: 'Нет',
  3: 'Лёгкая',
  5: 'Средняя',
  7: 'Сильная',
  10: 'Невыносимая',
}

function getPainColor(level: number): string {
  if (level === 0) return 'var(--color-success)'
  if (level <= 3) return '#7BAF96'
  if (level <= 5) return 'var(--color-warning)'
  if (level <= 7) return '#D48A4A'
  return 'var(--color-error)'
}

function getClosestLabel(level: number): string {
  const keys = Object.keys(LABELS).map(Number).sort((a, b) => a - b)
  let closest = keys[0]
  for (const k of keys) {
    if (Math.abs(k - level) <= Math.abs(closest - level)) {
      closest = k
    }
  }
  return LABELS[closest]
}

export function PainSlider({ value, onChange }: PainSliderProps) {
  const id = useId()
  const color = useMemo(() => getPainColor(value), [value])
  const label = useMemo(() => getClosestLabel(value), [value])
  const percentage = (value / 10) * 100

  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          marginBottom: '8px',
        }}
      >
        Уровень боли
      </label>

      {/* Numeric display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-5xl)',
            fontWeight: 600,
            color,
            lineHeight: 1,
            transition: 'color 0.2s ease',
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {label}
        </span>
      </div>

      {/* Slider track */}
      <div style={{ position: 'relative', paddingBlock: '8px' }}>
        <input
          id={id}
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={`Уровень боли: ${value} из 10`}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={value}
          aria-valuetext={`${value} — ${label}`}
          style={{
            width: '100%',
            height: '8px',
            appearance: 'none',
            WebkitAppearance: 'none',
            borderRadius: 'var(--radius-full)',
            outline: 'none',
            cursor: 'pointer',
            background: `linear-gradient(to right, var(--color-success) 0%, var(--color-warning) 50%, var(--color-error) 100%)`,
            accentColor: color,
          }}
        />
        {/* Fill overlay: transparent portion after thumb */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '8px',
            left: `${percentage}%`,
            right: 0,
            height: '8px',
            backgroundColor: 'var(--color-border)',
            borderRadius: '0 var(--radius-full) var(--radius-full) 0',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Scale labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
        }}
      >
        {Object.entries(LABELS).map(([num, text]) => (
          <span
            key={num}
            style={{
              fontSize: 'var(--text-xs)',
              color:
                value === Number(num)
                  ? 'var(--color-text)'
                  : 'var(--color-text-muted)',
              fontWeight: value === Number(num) ? 600 : 400,
              transition: 'color 0.2s, font-weight 0.2s',
              textAlign: 'center',
              minWidth: '48px',
            }}
          >
            {num}
          </span>
        ))}
      </div>

      {/* Custom thumb styling via <style> tag */}
      <style>{`
        input[type="range"]#${CSS.escape(id)}::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid var(--color-surface);
          box-shadow: var(--shadow-md);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        input[type="range"]#${CSS.escape(id)}::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid var(--color-surface);
          box-shadow: var(--shadow-md);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        input[type="range"]#${CSS.escape(id)}::-moz-range-track {
          height: 8px;
          border-radius: 9999px;
          background: linear-gradient(to right, var(--color-success) 0%, var(--color-warning) 50%, var(--color-error) 100%);
        }
      `}</style>
    </div>
  )
}
