'use client'

import { useState, useCallback } from 'react'
import { Export, ShareNetwork, CheckCircle, SpinnerGap } from '@phosphor-icons/react'
import {
  exportROMData,
  exportPainData,
  exportSessionData,
  exportSleepData,
  exportSupplementData,
  exportDailyLogData,
  exportAllData,
  exportAllDataJSON,
  shareData,
  downloadFile,
} from '@/lib/export'

type ExportType = 'rom' | 'pain' | 'sessions' | 'sleep' | 'supplements' | 'daily' | 'all' | 'json'
type ExportStatus = 'idle' | 'loading' | 'done' | 'error'

const EXPORT_ITEMS: Array<{
  type: ExportType
  label: string
  filename: string
}> = [
  { type: 'rom', label: 'ROM измерения', filename: 'rom-data.csv' },
  { type: 'pain', label: 'Записи боли', filename: 'pain-data.csv' },
  { type: 'sessions', label: 'Сессии упражнений', filename: 'sessions-data.csv' },
  { type: 'sleep', label: 'Протокол сна', filename: 'sleep-data.csv' },
  { type: 'supplements', label: 'Добавки', filename: 'supplements-data.csv' },
  { type: 'daily', label: 'Дневник', filename: 'daily-log.csv' },
  { type: 'all', label: 'Все данные (CSV)', filename: 'elbow-recovery-all.csv' },
  { type: 'json', label: 'Полный бэкап (JSON)', filename: 'elbow-recovery-backup.json' },
]

const exporters: Record<ExportType, () => Promise<string>> = {
  rom: exportROMData,
  pain: exportPainData,
  sessions: exportSessionData,
  sleep: exportSleepData,
  supplements: exportSupplementData,
  daily: exportDailyLogData,
  all: exportAllData,
  json: exportAllDataJSON,
}

const initialStatuses: Record<ExportType, ExportStatus> = {
  rom: 'idle',
  pain: 'idle',
  sessions: 'idle',
  sleep: 'idle',
  supplements: 'idle',
  daily: 'idle',
  all: 'idle',
  json: 'idle',
}

export function DataExport() {
  const [statuses, setStatuses] = useState<Record<ExportType, ExportStatus>>(initialStatuses)

  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  const handleExport = useCallback(
    async (type: ExportType, filename: string, useShare: boolean) => {
      setStatuses((prev) => ({ ...prev, [type]: 'loading' }))
      try {
        const content = await exporters[type]()
        if (type === 'json') {
          downloadFile(content, filename, 'application/json')
        } else if (useShare) {
          await shareData(content, filename)
        } else {
          downloadFile(content, filename)
        }
        setStatuses((prev) => ({ ...prev, [type]: 'done' }))
        setTimeout(() => {
          setStatuses((prev) => ({ ...prev, [type]: 'idle' }))
        }, 2500)
      } catch {
        setStatuses((prev) => ({ ...prev, [type]: 'error' }))
        setTimeout(() => {
          setStatuses((prev) => ({ ...prev, [type]: 'idle' }))
        }, 3000)
      }
    },
    []
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {EXPORT_ITEMS.map(({ type, label, filename }) => {
        const status = statuses[type]
        const isHighlighted = type === 'all' || type === 'json'
        return (
          <div
            key={type}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isHighlighted
                ? 'var(--color-primary-light)'
                : 'var(--color-surface-alt)',
              border: isHighlighted
                ? '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)'
                : 'none',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: isHighlighted ? 600 : 500,
                  color: 'var(--color-text)',
                }}
              >
                {label}
              </p>
              {status === 'done' && (
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-success)',
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle size={12} weight="duotone" />
                  Экспортировано
                </p>
              )}
              {status === 'error' && (
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-error)',
                    marginTop: '2px',
                  }}
                >
                  Ошибка экспорта
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {canShare && type !== 'json' && (
                <button
                  type="button"
                  aria-label={`Поделиться ${label}`}
                  disabled={status === 'loading'}
                  onClick={() => handleExport(type, filename, true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    opacity: status === 'loading' ? 0.6 : 1,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  {status === 'loading' ? (
                    <SpinnerGap
                      size={18}
                      weight="bold"
                      style={{
                        color: 'var(--color-text-muted)',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                  ) : (
                    <ShareNetwork
                      size={18}
                      weight="duotone"
                      style={{ color: 'var(--color-primary)' }}
                    />
                  )}
                </button>
              )}
              <button
                type="button"
                aria-label={`Скачать ${label}`}
                disabled={status === 'loading'}
                onClick={() => handleExport(type, filename, false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: status === 'loading' ? 0.6 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                {status === 'loading' ? (
                  <SpinnerGap
                    size={18}
                    weight="bold"
                    style={{
                      color: 'var(--color-text-muted)',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                ) : (
                  <Export
                    size={18}
                    weight="duotone"
                    style={{ color: 'var(--color-primary)' }}
                  />
                )}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
