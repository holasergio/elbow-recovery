'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/stores/app-store'
import { FirstAidKit, CalendarCheck, Confetti, ArrowRight, Check, PencilSimple } from '@phosphor-icons/react'
import { getDaysSinceSurgery, getEffectiveSurgeryDate } from '@/data/patient'

/* ──────────────────────────────────────────── */
/*  Step indicator dots                         */
/* ──────────────────────────────────────────── */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: i === current ? 'var(--color-primary)' : 'var(--color-border)',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────── */
/*  Shared primary button                       */
/* ──────────────────────────────────────────── */
function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 rounded-2xl text-base font-semibold transition-all active:scale-[0.98]"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
        boxShadow: '0 4px 12px rgba(91, 138, 114, 0.3)',
      }}
    >
      {children}
    </button>
  )
}

/* ──────────────────────────────────────────── */
/*  Step 1 — Welcome                            */
/* ──────────────────────────────────────────── */
function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-8"
      style={{ animation: 'fade-in 0.4s ease-out' }}
    >
      <div
        className="mb-8 rounded-full flex items-center justify-center"
        style={{
          width: 120,
          height: 120,
          backgroundColor: 'var(--color-primary-light)',
        }}
      >
        <FirstAidKit size={80} weight="duotone" style={{ color: 'var(--color-primary)' }} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          fontWeight: 600,
          color: 'var(--color-text)',
          lineHeight: 1.2,
        }}
      >
        Elbow Recovery
      </h1>

      <p
        className="mt-3 text-lg"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-primary)',
          fontWeight: 500,
          fontStyle: 'italic',
        }}
      >
        Твой помощник в реабилитации
      </p>

      <p
        className="mt-6 text-base leading-relaxed"
        style={{ color: 'var(--color-text-secondary)', maxWidth: 320 }}
      >
        Отслеживай упражнения, измеряй прогресс, контролируй добавки и сон. Всё для восстановления твоего локтя.
      </p>

      <div className="mt-10 w-full">
        <PrimaryButton onClick={onNext}>
          <span className="flex items-center justify-center gap-2">
            Начать <ArrowRight size={20} weight="bold" />
          </span>
        </PrimaryButton>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────── */
/*  Step 2 — Surgery date confirmation          */
/* ──────────────────────────────────────────── */
function StepSurgeryDate({ onNext }: { onNext: () => void }) {
  const { setSurgeryDate } = useAppStore()
  const [editing, setEditing] = useState(false)
  const [dateValue, setDateValue] = useState(getEffectiveSurgeryDate)
  const [days, setDays] = useState(getDaysSinceSurgery)

  const handleConfirmDate = () => {
    setSurgeryDate(dateValue)
    setDays(Math.floor((Date.now() - new Date(dateValue).getTime()) / 86_400_000))
    setEditing(false)
  }

  const displayDate = new Date(dateValue + 'T00:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div
      className="flex flex-col items-center justify-center text-center px-8"
      style={{ animation: 'fade-in 0.4s ease-out' }}
    >
      <div
        className="mb-8 rounded-full flex items-center justify-center"
        style={{
          width: 120,
          height: 120,
          backgroundColor: 'var(--color-accent-light)',
        }}
      >
        <CalendarCheck size={80} weight="duotone" style={{ color: 'var(--color-accent)' }} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 600,
          color: 'var(--color-text)',
          lineHeight: 1.2,
        }}
      >
        Дата операции
      </h1>

      {editing ? (
        <div className="mt-6 w-full flex flex-col gap-3">
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 16,
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: 'var(--text-base)',
              fontFamily: 'inherit',
            }}
          />
          <button
            className="w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}
            onClick={handleConfirmDate}
          >
            <Check size={20} weight="bold" /> Сохранить дату
          </button>
          <button
            className="w-full py-3 rounded-2xl text-sm"
            style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
            onClick={() => setEditing(false)}
          >
            Отмена
          </button>
        </div>
      ) : (
        <>
          <div
            className="mt-6 py-4 px-6 rounded-2xl flex items-center gap-3"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <p
              className="text-2xl font-semibold"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
              }}
            >
              {displayDate}
            </p>
          </div>

          <p
            className="mt-4 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Это верно?
          </p>

          <div
            className="mt-6 py-3 px-5 rounded-full inline-flex items-center gap-2"
            style={{
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
            }}
          >
            <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              День {days}
            </span>
            <span className="text-sm" style={{ opacity: 0.8 }}>
              после операции
            </span>
          </div>

          <div className="mt-10 w-full flex gap-3">
            <button
              className="flex-1 py-4 rounded-2xl text-base font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
              onClick={() => setEditing(true)}
            >
              <PencilSimple size={18} /> Изменить
            </button>
            <button
              className="flex-1 py-4 rounded-2xl text-base font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(91, 138, 114, 0.3)',
              }}
              onClick={onNext}
            >
              <Check size={20} weight="bold" /> Верно
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────── */
/*  Step 3 — Ready                              */
/* ──────────────────────────────────────────── */
function StepReady({ onFinish }: { onFinish: () => void }) {
  const features = [
    { label: '5 сессий упражнений', color: 'var(--color-primary)' },
    { label: 'Дневник боли', color: 'var(--color-secondary)' },
    { label: 'Контроль добавок', color: 'var(--color-accent)' },
    { label: 'Отслеживание прогресса', color: 'var(--color-info)' },
  ]

  return (
    <div
      className="flex flex-col items-center justify-center text-center px-8"
      style={{ animation: 'fade-in 0.4s ease-out' }}
    >
      <div
        className="mb-8 rounded-full flex items-center justify-center"
        style={{
          width: 120,
          height: 120,
          backgroundColor: 'var(--color-primary-light)',
        }}
      >
        <Confetti size={80} weight="duotone" style={{ color: 'var(--color-primary)' }} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 600,
          color: 'var(--color-text)',
          lineHeight: 1.2,
        }}
      >
        Всё готово!
      </h1>

      <p
        className="mt-3 text-base"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Вот что тебя ждёт:
      </p>

      <div className="mt-6 w-full flex flex-col gap-3">
        {features.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-3 py-3 px-4 rounded-xl text-left"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span
              className="flex-shrink-0 rounded-full"
              style={{
                width: 10,
                height: 10,
                backgroundColor: f.color,
              }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 w-full">
        <PrimaryButton onClick={onFinish}>
          Перейти к приложению
        </PrimaryButton>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────── */
/*  Main Onboarding Page                        */
/* ──────────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter()
  const { onboardingDone, setOnboardingDone } = useAppStore()
  const [step, setStep] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    if (onboardingDone) {
      router.replace('/')
    }
  }, [onboardingDone, router])

  const goNext = useCallback(() => {
    setTransitioning(true)
    setTimeout(() => {
      setStep((s) => s + 1)
      setTransitioning(false)
    }, 200)
  }, [])

  const handleFinish = useCallback(() => {
    setOnboardingDone()
    router.replace('/')
  }, [setOnboardingDone, router])

  // Don't render while redirecting
  if (onboardingDone) return null

  const TOTAL_STEPS = 3

  return (
    <div
      className="min-h-screen flex flex-col safe-top safe-bottom"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Content area */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateX(-20px)' : 'translateX(0)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        {step === 0 && <StepWelcome onNext={goNext} />}
        {step === 1 && <StepSurgeryDate onNext={goNext} />}
        {step === 2 && <StepReady onFinish={handleFinish} />}
      </div>

      {/* Step dots */}
      <div className="pb-8">
        <StepDots current={step} total={TOTAL_STEPS} />
      </div>
    </div>
  )
}
