'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTimer } from '@/hooks/use-timer'
import { useWakeLock } from '@/hooks/use-wake-lock'
import { dailySessions } from '@/data/schedule'
import { exercises } from '@/data/exercises'
import { db } from '@/lib/db'
import { CheckCircle, ArrowRight, Pause, Play } from '@phosphor-icons/react'

interface SessionRunnerProps {
  sessionId: number
}

export function SessionRunner({ sessionId }: SessionRunnerProps) {
  const router = useRouter()
  const session = dailySessions.find(s => s.id === sessionId)
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(new Date().toISOString())

  useWakeLock(!isComplete)

  if (!session) {
    return <div className="py-6"><p>Сессия не найдена</p></div>
  }

  const step = session.steps[currentStep]
  const exercise = step?.exerciseId ? exercises.find(e => e.id === step.exerciseId) : null
  const totalSteps = session.steps.length
  const isLastStep = currentStep === totalSteps - 1

  const handleNextStep = async () => {
    if (isLastStep) {
      // Save session to DB
      const today = new Date().toISOString().split('T')[0]
      await db.exerciseSessions.add({
        exerciseId: 'session_' + sessionId,
        sessionSlot: sessionId,
        date: today,
        startedAt: startTime,
        completedAt: new Date().toISOString(),
        completedSets: 0,
        completedReps: 0,
      })
      setIsComplete(true)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <CheckCircle size={64} weight="fill" style={{ color: 'var(--color-primary)' }} />
        <h2 className="mt-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600 }}>
          Сессия завершена
        </h2>
        <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          {session.name} · {session.durationMin} мин
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Ты наращиваешь стабильность.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-8 w-full py-4 rounded-xl font-medium text-white text-lg"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          На главную
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <button onClick={() => router.push('/')} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          ← Назад
        </button>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden mb-6" style={{ backgroundColor: 'var(--color-border)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
            backgroundColor: 'var(--color-primary)',
          }}
        />
      </div>

      {/* Step content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600 }}>
          {step.label}
        </h2>

        {/* Timer for timed steps */}
        {step.durationMin && (
          <TimerDisplay seconds={step.durationMin * 60} onComplete={handleNextStep} />
        )}

        {/* Reps counter */}
        {step.reps && !step.durationMin && (
          <div className="mt-6">
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              {step.sets ? `${step.sets} сета × ${step.reps} повторов` : `${step.reps} повторов`}
            </p>
          </div>
        )}

        {/* Reps info alongside timer */}
        {step.reps && step.durationMin && (
          <div className="mt-2">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {step.sets ? `${step.sets} сета × ${step.reps} повторов` : `${step.reps} повторов`}
            </p>
          </div>
        )}

        {/* Exercise details */}
        {exercise && (
          <div className="mt-6 text-left w-full">
            {exercise.phases.map((phase, i) => (
              <div key={i} className="mb-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                <p className="font-medium text-sm">{phase.name}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{phase.description}</p>
              </div>
            ))}
            <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary-light)' }}>
              <p className="text-sm" style={{ color: 'var(--color-primary)' }}>✓ {exercise.goodFeeling}</p>
            </div>
            {exercise.badFeeling && (
              <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(194, 91, 78, 0.1)' }}>
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>✗ {exercise.badFeeling}</p>
              </div>
            )}
          </div>
        )}

        {/* Note */}
        {step.note && (
          <p className="mt-4 text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
            {step.note}
          </p>
        )}
      </div>

      {/* Bottom CTA — always visible, always in thumb zone */}
      {!step.durationMin && (
        <div className="py-4">
          <button
            onClick={handleNextStep}
            className="w-full py-4 rounded-xl font-medium text-white text-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {isLastStep ? 'Завершить' : 'Далее'}
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

// Timer sub-component
function TimerDisplay({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const { remaining, isRunning, start, pause, isComplete } = useTimer(seconds)

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="mt-8 flex flex-col items-center">
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '4rem',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        color: isComplete ? 'var(--color-primary)' : 'var(--color-text)',
      }}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </p>

      <div className="flex gap-3 mt-4">
        {!isComplete && (
          <button
            onClick={isRunning ? pause : start}
            className="px-6 py-3 rounded-xl font-medium flex items-center gap-2"
            style={{
              backgroundColor: isRunning ? 'var(--color-surface-alt)' : 'var(--color-primary)',
              color: isRunning ? 'var(--color-text)' : 'white',
              border: isRunning ? '1px solid var(--color-border)' : 'none',
            }}
          >
            {isRunning ? <><Pause size={18} /> Пауза</> : <><Play size={18} weight="fill" /> Старт</>}
          </button>
        )}
        {isComplete && (
          <button
            onClick={onComplete}
            className="px-8 py-3 rounded-xl font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Далее <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
