'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarBlank, Plus, CaretDown, ArrowLeft } from '@phosphor-icons/react'
import Link from 'next/link'
import { db, type Appointment } from '@/lib/db'
import { AppointmentCard } from '@/components/health/appointment-card'
import { AppointmentForm } from '@/components/health/appointment-form'
import { PhaseTimeline } from '@/components/health/phase-timeline'

// ─── Seed Key Dates ──────────────────────────────────────────────

async function seedAppointments() {
  const count = await db.appointments.count()
  if (count > 0) return

  const keyDates: Omit<Appointment, 'id'>[] = [
    {
      date: '2026-03-05',
      type: 'ct',
      title: 'КТ-контроль',
      notes: 'Оценка консолидации перелома',
      completed: false,
    },
    {
      date: '2026-03-10',
      type: 'doctor',
      title: 'Консультация хирурга',
      notes: 'По результатам КТ',
      completed: false,
    },
    {
      date: '2026-03-15',
      type: 'physio',
      title: 'Начало активной реабилитации',
      notes: 'С физиотерапевтом',
      completed: false,
    },
    {
      date: '2026-06-01',
      type: 'bloodTest',
      title: 'Анализ крови',
      notes: 'Витамин D, кальций',
      completed: false,
    },
    {
      date: '2026-07-05',
      type: 'doctor',
      title: 'Контроль 6 месяцев',
      notes: 'Обсуждение удаления пластины',
      completed: false,
    },
  ]

  await db.appointments.bulkAdd(keyDates)
}

// ─── Page Component ──────────────────────────────────────────────

export default function CalendarPage() {
  const [showForm, setShowForm] = useState(false)
  const [showPast, setShowPast] = useState(false)
  const [seeded, setSeeded] = useState(false)

  // Seed on first visit
  useEffect(() => {
    seedAppointments().then(() => setSeeded(true))
  }, [])

  // Live query for all appointments
  const appointments = useLiveQuery(
    () => db.appointments.orderBy('date').toArray(),
    [],
    [] as Appointment[]
  )

  // Split into upcoming and past
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const upcoming = appointments.filter(
    (a) => a.date >= todayStr && !a.completed
  )
  const past = appointments.filter(
    (a) => a.date < todayStr || a.completed
  )

  // Force re-render on toggle (useLiveQuery handles this)
  const handleUpdate = useCallback(() => {
    // useLiveQuery auto-refreshes
  }, [])

  const handleSaved = useCallback(() => {
    setShowForm(false)
  }, [])

  if (!seeded) {
    return null // Wait for seeding
  }

  return (
    <div style={{ paddingTop: '24px', paddingBottom: '120px' }}>
      {/* Back link */}
      <Link
        href="/health"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-primary)',
          textDecoration: 'none',
          fontWeight: 500,
          marginBottom: '16px',
        }}
      >
        <ArrowLeft size={18} weight="bold" />
        Здоровье
      </Link>

      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '4px',
        }}
      >
        <CalendarBlank
          size={28}
          weight="duotone"
          style={{ color: 'var(--color-primary)' }}
        />
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          Календарь
        </h1>
      </div>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          marginTop: '4px',
          marginBottom: '20px',
        }}
      >
        Визиты к врачу и контрольные даты
      </p>

      {/* Phase Timeline */}
      <div style={{ marginBottom: '24px' }}>
        <PhaseTimeline />
      </div>

      {/* Add form (inline, toggleable) */}
      {showForm && (
        <div
          style={{
            marginBottom: '24px',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            animation: 'var(--animate-slide-up)',
          }}
        >
          <AppointmentForm
            onSaved={handleSaved}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Upcoming section */}
      <section style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: '12px',
          }}
        >
          Ближайшие
        </h2>

        {upcoming.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-alt)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              Нет предстоящих визитов
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {upcoming.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past section (collapsed by default) */}
      {past.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setShowPast((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
            }}
            aria-expanded={showPast}
          >
            <CaretDown
              size={18}
              weight="bold"
              style={{
                transition: 'transform 0.2s ease',
                transform: showPast ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
            Прошедшие
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 400,
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              ({past.length})
            </span>
          </button>

          {showPast && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                animation: 'var(--animate-fade-in)',
              }}
            >
              {past.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* FAB button */}
      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          aria-label="Добавить запись"
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            zIndex: 50,
          }}
        >
          <Plus size={28} weight="bold" />
        </button>
      )}
    </div>
  )
}
