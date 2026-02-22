'use client'

import { useState, useRef, useCallback } from 'react'
import { UploadSimple, CheckCircle, Warning, SpinnerGap, File as FileIcon } from '@phosphor-icons/react'
import { importAllDataJSON } from '@/lib/export'

type ImportState = 'idle' | 'preview' | 'importing' | 'done' | 'error'

interface PreviewData {
  rom: number
  pain: number
  sessions: number
  sleep: number
  supplements: number
  dailyLogs: number
  exportedAt?: string
}

function getPreview(data: Record<string, unknown>): PreviewData {
  return {
    rom: Array.isArray(data.rom) ? data.rom.length : 0,
    pain: Array.isArray(data.pain) ? data.pain.length : 0,
    sessions: Array.isArray(data.sessions) ? data.sessions.length : 0,
    sleep: Array.isArray(data.sleep) ? data.sleep.length : 0,
    supplements: Array.isArray(data.supplements) ? data.supplements.length : 0,
    dailyLogs: Array.isArray(data.dailyLogs) ? data.dailyLogs.length : 0,
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : undefined,
  }
}

const PREVIEW_LABELS: Array<{ key: keyof PreviewData; label: string }> = [
  { key: 'rom', label: 'ROM замеров' },
  { key: 'pain', label: 'записей боли' },
  { key: 'sessions', label: 'сессий' },
  { key: 'sleep', label: 'записей сна' },
  { key: 'supplements', label: 'записей добавок' },
  { key: 'dailyLogs', label: 'записей дневника' },
]

export function DataImport() {
  const [state, setState] = useState<ImportState>('idle')
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [rawJson, setRawJson] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setState('idle')
    setPreview(null)
    setRawJson('')
    setFileName('')
    setResult(null)
    setErrorMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setErrorMessage('')

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.version || data.version !== 1) {
        setState('error')
        setErrorMessage('Неподдерживаемый формат. Файл должен содержать version: 1')
        return
      }

      setRawJson(text)
      setPreview(getPreview(data))
      setState('preview')
    } catch {
      setState('error')
      setErrorMessage('Не удалось прочитать файл. Проверьте, что это корректный JSON.')
    }
  }, [])

  const handleImport = useCallback(async () => {
    if (!rawJson) return

    setState('importing')
    try {
      const res = await importAllDataJSON(rawJson)
      setResult(res)
      setState('done')
    } catch (err) {
      setState('error')
      setErrorMessage(err instanceof Error ? err.message : 'Неизвестная ошибка импорта')
    }
  }, [rawJson])

  const totalPreview = preview
    ? preview.rom + preview.pain + preview.sessions + preview.sleep + preview.supplements + preview.dailyLogs
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* File input area */}
      {(state === 'idle' || state === 'error') && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--color-border)',
              backgroundColor: 'var(--color-surface-alt)',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, background-color 0.15s ease',
            }}
          >
            <UploadSimple size={22} weight="duotone" style={{ color: 'var(--color-primary)' }} />
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--color-text)',
              }}
            >
              Выбрать файл бэкапа (.json)
            </span>
          </button>

          {state === 'error' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)',
              }}
            >
              <Warning
                size={18}
                weight="duotone"
                style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '1px' }}
              />
              <div>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: 'var(--color-error)',
                  }}
                >
                  Ошибка
                </p>
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-error)',
                    marginTop: '2px',
                    opacity: 0.85,
                  }}
                >
                  {errorMessage}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Preview */}
      {state === 'preview' && preview && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* File info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-alt)',
            }}
          >
            <FileIcon size={18} weight="duotone" style={{ color: 'var(--color-primary)' }} />
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text)',
                fontWeight: 500,
              }}
            >
              {fileName}
            </p>
          </div>

          {/* Data counts */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-text)',
                marginBottom: '10px',
              }}
            >
              Найдено записей:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {PREVIEW_LABELS.map(({ key, label }) => {
                const count = preview[key]
                if (key === 'exportedAt' || typeof count !== 'number' || count === 0) return null
                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                      }}
                    >
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
            {preview.exportedAt && (
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  marginTop: '10px',
                }}
              >
                Экспортировано: {new Date(preview.exportedAt).toLocaleString('ru-RU')}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={totalPreview === 0}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: totalPreview === 0 ? 'var(--color-border)' : 'var(--color-primary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: totalPreview === 0 ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s ease',
              }}
            >
              Импортировать ({totalPreview})
            </button>
          </div>
        </div>
      )}

      {/* Importing spinner */}
      {state === 'importing' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '24px',
          }}
        >
          <SpinnerGap
            size={22}
            weight="bold"
            style={{
              color: 'var(--color-primary)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Импортируем данные...
          </span>
        </div>
      )}

      {/* Done */}
      {state === 'done' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-success) 20%, transparent)',
            }}
          >
            <CheckCircle
              size={22}
              weight="duotone"
              style={{ color: 'var(--color-success)', flexShrink: 0 }}
            />
            <p
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-success)',
              }}
            >
              Импортировано {result.imported} записей
            </p>
          </div>

          {result.errors.length > 0 && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)',
              }}
            >
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--color-error)',
                  marginBottom: '6px',
                }}
              >
                Частичные ошибки:
              </p>
              {result.errors.map((err, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-error)',
                    opacity: 0.85,
                  }}
                >
                  {err}
                </p>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            Готово
          </button>
        </div>
      )}
    </div>
  )
}
