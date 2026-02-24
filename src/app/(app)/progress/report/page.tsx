'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { patient, getDaysSinceSurgery, getWeeksSinceSurgery, getCurrentPhase } from '@/data/patient'
import { phases } from '@/data/phases'
import { useStreak } from '@/hooks/use-streak'
import { useRecoveryScore } from '@/hooks/use-recovery-score'
import { FileText, Printer } from '@phosphor-icons/react'

export default function DoctorReportPage() {
  const days = getDaysSinceSurgery()
  const weeks = getWeeksSinceSurgery()
  const phaseNum = getCurrentPhase()
  const phase = phases.find(p => p.number === phaseNum)
  const { streak, totalSessions, activeDays } = useStreak()
  const score = useRecoveryScore()
  const today = new Date().toISOString().split('T')[0]

  const since30 = (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0] })()

  const recentROMs = useLiveQuery(
    () => db.romMeasurements.orderBy('date').reverse().limit(5).toArray()
  )
  const recentPain = useLiveQuery(
    () => db.painEntries.where('date').between(since30, today, true, true).toArray(),
    [since30, today]
  )
  const recentSleep = useLiveQuery(
    () => db.sleepLogs.where('date').between(since30, today, true, true).toArray(),
    [since30, today]
  )
  const recentSessions = useLiveQuery(
    () => db.exerciseSessions.where('date').between(since30, today, true, true).toArray(),
    [since30, today]
  )

  const avgPain = recentPain && recentPain.length > 0
    ? (recentPain.reduce((s, p) => s + p.level, 0) / recentPain.length).toFixed(1)
    : 'н/д'

  const avgSleep = recentSleep && recentSleep.length > 0
    ? (recentSleep.reduce((s, l) => s + l.totalHours, 0) / recentSleep.length).toFixed(1)
    : 'н/д'

  const sessionsLast30 = recentSessions?.length ?? 0
  const activeDaysLast30 = new Set(recentSessions?.map(s => s.date) ?? []).size

  const latestROM = recentROMs?.[0]
  const bestROM = recentROMs && recentROMs.length > 0
    ? recentROMs.reduce((best, r) => r.arc > best.arc ? r : best, recentROMs[0])
    : null

  const handlePrint = () => {
    window.print()
  }

  const reportDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="py-6" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={28} weight="duotone" style={{ color: 'var(--color-primary)' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 600 }}>
            Отчёт для врача
          </h1>
        </div>
        <button
          onClick={handlePrint}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 16px', borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)', color: '#fff',
            border: 'none', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Printer size={16} weight="bold" />
          Печать
        </button>
      </div>

      {/* Report content */}
      <div id="doctor-report" style={{
        padding: 24, borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600, margin: '0 0 4px' }}>
            Отчёт о реабилитации
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>{reportDate}</p>
        </div>

        {/* Patient info */}
        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Пациент
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 'var(--text-sm)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Имя:</span>
            <span style={{ fontWeight: 500 }}>{patient.name}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Возраст:</span>
            <span style={{ fontWeight: 500 }}>{patient.age} лет</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Операция:</span>
            <span style={{ fontWeight: 500 }}>{patient.surgeryDate} (день {days})</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Неделя:</span>
            <span style={{ fontWeight: 500 }}>{weeks} ({phase?.name})</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Оперированная рука:</span>
            <span style={{ fontWeight: 500 }}>{patient.targetArm === 'right' ? 'Правая' : 'Левая'}</span>
          </div>
        </section>

        {/* ROM */}
        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Амплитуда движений (ROM)
          </h3>
          {latestROM ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Последний замер:</span>
              <span style={{ fontWeight: 500 }}>{latestROM.date}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>Сгибание:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{latestROM.flexion}°</span>
              <span style={{ color: 'var(--color-text-muted)' }}>Дефицит разгибания:</span>
              <span style={{ fontWeight: 500 }}>{latestROM.extensionDeficit}°</span>
              <span style={{ color: 'var(--color-text-muted)' }}>Дуга (Arc):</span>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{latestROM.arc}°</span>
              {latestROM.pronation != null && (
                <>
                  <span style={{ color: 'var(--color-text-muted)' }}>Пронация:</span>
                  <span style={{ fontWeight: 500 }}>{latestROM.pronation}°</span>
                </>
              )}
              {latestROM.supination != null && (
                <>
                  <span style={{ color: 'var(--color-text-muted)' }}>Супинация:</span>
                  <span style={{ fontWeight: 500 }}>{latestROM.supination}°</span>
                </>
              )}
              {bestROM && bestROM.arc > latestROM.arc && (
                <>
                  <span style={{ color: 'var(--color-text-muted)' }}>Лучший результат:</span>
                  <span style={{ fontWeight: 500 }}>{bestROM.arc}° ({bestROM.date})</span>
                </>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Нет замеров</p>
          )}
        </section>

        {/* Activity */}
        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Активность (30 дней)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 'var(--text-sm)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Сессий выполнено:</span>
            <span style={{ fontWeight: 500 }}>{sessionsLast30}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Активных дней:</span>
            <span style={{ fontWeight: 500 }}>{activeDaysLast30} из 30</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Текущий стрик:</span>
            <span style={{ fontWeight: 500 }}>{streak} дней</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Recovery Score сегодня:</span>
            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{score.total}/100</span>
          </div>
        </section>

        {/* Pain & Sleep */}
        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Боль и сон (30 дней)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 'var(--text-sm)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Средняя боль:</span>
            <span style={{ fontWeight: 500 }}>{avgPain}/10</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Средний сон:</span>
            <span style={{ fontWeight: 500 }}>{avgSleep} ч/ночь</span>
          </div>
        </section>

        {/* ROM History */}
        {recentROMs && recentROMs.length > 1 && (
          <section>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              История замеров ROM
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 500 }}>Дата</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-text-muted)', fontWeight: 500 }}>Сгиб.</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-text-muted)', fontWeight: 500 }}>Деф. разг.</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-text-muted)', fontWeight: 500 }}>Arc</th>
                </tr>
              </thead>
              <tbody>
                {recentROMs.map(rom => (
                  <tr key={rom.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '6px 8px' }}>{rom.date}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 500 }}>{rom.flexion}°</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{rom.extensionDeficit}°</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)' }}>{rom.arc}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            Сгенерировано приложением Elbow Recovery | {reportDate}
          </p>
        </div>
      </div>
    </div>
  )
}
