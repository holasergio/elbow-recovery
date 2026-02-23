'use client'

import { Ruler, Camera, User, UserCircle } from '@phosphor-icons/react'
import { ROMInput } from '@/components/progress/rom-input'
import { useROMHistory } from '@/hooks/use-rom'
import type { ROMMeasurement } from '@/lib/db'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function HistoryEntry({ entry }: { entry: ROMMeasurement }) {
  return (
    <div style={{
      padding: '16px',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
    }}>
      {/* Date & arc */}
      <div style={{ minWidth: '60px' }}>
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
        }}>
          {formatDate(entry.date)}
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: 'var(--color-primary)',
          marginTop: '2px',
        }}>
          {entry.arc}°
        </p>
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          flexWrap: 'wrap',
        }}>
          <span>Сгиб: {entry.flexion}°</span>
          <span>Разгиб: {entry.extensionDeficit > 0 ? `−${entry.extensionDeficit}` : '0'}°</span>
          <span>Деф.разг: {entry.extensionDeficit}°</span>
          {entry.pronation != null && <span>Прон: {entry.pronation}°</span>}
          {entry.supination != null && <span>Суп: {entry.supination}°</span>}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginTop: '6px',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
        }}>
          {entry.measuredBy === 'physio'
            ? <><UserCircle size={14} weight="duotone" /> Физиотерапевт</>
            : <><User size={14} weight="duotone" /> Самостоятельно</>
          }
        </div>
        {entry.notes && (
          <p style={{
            marginTop: '6px',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
          }}>
            {entry.notes}
          </p>
        )}
      </div>

      {/* Photo thumbnails */}
      {(entry.photoFlexion || entry.photoExtension) && (
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {entry.photoFlexion && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.photoFlexion}
              alt="Фото сгибания"
              style={{
                width: '44px',
                height: '44px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
              }}
            />
          )}
          {entry.photoExtension && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.photoExtension}
              alt="Фото разгибания"
              style={{
                width: '44px',
                height: '44px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default function ROMPage() {
  const { measurements, isLoading } = useROMHistory()
  const reversedMeasurements = [...measurements].reverse()

  return (
    <div style={{ paddingTop: '24px', paddingBottom: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ruler size={22} weight="duotone" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: 0,
          }}>
            Замер ROM
          </h1>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: '2px',
          }}>
            Объём движений в локтевом суставе
          </p>
        </div>
      </div>

      {/* ROM Input Form */}
      <ROMInput />

      {/* History */}
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xl)',
          fontWeight: 600,
          color: 'var(--color-text)',
          marginBottom: '12px',
        }}>
          История замеров
        </h2>

        {isLoading ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Загрузка...
          </p>
        ) : reversedMeasurements.length === 0 ? (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-alt)',
          }}>
            <Camera size={36} weight="duotone" style={{ color: 'var(--color-text-muted)', margin: '0 auto 8px' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Пока нет замеров. Сделайте первый выше.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {reversedMeasurements.map((entry) => (
              <HistoryEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
