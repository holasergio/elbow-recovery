'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Wind, Play, Pause, ArrowCounterClockwise } from '@phosphor-icons/react'
import { haptic } from '@/lib/haptic'

type Phase = 'inhale' | 'hold' | 'exhale' | 'idle'

const PATTERNS = {
  '4-7-8': { inhale: 4, hold: 7, exhale: 8, name: 'Релаксация 4-7-8', desc: 'Глубокое расслабление перед сном' },
  'box': { inhale: 4, hold: 4, exhale: 4, name: 'Квадратное дыхание', desc: 'Баланс и фокус' },
  'calm': { inhale: 4, hold: 2, exhale: 6, name: 'Успокоение 4-2-6', desc: 'Быстрое снижение тревоги' },
} as const

type PatternKey = keyof typeof PATTERNS

const phaseLabels: Record<Phase, string> = {
  inhale: 'Вдох',
  hold: 'Задержка',
  exhale: 'Выдох',
  idle: 'Готов',
}

const phaseColors: Record<Phase, string> = {
  inhale: 'var(--color-info)',
  hold: 'var(--color-accent)',
  exhale: 'var(--color-primary)',
  idle: 'var(--color-text-muted)',
}

export default function BreathingPage() {
  const [pattern, setPattern] = useState<PatternKey>('4-7-8')
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [timer, setTimer] = useState(0)
  const [cycles, setCycles] = useState(0)
  const [totalCycles] = useState(4)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseRef = useRef<Phase>('idle')
  const timerRef = useRef(0)
  const cycleRef = useRef(0)

  const p = PATTERNS[pattern]

  const nextPhase = useCallback(() => {
    const current = phaseRef.current
    if (current === 'inhale') {
      phaseRef.current = 'hold'
      timerRef.current = p.hold
    } else if (current === 'hold') {
      phaseRef.current = 'exhale'
      timerRef.current = p.exhale
    } else {
      // exhale → next cycle or done
      cycleRef.current += 1
      setCycles(cycleRef.current)
      if (cycleRef.current >= totalCycles) {
        // Done
        phaseRef.current = 'idle'
        timerRef.current = 0
        setRunning(false)
        haptic('success')
        // Mark as done today
        const today = new Date().toISOString().split('T')[0]
        localStorage.setItem(`breathing_${today}`, 'done')
      } else {
        phaseRef.current = 'inhale'
        timerRef.current = p.inhale
        haptic('light')
      }
    }
    setPhase(phaseRef.current)
    setTimer(timerRef.current)
  }, [p, totalCycles])

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      timerRef.current -= 1
      if (timerRef.current <= 0) {
        nextPhase()
      } else {
        setTimer(timerRef.current)
      }
    }, 1000)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, nextPhase])

  const start = () => {
    haptic('medium')
    phaseRef.current = 'inhale'
    timerRef.current = p.inhale
    cycleRef.current = 0
    setPhase('inhale')
    setTimer(p.inhale)
    setCycles(0)
    setRunning(true)
  }

  const pause = () => {
    setRunning(false)
  }

  const reset = () => {
    setRunning(false)
    setPhase('idle')
    setTimer(0)
    setCycles(0)
  }

  // Circle animation
  const maxTime = phase === 'inhale' ? p.inhale : phase === 'hold' ? p.hold : phase === 'exhale' ? p.exhale : 1
  const progress = maxTime > 0 ? (maxTime - timer) / maxTime : 0
  const circleScale = phase === 'inhale' ? 0.6 + 0.4 * progress : phase === 'exhale' ? 1 - 0.4 * progress : phase === 'hold' ? 1 : 0.6

  return (
    <div className="py-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Wind size={28} weight="duotone" style={{ color: 'var(--color-info)' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 600 }}>
            Дыхание
          </h1>
        </div>
        <p className="mt-2" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Дыхательные практики для восстановления
        </p>
      </div>

      {/* Pattern selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {(Object.keys(PATTERNS) as PatternKey[]).map(key => (
          <button
            key={key}
            onClick={() => { if (!running) { setPattern(key); reset() } }}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              border: pattern === key ? '2px solid var(--color-info)' : '1px solid var(--color-border)',
              backgroundColor: pattern === key ? 'color-mix(in srgb, var(--color-info) 10%, transparent)' : 'var(--color-surface)',
              color: pattern === key ? 'var(--color-info)' : 'var(--color-text)',
              fontSize: 'var(--text-sm)',
              fontWeight: pattern === key ? 600 : 400,
              cursor: running ? 'default' : 'pointer',
              opacity: running && pattern !== key ? 0.5 : 1,
            }}
          >
            {PATTERNS[key].name}
          </button>
        ))}
      </div>

      {/* Breathing circle */}
      <div style={{
        width: 220, height: 220,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: `${circleScale * 100}%`,
          height: `${circleScale * 100}%`,
          borderRadius: '50%',
          backgroundColor: `color-mix(in srgb, ${phaseColors[phase]} 15%, transparent)`,
          border: `3px solid ${phaseColors[phase]}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 1s ease-in-out',
        }}>
          <span style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: phaseColors[phase],
            lineHeight: 1,
          }}>
            {running ? timer : '—'}
          </span>
          <span style={{
            fontSize: 'var(--text-sm)',
            color: phaseColors[phase],
            fontWeight: 500,
            marginTop: 4,
          }}>
            {phaseLabels[phase]}
          </span>
        </div>
      </div>

      {/* Cycle counter */}
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: totalCycles }, (_, i) => (
          <div key={i} style={{
            width: 10, height: 10,
            borderRadius: '50%',
            backgroundColor: i < cycles ? 'var(--color-info)' : 'var(--color-border)',
            transition: 'background-color 0.3s',
          }} />
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12 }}>
        {!running && phase === 'idle' && (
          <button
            onClick={start}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 28px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-info)',
              color: '#fff',
              border: 'none',
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Play size={20} weight="fill" />
            Начать
          </button>
        )}
        {running && (
          <button
            onClick={pause}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 28px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Pause size={20} weight="fill" />
            Пауза
          </button>
        )}
        {!running && phase !== 'idle' && (
          <>
            <button onClick={start} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-info)', color: '#fff',
              border: 'none', fontSize: 'var(--text-base)', fontWeight: 600, cursor: 'pointer',
            }}>
              <Play size={20} weight="fill" /> Продолжить
            </button>
            <button onClick={reset} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: '50%',
              backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
              cursor: 'pointer',
            }}>
              <ArrowCounterClockwise size={20} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </>
        )}
      </div>

      {/* Description */}
      <div style={{
        padding: 16, borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
        textAlign: 'center', maxWidth: 320,
      }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', fontWeight: 500, margin: '0 0 4px' }}>
          {p.name}
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
          {p.desc}. Вдох {p.inhale}с → Задержка {p.hold}с → Выдох {p.exhale}с × {totalCycles} циклов
        </p>
      </div>
    </div>
  )
}
