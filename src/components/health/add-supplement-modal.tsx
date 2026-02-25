'use client'

import { useState } from 'react'
import { X, Plus, Check } from '@phosphor-icons/react'
import { useCustomSupplements } from '@/hooks/use-custom-supplements'
import type { CustomSupplement } from '@/lib/db'
import type { SupplementSlot } from '@/data/supplements'

const SLOT_OPTIONS: Array<{ value: SupplementSlot; label: string }> = [
  { value: 'fasting', label: 'Натощак' },
  { value: 'breakfast', label: 'Завтрак' },
  { value: 'lunch', label: 'Обед' },
  { value: 'dinner', label: 'Ужин' },
  { value: 'bedtime', label: 'Перед сном' },
]

const PRIORITY_OPTIONS = [
  { value: 1 as const, label: 'Важно' },
  { value: 2 as const, label: 'Рекомендовано' },
  { value: 3 as const, label: 'Дополнительно' },
]

const CATEGORY_OPTIONS = [
  { value: 'mineral' as const, label: 'Минерал' },
  { value: 'vitamin' as const, label: 'Витамин' },
  { value: 'protein' as const, label: 'Протеин' },
  { value: 'fatty_acid' as const, label: 'Жирная кислота' },
  { value: 'compound' as const, label: 'Соединение' },
  { value: 'herb' as const, label: 'Трава' },
  { value: 'aminoacid' as const, label: 'Аминокислота' },
]

interface AddSupplementModalProps {
  onClose: () => void
  editData?: CustomSupplement | null
}

export function AddSupplementModal({ onClose, editData }: AddSupplementModalProps) {
  const { addCustomSupplement, updateCustomSupplement } = useCustomSupplements()
  const [saving, setSaving] = useState(false)

  const isEditMode = !!editData

  const [name, setName] = useState(editData?.name ?? '')
  const [dose, setDose] = useState(editData?.dose ?? '')
  const [slot, setSlot] = useState<SupplementSlot>(editData?.slot ?? 'breakfast')
  const [priority, setPriority] = useState<1 | 2 | 3>(editData?.priority ?? 2)
  const [category, setCategory] = useState<
    'mineral' | 'vitamin' | 'protein' | 'fatty_acid' | 'compound' | 'herb' | 'aminoacid'
  >(editData?.category ?? 'vitamin')
  const [reason, setReason] = useState(editData?.reason ?? '')

  const canSave = name.trim().length > 0

  async function handleSave() {
    if (!canSave || saving) return
    setSaving(true)
    try {
      const timing = SLOT_OPTIONS.find((s) => s.value === slot)?.label ?? slot
      if (isEditMode && editData) {
        await updateCustomSupplement(editData.supplementId, {
          name: name.trim(),
          dose: dose.trim() || '—',
          timing,
          slot,
          priority,
          category,
          reason: reason.trim(),
        })
      } else {
        await addCustomSupplement({
          name: name.trim(),
          dose: dose.trim() || '—',
          timing,
          slot,
          priority,
          category,
          reason: reason.trim(),
        })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 env(safe-area-inset-bottom)',
      }}
    >
      {/* Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: '20px 20px calc(20px + env(safe-area-inset-bottom))',
          boxShadow: 'var(--shadow-xl)',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              fontWeight: 600,
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            {isEditMode ? 'Редактировать' : 'Новая добавка'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--color-surface-alt)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
            }}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Название *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Витамин K2"
              style={inputStyle}
              autoFocus={!isEditMode}
            />
          </div>

          {/* Dose */}
          <div>
            <label style={labelStyle}>Дозировка</label>
            <input
              type="text"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="Например: 100 мкг"
              style={inputStyle}
            />
          </div>

          {/* Slot + Priority in a row */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Приём</label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value as SupplementSlot)}
                style={selectStyle}
              >
                {SLOT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Приоритет</label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
                style={selectStyle}
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Категория</label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value as typeof category
                )
              }
              style={selectStyle}
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label style={labelStyle}>Зачем принимаю</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Для чего нужна эта добавка..."
              rows={2}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '64px',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
          style={{
            marginTop: '20px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px',
            backgroundColor: canSave ? 'var(--color-primary)' : 'var(--color-surface-alt)',
            color: canSave ? '#fff' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            cursor: canSave ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
        >
          {isEditMode ? <Check size={18} weight="bold" /> : <Plus size={18} weight="bold" />}
          {saving ? 'Сохраняю...' : isEditMode ? 'Сохранить' : 'Добавить'}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: 'var(--color-surface-alt)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-base)',
  color: 'var(--color-text)',
  outline: 'none',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: 'var(--color-surface-alt)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  outline: 'none',
  appearance: 'none',
  cursor: 'pointer',
}
