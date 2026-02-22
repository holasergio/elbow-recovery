'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTimer } from '@/hooks/use-timer'
import { useWakeLock } from '@/hooks/use-wake-lock'
import { dailySessions } from '@/data/schedule'
import { exercises } from '@/data/exercises'
import { db } from '@/lib/db'
import {
  saveSessionState,
  loadSessionState,
  clearSessionState,
  type ActiveSessionState,
} from '@/lib/session-store'
import { CheckCircle, ArrowRight, Pause, Play } from '@phosphor-icons/react'

interface SessionRunnerProps {
  sessionId: number
}

export function SessionRunner({ sessionId }: SessionRunnerProps) {
  const router = useRouter()
  const session = dailySessions.find(s => s.id === sessionId)

  // Restore persisted state synchronously from localStorage on first render
  const restoredRef = useRef<ActiveSessionState | null>(null)
  if (restoredRef.current === undefined || restoredRef.current === null) {
    // Only check once — on very first render
    if (typeof window !== 'undefined') {
      restoredRef.current = loadSessionState(sessionId)
    }
  }
  const restored = restoredRef.current

  const [currentStep, setCurrentStep] = useState(() => restored?.currentStep ?? 0)
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(() => restored?.startTime ?? new Date().toISOString())

  // Track timer elapsed for current step — updated by TimerDisplay via callback
  const timerElapsedRef = useRef<number>(restored?.timerElapsedSeconds ?? 0)
  const timerRunningRef = useRef<boolean>(restored?.isTimerRunning ?? false)

  // Refs for unmount cleanup (so the cleanup closure always has latest values)
  const currentStepRef = useRef(currentStep)
  currentStepRef.current = currentStep
  const isCompleteRef = useRef(isComplete)
  isCompleteRef.current = isComplete
  const startTimeRef = useRef(startTime)
  startTimeRef.current = startTime

  // Compute initial elapsed for timer: if we restored AND the timer was running,
  // account for time that passed while the user was away
  const [initialTimerElapsed] = useState(() => {
    if (!restored) return 0
    if (restored.isTimerRunning) {
      // Timer was running when user left — add the time that passed
      const secondsSinceSave = Math.floor((Date.now() - restored.savedAt) / 1000)
      return restored.timerElapsedSeconds + secondsSinceSave
    }
    // Timer was paused — restore exact elapsed
    return restored.timerElapsedSeconds
  })

  useWakeLock(!isComplete)

  // Persistence: save state on step changes
  useEffect(() => {
    if (isComplete || !session) return
    // Reset timer elapsed tracking when step changes (except for initial restore)
    if (currentStep !== (restored?.currentStep ?? 0)) {
      timerElapsedRef.current = 0
      timerRunningRef.current = false
    }
    saveSessionState({
      sessionId,
      currentStep,
      startTime,
      timerElapsedSeconds: timerElapsedRef.current,
      isTimerRunning: timerRunningRef.current,
      savedAt: Date.now(),
    })
  }, [currentStep, sessionId, startTime, isComplete, session, restored?.currentStep])

  // Persistence: periodic save every 5 seconds (for timer progress)
  useEffect(() => {
    if (isComplete || !session) return
    const interval = setInterval(() => {
      saveSessionState({
        sessionId,
        currentStep,
        startTime,
        timerElapsedSeconds: timerElapsedRef.current,
        isTimerRunning: timerRunningRef.current,
        savedAt: Date.now(),
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [currentStep, sessionId, startTime, isComplete, session])

  // Save state on unmount (user navigates away)
  // Uses refs so the cleanup closure always has the latest values
  useEffect(() => {
    if (!session) return
    return () => {
      // Only save if not complete — complete sessions get cleared
      if (!isCompleteRef.current) {
        saveSessionState({
          sessionId,
          currentStep: currentStepRef.current,
          startTime: startTimeRef.current,
          timerElapsedSeconds: timerElapsedRef.current,
          isTimerRunning: timerRunningRef.current,
          savedAt: Date.now(),
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — we want the cleanup only on unmount

  // Callback for TimerDisplay to report its state
  const handleTimerStateChange = useCallback((elapsed: number, running: boolean) => {
    timerElapsedRef.current = elapsed
    timerRunningRef.current = running
  }, [])

  if (!session) {
    return <div style={{ padding: '24px 0' }}><p>Сессия не найдена</p></div>
  }

  const step = session.steps[currentStep]
  const exercise = step?.exerciseId ? exercises.find(e => e.id === step.exerciseId) : null
  const totalSteps = session.steps.length
  const isLastStep = currentStep === totalSteps - 1

  const handleNextStep = async () => {
    if (isLastStep) {
      // Save individual exercise completions to DB
      const today = new Date().toISOString().split('T')[0]
      const completedAt = new Date().toISOString()
      const exerciseSteps = session.steps.filter(s => s.exerciseId)

      for (const step of exerciseSteps) {
        await db.exerciseSessions.add({
          exerciseId: step.exerciseId!,
          sessionSlot: sessionId,
          date: today,
          startedAt: startTime,
          completedAt,
          completedSets: step.sets ?? 1,
          completedReps: step.reps ?? 0,
        })
      }

      // Clear persisted state — session is done
      clearSessionState(sessionId)
      setIsComplete(true)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  if (isComplete) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        padding: '0 24px',
      }}>
        <CheckCircle size={64} weight="fill" style={{ color: 'var(--color-primary)' }} />
        <h2 style={{
          marginTop: '16px',
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
        }}>
          Сессия завершена
        </h2>
        <p style={{ marginTop: '8px', color: 'var(--color-text-secondary)' }}>
          {session.name} · {session.durationMin} мин
        </p>
        <p style={{ marginTop: '4px', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Ты наращиваешь стабильность.
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            marginTop: '32px',
            width: '100%',
            padding: '16px 0',
            borderRadius: '12px',
            fontWeight: 500,
            color: 'white',
            fontSize: 'var(--text-lg)',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          На главную
        </button>
      </div>
    )
  }

  // Determine initial elapsed for the current step's timer
  // Only apply restored timer elapsed on the step that was saved
  const stepTimerInitialElapsed = (currentStep === (restored?.currentStep ?? -1))
    ? initialTimerElapsed
    : 0

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 5rem)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
      }}>
        <button
          onClick={() => router.push('/')}
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ← Назад
        </button>
        <span style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
        }}>
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '4px',
        borderRadius: '9999px',
        overflow: 'hidden',
        marginBottom: '24px',
        backgroundColor: 'var(--color-border)',
      }}>
        <div
          style={{
            height: '100%',
            borderRadius: '9999px',
            transition: 'width 0.3s ease',
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
            backgroundColor: 'var(--color-primary)',
          }}
        />
      </div>

      {/* Step content — centered */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 16px',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
        }}>
          {step.label}
        </h2>

        {/* Timer for timed steps */}
        {step.durationMin && (
          <TimerDisplay
            key={`timer-${currentStep}`}
            seconds={step.durationMin * 60}
            initialElapsed={stepTimerInitialElapsed}
            autoStart={currentStep === (restored?.currentStep ?? -1) && (restored?.isTimerRunning ?? false)}
            onComplete={handleNextStep}
            onStateChange={handleTimerStateChange}
          />
        )}

        {/* Reps counter */}
        {step.reps && !step.durationMin && (
          <div style={{ marginTop: '24px' }}>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)' }}>
              {step.sets ? `${step.sets} сета × ${step.reps} повторов` : `${step.reps} повторов`}
            </p>
          </div>
        )}

        {/* Reps info alongside timer */}
        {step.reps && step.durationMin && (
          <div style={{ marginTop: '8px' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              {step.sets ? `${step.sets} сета × ${step.reps} повторов` : `${step.reps} повторов`}
            </p>
          </div>
        )}

        {/* Exercise details */}
        {exercise && (
          <div style={{ marginTop: '24px', textAlign: 'left', width: '100%' }}>
            {exercise.phases.map((phase, i) => (
              <div key={i} style={{
                marginBottom: '12px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-surface-alt)',
              }}>
                <p style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{phase.name}</p>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  marginTop: '4px',
                  color: 'var(--color-text-secondary)',
                }}>{phase.description}</p>
              </div>
            ))}
            <div style={{
              marginTop: '12px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
            }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                ✓ {exercise.goodFeeling}
              </p>
            </div>
            {exercise.badFeeling && (
              <div style={{
                marginTop: '8px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(194, 91, 78, 0.1)',
              }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}>
                  ✗ {exercise.badFeeling}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Note */}
        {step.note && (
          <p style={{
            marginTop: '16px',
            fontSize: 'var(--text-sm)',
            fontStyle: 'italic',
            color: 'var(--color-text-muted)',
          }}>
            {step.note}
          </p>
        )}
      </div>

      {/* Bottom CTA — always visible, always in thumb zone */}
      {!step.durationMin && (
        <div style={{ padding: '16px 0' }}>
          <button
            onClick={handleNextStep}
            style={{
              width: '100%',
              padding: '16px 0',
              borderRadius: '12px',
              fontWeight: 500,
              color: 'white',
              fontSize: 'var(--text-lg)',
              backgroundColor: 'var(--color-primary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isLastStep ? 'Завершить' : 'Далее'}
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

// Timer sub-component with persistence support
function TimerDisplay({
  seconds,
  initialElapsed = 0,
  autoStart = false,
  onComplete,
  onStateChange,
}: {
  seconds: number
  initialElapsed?: number
  autoStart?: boolean
  onComplete: () => void
  onStateChange?: (elapsed: number, running: boolean) => void
}) {
  const { remaining, isRunning, start, pause, isComplete, getElapsed } = useTimer(seconds, initialElapsed)

  // Auto-start if restoring a running timer
  const autoStartedRef = useRef(false)
  useEffect(() => {
    if (autoStart && !autoStartedRef.current && !isComplete) {
      autoStartedRef.current = true
      start()
    }
  }, [autoStart, start, isComplete])

  // Report timer state changes to parent for persistence
  useEffect(() => {
    onStateChange?.(getElapsed(), isRunning)
  }, [isRunning, remaining, getElapsed, onStateChange])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div style={{
      marginTop: '32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
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

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        {!isComplete && (
          <button
            onClick={isRunning ? pause : start}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isRunning ? 'var(--color-surface-alt)' : 'var(--color-primary)',
              color: isRunning ? 'var(--color-text)' : 'white',
              border: isRunning ? '1px solid var(--color-border)' : 'none',
              cursor: 'pointer',
            }}
          >
            {isRunning ? <><Pause size={18} /> Пауза</> : <><Play size={18} weight="fill" /> Старт</>}
          </button>
        )}
        {isComplete && (
          <button
            onClick={onComplete}
            style={{
              padding: '12px 32px',
              borderRadius: '12px',
              fontWeight: 500,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-primary)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Далее <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
