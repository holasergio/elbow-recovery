'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { NotePencil, Plus, X, CalendarBlank } from '@phosphor-icons/react'
import { haptic } from '@/lib/haptic'

const TAGS = ['Прогресс', 'Боль', 'Настроение', 'Сон', 'Упражнения', 'Визит к врачу', 'Мысли']

export default function JournalPage() {
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const entries = useLiveQuery(
    () => db.journalEntries.orderBy('date').reverse().limit(30).toArray()
  )

  const today = new Date().toISOString().split('T')[0]

  const handleSave = async () => {
    if (!content.trim()) return
    haptic('success')
    await db.journalEntries.add({
      date: today,
      title: title.trim() || undefined,
      content: content.trim(),
      tags: selectedTags,
      createdAt: new Date().toISOString(),
    })
    setContent('')
    setTitle('')
    setSelectedTags([])
    setShowForm(false)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  }

  return (
    <div className="py-6" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <NotePencil size={28} weight="duotone" style={{ color: 'var(--color-accent)' }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 600 }}>
              Дневник
            </h1>
          </div>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Записи о восстановлении
          </p>
        </div>
        <button
          onClick={() => { haptic('light'); setShowForm(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 16px', borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-accent)', color: '#fff',
            border: 'none', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} weight="bold" />
          Запись
        </button>
      </div>

      {/* New entry form */}
      {showForm && (
        <div style={{
          padding: 20, borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>
              Новая запись
            </span>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X size={20} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>

          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Заголовок (необязательно)"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-text)', fontSize: 'var(--text-sm)', fontFamily: 'inherit',
              marginBottom: 10, outline: 'none', boxSizing: 'border-box',
            }}
          />

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Как прошёл день? Что чувствуешь?"
            rows={5}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-text)', fontSize: 'var(--text-sm)', fontFamily: 'inherit',
              resize: 'none', outline: 'none', boxSizing: 'border-box',
            }}
          />

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: '4px 10px', borderRadius: 'var(--radius-full)',
                  border: selectedTags.includes(tag)
                    ? '2px solid var(--color-accent)'
                    : '1px solid var(--color-border)',
                  backgroundColor: selectedTags.includes(tag)
                    ? 'var(--color-accent-light)' : 'transparent',
                  color: selectedTags.includes(tag) ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 12, cursor: 'pointer', fontWeight: selectedTags.includes(tag) ? 600 : 400,
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={!content.trim()}
            style={{
              marginTop: 16, width: '100%', padding: '12px 0',
              borderRadius: 'var(--radius-md)',
              backgroundColor: content.trim() ? 'var(--color-accent)' : 'var(--color-border)',
              color: content.trim() ? '#fff' : 'var(--color-text-muted)',
              border: 'none', fontWeight: 600, fontSize: 'var(--text-base)',
              cursor: content.trim() ? 'pointer' : 'default',
            }}
          >
            Сохранить
          </button>
        </div>
      )}

      {/* Entries list */}
      {entries && entries.length === 0 && !showForm && (
        <div style={{
          padding: 40, textAlign: 'center', borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
        }}>
          <NotePencil size={48} weight="duotone" style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--color-text)' }}>
            Пока нет записей
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Дневник помогает отслеживать прогресс и эмоции
          </p>
        </div>
      )}

      {entries?.map(entry => (
        <div key={entry.id} style={{
          padding: 16, borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <CalendarBlank size={14} weight="duotone" style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{formatDate(entry.date)}</span>
          </div>
          {entry.title && (
            <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 6px' }}>
              {entry.title}
            </p>
          )}
          <p style={{
            fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)',
            lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap',
          }}>
            {entry.content}
          </p>
          {entry.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
              {entry.tags.map(tag => (
                <span key={tag} style={{
                  padding: '2px 8px', borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)',
                  fontSize: 10, fontWeight: 500,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
