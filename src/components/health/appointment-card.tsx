'use client'

import { useCallback } from 'react'
import {
  Scan,
  Stethoscope,
  Drop,
  Barbell,
  CalendarBlank,
  CheckCircle,
  MapPin,
  Clock,
} from '@phosphor-icons/react'
import { db, type Appointment } from '@/lib/db'

// ─── Type Configuration ──────────────────────────────────────────

const typeConfig: Record<
  Appointment['type'],
  { icon: typeof Scan; label: string; color: string; bg: string }
> = {
  ct: {
    icon: Scan,
    label: 'КТ/Рентген',
    color: 'var(--color-info)',
    bg: 'color-mix(in srgb, var(--color-info) 12%, transparent)',
  },
  doctor: {
    icon: Stethoscope,
    label: 'Врач',
    color: 'var(--color-primary)',
    bg: 'var(--color-primary-light)',
  },
  bloodTest: {
    icon: Drop,
    label: 'Анализы',
    color: 'var(--color-secondary)',
    bg: 'var(--color-secondary-light)',
  },
  physio: {
    icon: Barbell,
    label: 'Физиотерапия',
    color: 'var(--color-accent)',
    bg: 'var(--color-accent-light)',
  },
  other: {
    icon: CalendarBlank,
    label: 'Другое',
    color: 'var(--color-text-muted)',
    bg: 'var(--color-surface-alt)',
  },
}

// ─── Russian Date Formatting ─────────────────────────────────────

function formatRussianDate(dateStr: string): string {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

// ─── Component ───────────────────────────────────────────────────

interface AppointmentCardProps {
  appointment: Appointment
  onUpdate?: () => void
}

export function AppointmentCard({ appointment, onUpdate }: AppointmentCardProps) {
  const config = typeConfig[appointment.type]
  const IconComponent = config.icon

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const appointmentDate = new Date(appointment.date + 'T00:00:00')
  const isPast = appointmentDate < today

  const toggleCompleted = useCallback(async () => {
    if (appointment.id == null) return
    await db.appointments.update(appointment.id, {
      completed: !appointment.completed,
    })
    onUpdate?.()
  }, [appointment.id, appointment.completed, onUpdate])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${appointment.title} — ${formatRussianDate(appointment.date)}${appointment.completed ? ', выполнено' : ''}`}
      onClick={toggleCompleted}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleCompleted()
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface)',
        border: `1px solid ${appointment.completed ? 'var(--color-primary)' : 'var(--color-border)'}`,
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: appointment.completed ? 0.65 : isPast ? 0.8 : 1,
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* Type icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: config.bg,
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {appointment.completed ? (
          <CheckCircle
            size={26}
            weight="fill"
            style={{ color: 'var(--color-primary)' }}
          />
        ) : (
          <IconComponent
            size={24}
            weight="duotone"
            style={{ color: config.color }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title + type badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              color: appointment.completed
                ? 'var(--color-text-muted)'
                : 'var(--color-text)',
              textDecoration: appointment.completed ? 'line-through' : 'none',
              transition: 'color 0.2s ease',
            }}
          >
            {appointment.title}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: config.bg,
              color: config.color,
              lineHeight: '16px',
              whiteSpace: 'nowrap',
            }}
          >
            {config.label}
          </span>
        </div>

        {/* Date + time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '6px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
            }}
          >
            {formatRussianDate(appointment.date)}
          </span>
          {appointment.time && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              <Clock size={14} weight="duotone" />
              {appointment.time}
            </span>
          )}
        </div>

        {/* Location */}
        {appointment.location && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            <MapPin size={14} weight="duotone" />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {appointment.location}
            </span>
          </div>
        )}

        {/* Notes (truncated) */}
        {appointment.notes && (
          <p
            style={{
              marginTop: '6px',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {appointment.notes}
          </p>
        )}
      </div>
    </div>
  )
}
