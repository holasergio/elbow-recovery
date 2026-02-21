'use client'

import { useState, useEffect, useCallback } from 'react'
import { Database, Trash, WarningCircle, CheckCircle, ShieldCheck } from '@phosphor-icons/react'
import { db } from '@/lib/db'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Б'
  const units = ['Б', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function StorageInfo() {
  const [used, setUsed] = useState<number | null>(null)
  const [total, setTotal] = useState<number | null>(null)
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    async function loadStorage() {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate()
        setUsed(estimate.usage ?? null)
        setTotal(estimate.quota ?? null)
      }
      if (navigator.storage && navigator.storage.persisted) {
        const isPersisted = await navigator.storage.persisted()
        setPersisted(isPersisted)
      }
    }
    loadStorage()
  }, [cleared])

  const handleClear = useCallback(async () => {
    await db.exerciseSessions.clear()
    await db.romMeasurements.clear()
    await db.painEntries.clear()
    await db.supplementLogs.clear()
    await db.sleepLogs.clear()
    await db.appointments.clear()
    await db.dailyLogs.clear()
    setShowConfirm(false)
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }, [])

  const usagePercent =
    used != null && total != null && total > 0
      ? Math.min((used / total) * 100, 100)
      : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Storage usage */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-surface-alt)',
        }}
      >
        <Database
          size={24}
          weight="duotone"
          style={{ color: 'var(--color-primary)', flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '8px',
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--color-text)',
              }}
            >
              Хранилище
            </p>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              {used != null ? formatBytes(used) : '...'} / {total != null ? formatBytes(total) : '...'}
            </p>
          </div>
          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${usagePercent ?? 0}%`,
                height: '100%',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Persistent storage badge */}
      {persisted != null && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: persisted
              ? 'color-mix(in srgb, var(--color-success) 8%, transparent)'
              : 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
          }}
        >
          <ShieldCheck
            size={18}
            weight="duotone"
            style={{ color: persisted ? 'var(--color-success)' : 'var(--color-warning)' }}
          />
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: persisted ? 'var(--color-success)' : 'var(--color-warning)',
              fontWeight: 500,
            }}
          >
            {persisted
              ? 'Постоянное хранилище активно'
              : 'Данные могут быть очищены браузером'}
          </p>
        </div>
      )}

      {/* Clear data */}
      {cleared ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
            animation: 'var(--animate-fade-in)',
          }}
        >
          <CheckCircle size={20} weight="duotone" style={{ color: 'var(--color-success)' }} />
          <p
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-success)',
            }}
          >
            Данные очищены
          </p>
        </div>
      ) : showConfirm ? (
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid color-mix(in srgb, var(--color-error) 30%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-error) 5%, transparent)',
            animation: 'var(--animate-scale-in)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <WarningCircle
              size={20}
              weight="duotone"
              style={{ color: 'var(--color-error)' }}
            />
            <p
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-error)',
              }}
            >
              Удалить все данные?
            </p>
          </div>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              marginBottom: '16px',
              lineHeight: 1.5,
            }}
          >
            Это действие необратимо. Все записи ROM, боли, сессий, добавок, сна и приёмов будут удалены.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleClear}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'var(--color-error)',
                color: '#FFFFFF',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
              }}
            >
              Удалить всё
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid color-mix(in srgb, var(--color-error) 25%, transparent)',
            backgroundColor: 'transparent',
            color: 'var(--color-error)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          <Trash size={18} weight="duotone" />
          Очистить данные
        </button>
      )}
    </div>
  )
}
