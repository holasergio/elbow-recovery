'use client'

import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { dailySessions, type DailySession } from '@/data/schedule'
import { WarningCircle, Play, CaretDown, CaretUp, X } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { haptic } from '@/lib/haptic'

const SKIP_REASONS = [
  'Боль/дискомфорт',
  'Усталость',
  'Работа/дела',
  'Забыл',
  'Нет времени',
  'Другое',
]

export function MissedSessions() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [skipTarget, setSkipTarget] = useState<DailySession | null>(null)
  const [skipReason, setSkipReason] = useState<string | null>(null)
  const today = new Date().toISOString().split('T')[0]

  const todaySessions = useLiveQuery(
    () => db.exerciseSessions.where('date').equals(today).toArray(),
    [today]
  )

  const missedSessions = useMemo(() => {
    if (!todaySessions) return []
    const now = new Date()
    const currentTimeMin = now.getHours() * 60 + now.getMinutes()
    const completedSlots = new Set(todaySessions.map(s => s.sessionSlot))
    return dailySessions.filter(session => {
      const [h, m] = session.time.split(':').map(Number)
      return (currentTimeMin > h * 60 + m + 30) && !completedSlots.has(session.id)
    })
  }, [todaySessions])

  if (!missedSessions || missedSessions.length === 0) return null

  const now = new Date()

  const handleSkipConfirm = async () => {
    if (!skipTarget || !skipReason) return
    haptic('medium')
    await db.skippedSessions.add({
      sessionSlot: skipTarget.id,
      date: today,
      reason: skipReason,
      skippedAt: new Date().toISOString(),
    })
    setSkipTarget(null)
    setSkipReason(null)
  }

  return (
    <>
      <div style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
        border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)',
        marginTop: '12px',
        overflow: 'hidden',
      }}>
        {/* Collapsed header */}
        <button
          onClick={() => { haptic('light'); setOpen(o => !o) }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            textAlign: 'left',
          }}
        >
          <WarningCircle size={18} weight="duotone" style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
            {missedSessions.length === 1
              ? 'Пропущена 1 сессия'
              : `Пропущено ${missedSessions.length} сессии`}
          </span>
          {open
            ? <CaretUp size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            : <CaretDown size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          }
        </button>

        {/* Expandable list */}
        {open && (
          <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {missedSessions.map(session => {
              const [h, m] = session.time.split(':').map(Number)
              const sessionDate = new Date()
              sessionDate.setHours(h, m, 0, 0)
              const diffMin = Math.floor((now.getTime() - sessionDate.getTime()) / 60000)
              const diffText = diffMin < 60
                ? `${diffMin} мин назад`
                : `${Math.floor(diffMin / 60)} ч назад`

              return (
                <div
                  key={session.id}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {/* Session row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, margin: 0, color: 'var(--color-text)' }}>
                        {session.name} ({session.time})
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                        {diffText}
                      </p>
                    </div>
                    {/* Actions */}
                    <button
                      onClick={() => { haptic('light'); router.push(`/session/${session.id}`) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '6px 10px', borderRadius: 8,
                        backgroundColor: 'var(--color-primary)', border: 'none',
                        color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <Play size={14} weight="fill" />
                      Начать
                    </button>
                    <button
                      onClick={() => { haptic('light'); setSkipTarget(session); setSkipReason(null) }}
                      style={{
                        padding: '6px 10px', borderRadius: 8,
                        backgroundColor: 'transparent',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      Пропустить
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Skip reason bottom sheet */}
      {skipTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setSkipTarget(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '20px 20px 0 0',
              padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
              animation: 'sheet-up 0.25s ease-out',
            }}
          >
            <style>{`
              @keyframes sheet-up {
                from { transform: translateY(100%); }
                to   { transform: translateY(0); }
              }
            `}</style>

            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--color-border)', margin: '0 auto 16px' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600, margin: 0 }}>
                Почему пропускаем?
              </h3>
              <button onClick={() => setSkipTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 16 }}>
              {skipTarget.name} ({skipTarget.time})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SKIP_REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => { haptic('light'); setSkipReason(reason) }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: skipReason === reason
                      ? '2px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                    backgroundColor: skipReason === reason
                      ? 'var(--color-primary-light)'
                      : 'var(--color-surface-alt)',
                    color: skipReason === reason ? 'var(--color-primary)' : 'var(--color-text)',
                    fontWeight: skipReason === reason ? 600 : 400,
                    fontSize: 'var(--text-sm)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>

            <button
              onClick={handleSkipConfirm}
              disabled={!skipReason}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '14px 0',
                borderRadius: 12,
                backgroundColor: skipReason ? 'var(--color-error)' : 'var(--color-border)',
                color: skipReason ? '#fff' : 'var(--color-text-muted)',
                border: 'none',
                fontWeight: 600,
                fontSize: 'var(--text-base)',
                cursor: skipReason ? 'pointer' : 'default',
              }}
            >
              Пропустить сессию
            </button>
          </div>
        </div>
      )}
    </>
  )
}
