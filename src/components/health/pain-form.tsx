'use client'

import { useState, useCallback } from 'react'
import { WarningCircle, CheckCircle, NoteBlank } from '@phosphor-icons/react'
import { db } from '@/lib/db'
import { checkRedFlags, type RedFlag } from '@/lib/red-flags'
import { PainSlider } from './pain-slider'
import { RedFlagAlert } from './red-flag-alert'

// ─── Option Data ────────────────────────────────────────────────

const LOCATIONS = [
  { label: 'Олекранон', value: 'olecranon' },
  { label: 'Медиально', value: 'medial' },
  { label: 'Латерально', value: 'lateral' },
  { label: 'Предплечье', value: 'forearm' },
  { label: 'Запястье', value: 'wrist' },
] as const

const CHARACTERS = [
  { label: 'Тупая', value: 'dull' },
  { label: 'Острая', value: 'sharp' },
  { label: 'Тянущая', value: 'pulling' },
  { label: 'Стреляющая', value: 'shooting' },
  { label: 'Пульсирующая', value: 'throbbing' },
] as const

const TRIGGERS = [
  { label: 'Сгибание', value: 'flexion' },
  { label: 'Разгибание', value: 'extension' },
  { label: 'Ротация', value: 'rotation' },
  { label: 'Покой', value: 'rest' },
  { label: 'Нагрузка', value: 'load' },
  { label: 'Ночью', value: 'night' },
] as const

const CREPITATION_OPTIONS = [
  { label: 'Нет', value: 'none' as const },
  { label: 'Лёгкая', value: 'mild' as const },
  { label: 'Умеренная', value: 'moderate' as const },
  { label: 'Выраженная', value: 'severe' as const },
]

type CrepitationValue = 'none' | 'mild' | 'moderate' | 'severe'

// ─── Sub-components ─────────────────────────────────────────────

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: ReadonlyArray<{ label: string; value: string }>
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          marginBottom: '8px',
        }}
      >
        {label}
      </legend>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => onToggle(opt.value)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease, color 0.15s ease',
                backgroundColor: isSelected
                  ? 'var(--color-primary)'
                  : 'var(--color-surface-alt)',
                color: isSelected
                  ? '#FFFFFF'
                  : 'var(--color-text-secondary)',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<{ label: string; value: CrepitationValue }>
  value: CrepitationValue
  onChange: (value: CrepitationValue) => void
}) {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          marginBottom: '8px',
        }}
      >
        {label}
      </legend>
      <div
        role="radiogroup"
        aria-label={label}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${options.length}, 1fr)`,
          gap: '2px',
          padding: '2px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-surface-alt)',
        }}
      >
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.value)}
              style={{
                padding: '8px 4px',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                fontSize: 'var(--text-sm)',
                fontWeight: isSelected ? 600 : 400,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: isSelected
                  ? 'var(--color-surface)'
                  : 'transparent',
                color: isSelected
                  ? 'var(--color-text)'
                  : 'var(--color-text-secondary)',
                boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

// ─── Main Form ──────────────────────────────────────────────────

type FormStatus = 'idle' | 'saving' | 'saved' | 'error'

export function PainForm() {
  const [level, setLevel] = useState(0)
  const [locations, setLocations] = useState<string[]>([])
  const [character, setCharacter] = useState<string[]>([])
  const [triggers, setTriggers] = useState<string[]>([])
  const [crepitation, setCrepitation] = useState<CrepitationValue>('none')
  const [numbness45, setNumbness45] = useState(false)
  const [notes, setNotes] = useState('')
  const [flags, setFlags] = useState<RedFlag[]>([])
  const [status, setStatus] = useState<FormStatus>('idle')

  const toggleValue = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
      (val: string) => {
        setter((prev) =>
          prev.includes(val)
            ? prev.filter((v) => v !== val)
            : [...prev, val]
        )
      },
    []
  )

  const resetForm = useCallback(() => {
    setLevel(0)
    setLocations([])
    setCharacter([])
    setTriggers([])
    setCrepitation('none')
    setNumbness45(false)
    setNotes('')
    setFlags([])
    setStatus('idle')
  }, [])

  const handleSubmit = useCallback(async () => {
    setStatus('saving')
    setFlags([])

    try {
      const now = new Date()
      const entry = {
        date: now.toISOString().split('T')[0],
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        level,
        locations,
        character,
        triggers,
        crepitation,
        numbness45,
        notes: notes.trim() || undefined,
      }

      await db.painEntries.add(entry)

      const detectedFlags = await checkRedFlags(entry)
      if (detectedFlags.length > 0) {
        setFlags(detectedFlags)
      }

      setStatus('saved')

      // Auto-reset form after 2.5 seconds if no flags
      if (detectedFlags.length === 0) {
        setTimeout(() => {
          resetForm()
        }, 2500)
      }
    } catch {
      setStatus('error')
    }
  }, [
    level,
    locations,
    character,
    triggers,
    crepitation,
    numbness45,
    notes,
    resetForm,
  ])

  // ─── Success state ──────────────────────────────────────────

  if (status === 'saved' && flags.length === 0) {
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
          Динамика фиксируется для анализа
        </p>
      </div>
    )
  }

  // ─── Flags + saved state ────────────────────────────────────

  if (status === 'saved' && flags.length > 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle
            size={20}
            weight="duotone"
            style={{ color: 'var(--color-success)' }}
          />
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-success)',
              fontWeight: 500,
            }}
          >
            Запись сохранена
          </p>
        </div>
        <RedFlagAlert flags={flags} onDismiss={resetForm} />
      </div>
    )
  }

  // ─── Form ───────────────────────────────────────────────────

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
      {/* Pain Level Slider */}
      <PainSlider value={level} onChange={setLevel} />

      {/* Location */}
      <ChipGroup
        label="Локализация"
        options={LOCATIONS}
        selected={locations}
        onToggle={toggleValue(setLocations)}
      />

      {/* Character */}
      <ChipGroup
        label="Характер боли"
        options={CHARACTERS}
        selected={character}
        onToggle={toggleValue(setCharacter)}
      />

      {/* Triggers */}
      <ChipGroup
        label="Триггеры"
        options={TRIGGERS}
        selected={triggers}
        onToggle={toggleValue(setTriggers)}
      />

      {/* Crepitation */}
      <SegmentedControl
        label="Крепитация"
        options={CREPITATION_OPTIONS}
        value={crepitation}
        onChange={setCrepitation}
      />

      {/* Numbness 4-5 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: numbness45
            ? 'color-mix(in srgb, var(--color-error) 8%, transparent)'
            : 'var(--color-surface)',
          border: `1px solid ${
            numbness45
              ? 'color-mix(in srgb, var(--color-error) 30%, transparent)'
              : 'var(--color-border)'
          }`,
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {numbness45 && (
            <WarningCircle
              size={20}
              weight="duotone"
              style={{ color: 'var(--color-error)', flexShrink: 0 }}
            />
          )}
          <div>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--color-text)',
              }}
            >
              Онемение 4-5 пальцев
            </p>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginTop: '2px',
              }}
            >
              Безымянный и мизинец
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={numbness45}
          aria-label="Онемение 4-5 пальцев"
          onClick={() => setNumbness45((prev) => !prev)}
          style={{
            position: 'relative',
            width: '48px',
            height: '28px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: numbness45
              ? 'var(--color-error)'
              : 'var(--color-border)',
            transition: 'background-color 0.2s ease',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '2px',
              left: numbness45 ? '22px' : '2px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'left 0.2s ease',
            }}
          />
        </button>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="pain-notes"
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
          id="pain-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Контекст, наблюдения, что помогло..."
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
