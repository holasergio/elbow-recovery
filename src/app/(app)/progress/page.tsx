'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChartLine, Plus, ClockCounterClockwise, Target, Moon, Heartbeat, TrendUp, TrendDown, FileText } from '@phosphor-icons/react'
import { ROMChart } from '@/components/progress/rom-chart'
import { StreakCalendar } from '@/components/progress/streak-calendar'
import { useROMHistory } from '@/hooks/use-rom'
import { getCurrentPhase } from '@/data/patient'
import { phases } from '@/data/phases'
import { useSleepPainInsight, useWeeklyStats } from '@/hooks/use-insights'

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

// ─── Weekly Summary Card ──────────────────────────────────────────
function WeeklySummaryCard() {
  const stats = useWeeklyStats()

  const sessionDelta = stats.sessionsThisWeek - stats.sessionsLastWeek
  const sessionColor = sessionDelta >= 0 ? 'var(--color-success)' : 'var(--color-warning)'

  return (
    <div style={{
      padding: '16px',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: 20,
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
        Эта неделя
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Sessions */}
        <div style={{ padding: '10px 12px', borderRadius: 10, backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Сессии</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
              {stats.sessionsThisWeek}
            </span>
            {stats.sessionsLastWeek > 0 && (
              <span style={{ fontSize: 11, color: sessionColor, display: 'flex', alignItems: 'center', gap: 2 }}>
                {sessionDelta >= 0
                  ? <TrendUp size={12} weight="bold" />
                  : <TrendDown size={12} weight="bold" />}
                {Math.abs(sessionDelta)}
              </span>
            )}
          </div>
          <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            пред. {stats.sessionsLastWeek}
          </p>
        </div>

        {/* ROM */}
        {stats.romThisWeek !== null && (
          <div style={{ padding: '10px 12px', borderRadius: 10, backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ROM лучший</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
                {stats.romThisWeek}°
              </span>
              {stats.romDelta !== null && (
                <span style={{ fontSize: 11, color: stats.romDelta >= 0 ? 'var(--color-success)' : 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  {stats.romDelta >= 0
                    ? <TrendUp size={12} weight="bold" />
                    : <TrendDown size={12} weight="bold" />}
                  {Math.abs(stats.romDelta)}°
                </span>
              )}
            </div>
            {stats.romLastWeek !== null && (
              <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                пред. {stats.romLastWeek}°
              </p>
            )}
          </div>
        )}

        {/* Sleep */}
        {stats.avgSleepHours !== null && (
          <div style={{ padding: '10px 12px', borderRadius: 10, backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <Moon size={11} weight="duotone" style={{ color: 'var(--color-info)' }} />
              <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Сон</p>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: stats.avgSleepHours >= 7 ? 'var(--color-success)' : 'var(--color-warning)', fontFamily: 'var(--font-display)' }}>
              {stats.avgSleepHours}ч
            </span>
            <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>средн. в неделю</p>
          </div>
        )}

        {/* Pain */}
        {stats.avgPainThisWeek !== null && (
          <div style={{ padding: '10px 12px', borderRadius: 10, backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <Heartbeat size={11} weight="duotone" style={{ color: 'var(--color-error)' }} />
              <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Боль средн.</p>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: stats.avgPainThisWeek <= 3 ? 'var(--color-success)' : stats.avgPainThisWeek <= 6 ? 'var(--color-warning)' : 'var(--color-error)', fontFamily: 'var(--font-display)' }}>
              {stats.avgPainThisWeek}/10
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sleep↔Pain Insight Card ──────────────────────────────────────
function SleepPainInsightCard() {
  const insight = useSleepPainInsight()

  if (!insight.hasData) return null

  const improved = insight.difference > 0.5 // poor sleep → higher pain by 0.5+
  const neutral = !improved

  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: improved
        ? 'color-mix(in srgb, var(--color-info) 10%, transparent)'
        : 'var(--color-surface)',
      border: `1px solid ${improved ? 'color-mix(in srgb, var(--color-info) 25%, transparent)' : 'var(--color-border)'}`,
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Moon size={20} weight="duotone" style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px' }}>
            {improved
              ? `Сон влияет на боль: +${insight.difference} балла`
              : 'Связь сна и боли'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {improved
              ? `При сне <6ч боль в среднем ${insight.poorSleepAvgPain}/10, при ≥6ч — ${insight.goodSleepAvgPain}/10. Хороший сон снижает болевой порог.`
              : neutral
                ? `При сне <6ч: ${insight.poorSleepAvgPain}/10, при ≥6ч: ${insight.goodSleepAvgPain}/10. Разница незначительная.`
                : ''
            }
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Анализ за 60 дней ({insight.poorSleepDays + insight.goodSleepDays} дней с данными)
          </p>
        </div>
      </div>
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
          padding: '18px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '20px',
        }}>
          {/* Arc + target header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Дуга движения
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-5xl)',
                  fontWeight: 700,
                  color: arcColor,
                  lineHeight: 1,
                }}>
                  {latest.arc}°
                </span>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {latest.date}
              </p>
            </div>
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
          </div>

          {/* Flexion + Extension detail row */}
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Flexion */}
            <div style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
            }}>
              <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Сгибание
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                  {latest.flexion}°
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>/ 145°</span>
              </div>
              <p style={{ fontSize: 11, margin: '3px 0 0', color: 145 - latest.flexion > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                {145 - latest.flexion > 0
                  ? `дефицит ${145 - latest.flexion}°`
                  : 'норма ✓'}
              </p>
            </div>

            {/* Extension */}
            <div style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
            }}>
              <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Разгибание
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                  {latest.extensionDeficit > 0 ? `-${latest.extensionDeficit}` : '0'}°
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>/ 0°</span>
              </div>
              <p style={{ fontSize: 11, margin: '3px 0 0', color: latest.extensionDeficit > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                {latest.extensionDeficit > 0
                  ? `дефицит ${latest.extensionDeficit}°`
                  : 'полное ✓'}
              </p>
            </div>
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

      {/* Weekly Summary */}
      <section style={{ marginBottom: '8px' }}>
        <h2 style={{
          fontSize: 'var(--text-sm)', fontWeight: 600,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>
          Итоги недели
        </h2>
        <WeeklySummaryCard />
      </section>

      {/* Sleep↔Pain Insight */}
      <SleepPainInsightCard />

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

      {/* Doctor report link */}
      <Link
        href="/progress/report"
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', marginTop: 12,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)',
          textDecoration: 'none', color: 'inherit',
        }}
      >
        <FileText size={22} weight="duotone" style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', display: 'block' }}>
            Отчёт для врача
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            Сводка ROM, активности, боли для врача
          </span>
        </div>
      </Link>
    </div>
  )
}
