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
import { CheckCircle, ArrowRight, Pause, Play, WarningCircle } from '@phosphor-icons/react'
import { playSound } from '@/lib/audio'
import { haptic } from '@/lib/haptic'
import { ExerciseSVG } from '@/components/exercises/exercise-svg'

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
  const [skipWarning, setSkipWarning] = useState<{ type: 'warmup' | 'cooldown'; message: string } | null>(null)
  const [painDialog, setPainDialog] = useState(false)

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

  // Touch swipe navigation — hooks MUST be before any early return (Rules of Hooks)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const swipeActionRef = useRef<(dir: 'left' | 'right') => void>(() => {})
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(deltaX) < 60 || deltaY > Math.abs(deltaX) * 0.8) return
    swipeActionRef.current(deltaX < 0 ? 'left' : 'right')
  }, [])

  if (!session) {
    return <div style={{ padding: '24px 0' }}><p>Сессия не найдена</p></div>
  }

  const step = session.steps[currentStep]
  const exercise = step?.exerciseId ? exercises.find(e => e.id === step.exerciseId) : null
  const totalSteps = session.steps.length
  const isLastStep = currentStep === totalSteps - 1

  const isThermotherapyStep = (stepIndex: number) => {
    const s = session.steps[stepIndex]
    return !s.exerciseId && (
      s.label.includes('компресс') ||
      s.label.includes('Тёплый') ||
      s.label.includes('Холодный') ||
      s.label.includes('Расслабление')
    )
  }

  const handleCompleteSession = async () => {
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
    playSound('sessionComplete')
    haptic('milestone')
    setIsComplete(true)
  }

  const handleNextStep = async () => {
    if (isLastStep) {
      await handleCompleteSession()
    } else {
      haptic('light')
      setCurrentStep(prev => prev + 1)
    }
  }

  // Update swipe handler with current step context on every render
  swipeActionRef.current = (dir) => {
    if (dir === 'left' && !isLastStep) void handleNextStep()
    else if (dir === 'right' && currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  const handleStepTimerComplete = () => {
    // Check if this is a passive flexion hold step
    if (step?.exerciseId === 'ex_passive_flexion' && step?.sets) {
      setPainDialog(true)
      return
    }
    handleNextStep()
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
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 5rem)',
        touchAction: 'pan-y',
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

      {/* Step progress pills */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
        {session.steps.map((_, idx) => (
          <div
            key={idx}
            style={{
              width: idx === currentStep ? 20 : 8,
              height: 8,
              borderRadius: 4,
              background: idx <= currentStep ? 'var(--color-primary)' : 'var(--color-border)',
              opacity: idx < currentStep ? 0.5 : 1,
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </div>

      {/* Step content — centered, animated on step change */}
      <div
        key={`step-${currentStep}`}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 16px',
          animation: 'step-slide-in 0.25s ease-out',
        }}
      >
        <style>{`
          @keyframes step-slide-in {
            from { opacity: 0; transform: translateX(20px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
        }}>
          {step.label}
        </h2>

        {/* Exercise SVG illustration */}
        {step.exerciseId && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '16px 0',
            padding: 16,
            background: 'var(--color-surface)',
            borderRadius: 16,
            border: '1px solid var(--color-border)',
          }}>
            <ExerciseSVG exerciseId={step.exerciseId} size={140} />
          </div>
        )}

        {/* Timer for timed steps */}
        {step.durationMin && (
          <TimerDisplay
            key={`timer-${currentStep}`}
            seconds={step.durationMin * 60}
            initialElapsed={stepTimerInitialElapsed}
            autoStart={currentStep === (restored?.currentStep ?? -1) && (restored?.isTimerRunning ?? false)}
            onComplete={handleStepTimerComplete}
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

      {/* Skip Warning Modal */}
      {skipWarning && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 100,
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            maxWidth: '320px',
            width: '100%',
            textAlign: 'center',
          }}>
            <WarningCircle size={48} weight="duotone" style={{ color: 'var(--color-warning)' }} />
            <h3 style={{
              marginTop: '12px',
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
            }}>
              Не пропускай термотерапию
            </h3>
            <p style={{
              marginTop: '8px',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}>
              {skipWarning.message}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => setSkipWarning(null)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Продолжить процедуру
              </button>
              <button
                onClick={() => {
                  setSkipWarning(null)
                  if (isLastStep) {
                    handleCompleteSession()
                  } else {
                    setCurrentStep(prev => prev + 1)
                  }
                }}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Пропустить всё равно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 30-Second Pain Rule Dialog */}
      {painDialog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 100,
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            maxWidth: '320px',
            width: '100%',
          }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '4px',
            }}>
              Правило 30 секунд
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              marginBottom: '16px',
            }}>
              Боль ушла за время удержания?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  setPainDialog(false)
                  handleNextStep()
                }}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Да, ушла — продвигаюсь дальше
              </button>
              <button
                onClick={() => {
                  setPainDialog(false)
                  handleNextStep()
                }}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'color-mix(in srgb, var(--color-warning) 15%, transparent)',
                  color: 'var(--color-text)',
                  border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Нет, осталась — возвращаюсь
              </button>
              <button
                onClick={() => {
                  setPainDialog(false)
                  clearSessionState(sessionId)
                  setIsComplete(true)
                }}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'color-mix(in srgb, var(--color-error) 15%, transparent)',
                  color: 'var(--color-error)',
                  border: '1px solid color-mix(in srgb, var(--color-error) 30%, transparent)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Острая боль — СТОП
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA — always visible, always in thumb zone */}
      <div style={{ padding: '16px 0', display: 'flex', gap: 10 }}>
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              padding: '14px 20px',
              fontSize: 15,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            ← Назад
          </button>
        )}
        {/* For timed steps: show skip button (timer can still run) */}
        {step.durationMin ? (
          <button
            onClick={() => {
              if (isThermotherapyStep(currentStep)) {
                const label = step.label
                const isWarmup = label.includes('Тёплый') || (label.includes('компресс') && !label.includes('Холодный'))
                const message = isWarmup
                  ? 'Тепло увеличивает эластичность капсулы на 15-20%. Без него растяжение менее эффективно и рискованнее.'
                  : 'Холод снимает воспаление после растяжения. Без него отёк может снизить амплитуду на следующей сессии.'
                setSkipWarning({ type: isWarmup ? 'warmup' : 'cooldown', message })
                return
              }
              handleNextStep()
            }}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: '12px',
              fontWeight: 500,
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-base)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isLastStep ? 'Завершить' : 'Пропустить шаг'} <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={() => {
              if (isThermotherapyStep(currentStep)) {
                const label = step.label
                const isWarmup = label.includes('Тёплый') || (label.includes('компресс') && !label.includes('Холодный'))
                const message = isWarmup
                  ? 'Тепло увеличивает эластичность капсулы на 15-20%. Без него растяжение менее эффективно и рискованнее.'
                  : 'Холод снимает воспаление после растяжения. Без него отёк может снизить амплитуду на следующей сессии.'
                setSkipWarning({ type: isWarmup ? 'warmup' : 'cooldown', message })
                return
              }
              handleNextStep()
            }}
            style={{
              flex: 1,
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
        )}
      </div>
    </div>
  )
}

// Timer sub-component — circular SVG ring + digital readout
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

  // Haptic + sound when timer reaches zero
  const completedRef = useRef(false)
  useEffect(() => {
    if (isComplete && !completedRef.current) {
      completedRef.current = true
      haptic('success')
      playSound('holdEnd')
    }
  }, [isComplete])

  // Report timer state changes to parent for persistence
  useEffect(() => {
    onStateChange?.(getElapsed(), isRunning)
  }, [isRunning, remaining, getElapsed, onStateChange])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  // SVG ring parameters
  const R = 68
  const SIZE = 160
  const CIRCUMFERENCE = 2 * Math.PI * R
  const progress = seconds > 0 ? remaining / seconds : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Circular ring */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={isComplete ? 'var(--color-success)' : 'var(--color-primary)'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s ease' }}
          />
        </svg>

        {/* Digital readout centered inside ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            color: isComplete ? 'var(--color-success)' : 'var(--color-text)',
          }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          {isRunning && (
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              идёт
            </span>
          )}
          {!isRunning && !isComplete && remaining > 0 && (
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              пауза
            </span>
          )}
          {isComplete && (
            <span style={{ fontSize: 10, color: 'var(--color-success)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              готово
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
        {!isComplete && (
          <button
            onClick={() => { haptic('light'); isRunning ? pause() : start() }}
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isRunning ? 'var(--color-surface-alt)' : 'var(--color-primary)',
              color: isRunning ? 'var(--color-text)' : 'white',
              border: isRunning ? '1px solid var(--color-border)' : 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-base)',
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
              animation: 'step-slide-in 0.3s ease-out',
            }}
          >
            Далее <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
