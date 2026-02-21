'use client'

import { useState, useCallback } from 'react'
import {
  Scan,
  Stethoscope,
  Drop,
  Barbell,
  CalendarBlank,
  CheckCircle,
  NoteBlank,
  MapPin,
  X,
} from '@phosphor-icons/react'
import { db, type Appointment } from '@/lib/db'

// ─── Type Options ────────────────────────────────────────────────

const TYPE_OPTIONS: Array<{
  value: Appointment['type']
  label: string
  icon: typeof Scan
  color: string
}> = [
  { value: 'ct', label: 'КТ/Рентген', icon: Scan, color: 'var(--color-info)' },
  { value: 'doctor', label: 'Врач', icon: Stethoscope, color: 'var(--color-primary)' },
  { value: 'bloodTest', label: 'Анализы', icon: Drop, color: 'var(--color-secondary)' },
  { value: 'physio', label: 'Физиотерапия', icon: Barbell, color: 'var(--color-accent)' },
  { value: 'other', label: 'Другое', icon: CalendarBlank, color: 'var(--color-text-muted)' },
]

// ─── Shared Input Style ──────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  boxSizing: 'border-box' as const,
}

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  marginBottom: '6px',
  display: 'block',
}

// ─── Component ───────────────────────────────────────────────────

type FormStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AppointmentFormProps {
  onSaved?: () => void
  onCancel?: () => void
}

export function AppointmentForm({ onSaved, onCancel }: AppointmentFormProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState<Appointment['type']>('doctor')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')

  const resetForm = useCallback(() => {
    setTitle('')
    setDate('')
    setTime('')
    setType('doctor')
    setLocation('')
    setNotes('')
    setStatus('idle')
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !date) return

    setStatus('saving')
    try {
      await db.appointments.add({
        title: title.trim(),
        date,
        time: time || undefined,
        type,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        completed: false,
      })
      setStatus('saved')
      setTimeout(() => {
        resetForm()
        onSaved?.()
      }, 800)
    } catch {
      setStatus('error')
    }
  }, [title, date, time, type, location, notes, resetForm, onSaved])

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--color-primary)'
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--color-border)'
  }

  // ─── Saved state ─────────────────────────────────────────────

  if (status === 'saved') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '24px 16px',
          animation: 'var(--animate-scale-in)',
        }}
      >
        <CheckCircle
          size={40}
          weight="duotone"
          style={{ color: 'var(--color-success)' }}
        />
        <p
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Запись добавлена
        </p>
      </div>
    )
  }

  // ─── Form ────────────────────────────────────────────────────

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          Новая запись
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Закрыть"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: 'var(--color-surface-alt)',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
            }}
          >
            <X size={18} weight="bold" />
          </button>
        )}
      </div>

      {/* Type selector (segmented) */}
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={labelStyle}>Тип визита</legend>
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          {TYPE_OPTIONS.map((opt) => {
            const isSelected = type === opt.value
            const IconComp = opt.icon
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setType(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  fontWeight: isSelected ? 600 : 400,
                  fontFamily: 'var(--font-body)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: isSelected
                    ? 'var(--color-primary)'
                    : 'var(--color-surface-alt)',
                  color: isSelected
                    ? '#FFFFFF'
                    : 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                }}
              >
                <IconComp
                  size={16}
                  weight="duotone"
                  style={{
                    color: isSelected ? '#FFFFFF' : opt.color,
                  }}
                />
                {opt.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Title */}
      <div>
        <label htmlFor="apt-title" style={labelStyle}>
          Название *
        </label>
        <input
          id="apt-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="КТ-контроль, приём хирурга..."
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Date + Time row */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="apt-date" style={labelStyle}>
            Дата *
          </label>
          <input
            id="apt-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="apt-time" style={labelStyle}>
            Время
          </label>
          <input
            id="apt-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="apt-location"
          style={{
            ...labelStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <MapPin size={14} weight="duotone" />
          Место
        </label>
        <input
          id="apt-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Клиника, адрес..."
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="apt-notes"
          style={{
            ...labelStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <NoteBlank size={14} weight="duotone" />
          Заметки
        </label>
        <textarea
          id="apt-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Что взять с собой, вопросы врачу..."
          rows={2}
          style={{
            ...inputStyle,
            resize: 'vertical',
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'saving' || !title.trim() || !date}
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
          cursor:
            status === 'saving' || !title.trim() || !date
              ? 'not-allowed'
              : 'pointer',
          opacity:
            status === 'saving' || !title.trim() || !date ? 0.6 : 1,
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
