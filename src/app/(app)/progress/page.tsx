'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChartLine, Plus, ClockCounterClockwise, Target } from '@phosphor-icons/react'
import { ROMChart } from '@/components/progress/rom-chart'
import { StreakCalendar } from '@/components/progress/streak-calendar'
import { useROMHistory } from '@/hooks/use-rom'
import { getCurrentPhase } from '@/data/patient'
import { phases } from '@/data/phases'

function DeficitInfo() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-muted)',
          fontSize: 12,
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        ℹ Как считается дефицит {open ? '▲' : '▼'}
      </button>

      {open && (
        <div style={{
          marginTop: 10,
          padding: 16,
          background: 'var(--color-surface)',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--color-text)',
        }}>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Дефицит разгибания</p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>
            <strong>0°</strong> (полное разгибание) − ваше разгибание = дефицит
          </p>
          <p style={{
            background: 'var(--color-bg)',
            borderRadius: 8,
            padding: '6px 10px',
            fontFamily: 'monospace',
            marginBottom: 14,
          }}>
            0° − (−15°) = <strong>15° дефицит</strong>
          </p>

          <p style={{ fontWeight: 600, marginBottom: 6 }}>Дефицит сгибания</p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>
            <strong>145°</strong> (норма) − ваше сгибание = дефицит
          </p>
          <p style={{
            background: 'var(--color-bg)',
            borderRadius: 8,
            padding: '6px 10px',
            fontFamily: 'monospace',
            marginBottom: 14,
          }}>
            145° − 110° = <strong>35° дефицит</strong>
          </p>

          <p style={{ fontWeight: 600, marginBottom: 6 }}>Дуга движения (ROM Arc)</p>
          <p style={{
            background: 'var(--color-bg)',
            borderRadius: 8,
            padding: '6px 10px',
            fontFamily: 'monospace',
          }}>
            |дефицит разгибания| + сгибание = arc
          </p>
        </div>
      )}
    </div>
  )
}

export default function ProgressPage() {
  const { latest, best } = useROMHistory()
  const phaseNum = getCurrentPhase()
  const phase = phases.find(p => p.number === phaseNum)
  const targetMin = phase?.romTarget.min ?? 0
  const targetMax = phase?.romTarget.max ?? 180

  const arcColor = latest
    ? latest.arc >= targetMin ? 'var(--color-success)' : latest.arc >= targetMin * 0.8 ? 'var(--color-warning)' : 'var(--color-error)'
    : 'var(--color-text-muted)'

  return (
    <div style={{ paddingTop: '24px', paddingBottom: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <ChartLine size={28} weight="duotone" style={{ color: 'var(--color-primary)' }} />
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)',
          fontWeight: 600, color: 'var(--color-text)', margin: 0,
        }}>
          Прогресс
        </h1>
      </div>

      {/* Current ROM Badge */}
      {latest && (
        <div style={{
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Текущая дуга
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-5xl)',
                fontWeight: 700,
                color: arcColor,
                lineHeight: 1,
              }}>
                {latest.arc}°
              </span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                из {targetMax}°
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Сгиб: {latest.flexion}° · Разгиб: {latest.extensionDeficit > 0 ? `−${latest.extensionDeficit}` : '0'}° · Деф: {latest.extensionDeficit}°
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '6px 10px', borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-light)',
            }}>
              <Target size={14} weight="duotone" style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>
                Фаза {phaseNum}: {targetMin}–{targetMax}°
              </span>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
              {latest.date}
            </p>
          </div>
        </div>
      )}

      {/* Best measurement badge */}
      {best && best !== latest && (
        <div style={{
          marginBottom: 12,
          padding: '10px 16px',
          borderRadius: 12,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Лучший замер</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
              {best.arc}°
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {best.date}
            </span>
          </div>
        </div>
      )}

      {/* Deficit Formula Info */}
      {latest && <DeficitInfo />}

      {/* ROM Chart */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: 'var(--text-sm)', fontWeight: 600,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>
          Амплитуда движений
        </h2>
        <ROMChart />
      </section>

      {/* Streak Calendar */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: 'var(--text-sm)', fontWeight: 600,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>
          Активность
        </h2>
        <StreakCalendar />
      </section>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link
          href="/progress/rom"
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <Plus size={20} weight="bold" />
          Новый замер
        </Link>
        <Link
          href="/progress/rom"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <ClockCounterClockwise size={18} weight="bold" />
          История
        </Link>
      </div>
    </div>
  )
}
