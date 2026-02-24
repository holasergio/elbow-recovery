'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { haptic } from '@/lib/haptic'

const MOODS = [
  { value: 1, emoji: '\u{1F629}', label: 'Плохо' },
  { value: 2, emoji: '\u{1F615}', label: 'Так себе' },
  { value: 3, emoji: '\u{1F610}', label: 'Нормально' },
  { value: 4, emoji: '\u{1F60A}', label: 'Хорошо' },
  { value: 5, emoji: '\u{1F929}', label: 'Отлично' },
]

const ENERGY = [
  { value: 1, label: 'Без сил' },
  { value: 2, label: 'Мало' },
  { value: 3, label: 'Средне' },
  { value: 4, label: 'Бодро' },
  { value: 5, label: 'Много' },
]

export function MoodCheckin() {
  const today = new Date().toISOString().split('T')[0]
  const todayMood = useLiveQuery(
    () => db.moodEntries.where('date').equals(today).first(),
    [today]
  )
  const [expanded, setExpanded] = useState(false)
  const [mood, setMood] = useState<number | null>(null)
  const [energy, setEnergy] = useState<number | null>(null)

  if (todayMood) {
    // Already logged — show summary
    const moodInfo = MOODS.find(m => m.value === todayMood.mood)
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface-alt)',
        border: '1px solid var(--color-border)',
        marginTop: 8,
      }}>
        <span style={{ fontSize: 20 }}>{moodInfo?.emoji}</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Настроение: {moodInfo?.label} | Энергия: {todayMood.energy}/5
        </span>
      </div>
    )
  }

  if (!expanded) {
    return (
      <button
        onClick={() => { haptic('light'); setExpanded(true) }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', borderRadius: 'var(--radius-md)',
          backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)',
          cursor: 'pointer', marginTop: 8,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ fontSize: 18 }}>{'\u{1F60A}'}</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', fontWeight: 500 }}>
          Как настроение сегодня?
        </span>
      </button>
    )
  }

  const handleSave = async () => {
    if (!mood || !energy) return
    haptic('success')
    await db.moodEntries.add({
      date: today,
      mood,
      energy,
      createdAt: new Date().toISOString(),
    })
    setExpanded(false)
  }

  return (
    <div style={{
      padding: 16, borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)', marginTop: 8,
    }}>
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>
        Как настроение?
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        {MOODS.map(m => (
          <button
            key={m.value}
            onClick={() => { haptic('light'); setMood(m.value) }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '8px 6px', borderRadius: 'var(--radius-md)',
              border: mood === m.value ? '2px solid var(--color-accent)' : '1px solid transparent',
              backgroundColor: mood === m.value ? 'var(--color-accent-light)' : 'transparent',
              cursor: 'pointer', minWidth: 50,
            }}
          >
            <span style={{ fontSize: 24 }}>{m.emoji}</span>
            <span style={{ fontSize: 10, color: mood === m.value ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
              {m.label}
            </span>
          </button>
        ))}
      </div>

      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>
        Энергия?
      </p>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {ENERGY.map(e => (
          <button
            key={e.value}
            onClick={() => { haptic('light'); setEnergy(e.value) }}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 'var(--radius-md)',
              border: energy === e.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: energy === e.value ? 'var(--color-primary-light)' : 'var(--color-surface-alt)',
              color: energy === e.value ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: 11, fontWeight: energy === e.value ? 600 : 400,
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            {e.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!mood || !energy}
        style={{
          width: '100%', padding: '10px 0', borderRadius: 'var(--radius-md)',
          backgroundColor: mood && energy ? 'var(--color-accent)' : 'var(--color-border)',
          color: mood && energy ? '#fff' : 'var(--color-text-muted)',
          border: 'none', fontWeight: 600, fontSize: 'var(--text-sm)',
          cursor: mood && energy ? 'pointer' : 'default',
        }}
      >
        Сохранить
      </button>
    </div>
  )
}
