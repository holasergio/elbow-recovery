'use client'

import { useState, useCallback, useMemo } from 'react'
import { Star, CheckCircle, NoteBlank, Minus, Plus } from '@phosphor-icons/react'
import { db } from '@/lib/db'

// ─── Helpers ────────────────────────────────────────────────────

function calculateHours(bedTime: string, wakeTime: string): number {
  const [bH, bM] = bedTime.split(':').map(Number)
  const [wH, wM] = wakeTime.split(':').map(Number)
  let bedMin = bH * 60 + bM
  let wakeMin = wH * 60 + wM
  if (wakeMin <= bedMin) wakeMin += 24 * 60 // next day
  return Number(((wakeMin - bedMin) / 60).toFixed(1))
}

function getHoursColor(hours: number): string {
  if (hours >= 7.5) return 'var(--color-success)'
  if (hours >= 6) return 'var(--color-warning)'
  return 'var(--color-error)'
}

// ─── Star Rating ────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Качество сна"
      style={{ display: 'flex', gap: '4px' }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} из 5`}
          onClick={() => onChange(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Star
            size={32}
            weight={star <= value ? 'fill' : 'duotone'}
            style={{
              color:
                star <= value
                  ? 'var(--color-accent)'
                  : 'var(--color-text-muted)',
              transition: 'color 0.15s ease',
            }}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Number Stepper ─────────────────────────────────────────────

function NumberStepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          type="button"
          aria-label="Уменьшить"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            cursor: value <= min ? 'not-allowed' : 'pointer',
            opacity: value <= min ? 0.4 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.15s ease',
          }}
        >
          <Minus size={16} weight="bold" style={{ color: 'var(--color-text)' }} />
        </button>
        <span
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-text)',
            minWidth: '24px',
            textAlign: 'center',
          }}
        >
          {value}
        </span>
        <button
          type="button"
          aria-label="Увеличить"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            cursor: value >= max ? 'not-allowed' : 'pointer',
            opacity: value >= max ? 0.4 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.15s ease',
          }}
        >
          <Plus size={16} weight="bold" style={{ color: 'var(--color-text)' }} />
        </button>
      </div>
    </div>
  )
}

// ─── Main Form ──────────────────────────────────────────────────

type FormStatus = 'idle' | 'saving' | 'saved' | 'error'

export function SleepForm({ onSaved }: { onSaved?: () => void }) {
  const [bedTime, setBedTime] = useState('22:30')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [quality, setQuality] = useState(3)
  const [wakeUps, setWakeUps] = useState(0)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])

  const totalHours = useMemo(
    () => calculateHours(bedTime, wakeTime),
    [bedTime, wakeTime]
  )

  const resetForm = useCallback(() => {
    setBedTime('22:30')
    setWakeTime('07:00')
    setQuality(3)
    setWakeUps(0)
    setNotes('')
    setStatus('idle')
    setDate(new Date().toISOString().split('T')[0])
  }, [])

  const handleSubmit = useCallback(async () => {
    setStatus('saving')

    try {
      const targetDate = date

      await db.sleepLogs.put({
        date: targetDate,
        bedTime,
        wakeTime,
        totalHours,
        quality,
        wakeUps,
        notes: notes.trim() || undefined,
      })

      setStatus('saved')
      onSaved?.()

      setTimeout(() => {
        resetForm()
      }, 2500)
    } catch {
      setStatus('error')
    }
  }, [bedTime, wakeTime, totalHours, quality, wakeUps, notes, resetForm, onSaved])

  // ─── Success State ──────────────────────────────────────────

  if (status === 'saved') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '40px 20px',
          animation: 'var(--animate-scale-in)',
        }}
      >
        <CheckCircle
          size={48}
          weight="duotone"
          style={{ color: 'var(--color-success)' }}
        />
        <p
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Запись сохранена
        </p>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Данные о сне зафиксированы
        </p>
      </div>
    )
  }

  // ─── Form ─────────────────────────────────────────────────────

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Date selector */}
      <div>
        <label
          htmlFor="sleep-date"
          style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            marginBottom: '8px',
          }}
        >
          Дата
        </label>
        <input
          id="sleep-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          min={(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] })()}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: 'var(--text-base)',
            fontFamily: 'var(--font-body)',
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
        />
      </div>
      {/* Time Inputs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}
      >
        {/* Bed Time */}
        <div>
          <label
            htmlFor="bed-time"
            style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
            }}
          >
            Время отхода ко сну
          </label>
          <input
            id="bed-time"
            type="time"
            value={bedTime}
            onChange={(e) => setBedTime(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          />
        </div>

        {/* Wake Time */}
        <div>
          <label
            htmlFor="wake-time"
            style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
            }}
          >
            Время пробуждения
          </label>
          <input
            id="wake-time"
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          />
        </div>
      </div>

      {/* Total Hours Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: `color-mix(in srgb, ${getHoursColor(totalHours)} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${getHoursColor(totalHours)} 25%, transparent)`,
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: getHoursColor(totalHours),
          }}
        >
          {totalHours}
        </span>
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {totalHours === 1 ? 'час' : totalHours < 5 ? 'часа' : 'часов'}
        </span>
      </div>

      {/* Quality Rating */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            marginBottom: '8px',
          }}
        >
          Качество сна
        </label>
        <StarRating value={quality} onChange={setQuality} />
      </div>

      {/* Wake-ups */}
      <NumberStepper
        label="Пробуждения за ночь"
        value={wakeUps}
        onChange={setWakeUps}
        min={0}
        max={10}
      />

      {/* Notes */}
      <div>
        <label
          htmlFor="sleep-notes"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            marginBottom: '8px',
          }}
        >
          <NoteBlank size={16} weight="duotone" />
          Заметки
        </label>
        <textarea
          id="sleep-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Сложно уснул, принимал мелатонин, болела рука..."
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-body)',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)'
          }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'saving'}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          fontSize: 'var(--text-base)',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          cursor: status === 'saving' ? 'not-allowed' : 'pointer',
          opacity: status === 'saving' ? 0.7 : 1,
          transition: 'opacity 0.15s ease, background-color 0.15s ease',
        }}
      >
        {status === 'saving' ? 'Сохранение...' : 'Сохранить'}
      </button>

      {status === 'error' && (
        <p
          role="alert"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-error)',
            textAlign: 'center',
          }}
        >
          Не удалось сохранить. Попробуйте ещё раз.
        </p>
      )}
    </form>
  )
}
