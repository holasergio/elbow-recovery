'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/stores/app-store'
import { dailySessions } from '@/data/schedule'
import { slotSchedule, type SupplementSlot } from '@/data/supplements'
import {
  showNotification,
  canNotify,
  createInAppNotification,
  type InAppNotification,
} from '@/lib/notifications'

// ─── Helpers ─────────────────────────────────────────────────────────

/** Parse "HH:MM" into total minutes since midnight */
function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Get current minutes since midnight */
function nowMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

/** Get today's date as YYYY-MM-DD */
function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

/** Get the ISO week's Sunday date as YYYY-MM-DD for ROM weekly tracking */
function currentWeekSunday(): string {
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - day)
  return sunday.toISOString().split('T')[0]
}

// ─── Notification categories → type mapping ──────────────────────────

const REMINDER_WINDOW_MINUTES = 5

// ─── Session notification messages (Russian) ─────────────────────────

const SESSION_MESSAGES: Record<string, { title: string; body: string }> = {
  full: {
    title: 'Полная сессия',
    body: 'Пора начинать полную тренировку. Не забудь компресс!',
  },
  short: {
    title: 'Короткая сессия',
    body: 'Время для короткой тренировки. 15 минут на восстановление.',
  },
  light: {
    title: 'Лёгкая сессия',
    body: 'Вечерняя лёгкая разминка перед сном.',
  },
}

// ─── Hook ────────────────────────────────────────────────────────────

export function useNotifications() {
  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([])
  const shownRef = useRef<Set<string>>(new Set())
  const { notificationsEnabled, notificationCategories } = useAppStore()

  /** Add an in-app notification and optionally fire browser notification */
  const pushNotification = useCallback(
    (title: string, body: string, type: InAppNotification['type'], tag: string) => {
      // Prevent duplicates
      if (shownRef.current.has(tag)) return
      shownRef.current.add(tag)

      // In-app notification (always)
      const notif = createInAppNotification(title, body, type, tag)
      setInAppNotifications((prev) => [notif, ...prev])

      // Browser notification (if available)
      if (canNotify()) {
        showNotification(title, body, tag)
      }
    },
    []
  )

  /** Dismiss a single notification */
  const dismissNotification = useCallback((id: string) => {
    setInAppNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  /** Clear all notifications */
  const clearAll = useCallback(() => {
    setInAppNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  // ─── Scheduling check ──────────────────────────────────────────────

  const checkReminders = useCallback(() => {
    if (!notificationsEnabled) return

    const now = nowMinutes()
    const today = todayKey()

    // 1) Session reminders — within 5 min of scheduled time
    if (notificationCategories.sessions) {
      for (const session of dailySessions) {
        const sessionMin = parseTimeToMinutes(session.time)
        const diff = now - sessionMin

        if (diff >= 0 && diff <= REMINDER_WINDOW_MINUTES) {
          const tag = `session-${session.id}-${today}`
          const msg = SESSION_MESSAGES[session.type] ?? SESSION_MESSAGES.full
          pushNotification(
            `${msg.title}: ${session.name}`,
            msg.body,
            'session',
            tag
          )
        }
      }
    }

    // 2) Supplement reminders — at slot times
    if (notificationCategories.supplements) {
      const slots: SupplementSlot[] = ['fasting', 'breakfast', 'lunch', 'dinner', 'bedtime']
      const slotNames: Record<SupplementSlot, string> = {
        fasting: 'Натощак',
        breakfast: 'Завтрак',
        lunch: 'Обед',
        dinner: 'Ужин',
        bedtime: 'Перед сном',
      }

      for (const slot of slots) {
        const slotMin = parseTimeToMinutes(slotSchedule[slot])
        const diff = now - slotMin

        if (diff >= 0 && diff <= REMINDER_WINDOW_MINUTES) {
          const tag = `supplement-${slot}-${today}`
          pushNotification(
            `Добавки: ${slotNames[slot]}`,
            'Время принять добавки. Не пропускай приём!',
            'supplement',
            tag
          )
        }
      }
    }

    // 3) Sleep reminder — at 22:00
    if (notificationCategories.sleep) {
      const sleepMin = parseTimeToMinutes('22:00')
      const diff = now - sleepMin

      if (diff >= 0 && diff <= REMINDER_WINDOW_MINUTES) {
        const tag = `sleep-${today}`
        pushNotification(
          'Время спать',
          'Не забудь заполнить дневник сна. Хороший сон ускоряет восстановление.',
          'sleep',
          tag
        )
      }
    }

    // 4) ROM reminder — Sunday once a week
    if (notificationCategories.rom) {
      const dayOfWeek = new Date().getDay()
      if (dayOfWeek === 0) {
        // Sunday, remind at 10:00
        const romMin = parseTimeToMinutes('10:00')
        const diff = now - romMin

        if (diff >= 0 && diff <= REMINDER_WINDOW_MINUTES) {
          const weekKey = currentWeekSunday()
          const tag = `rom-${weekKey}`
          pushNotification(
            'Измерение ROM',
            'Еженедельное измерение амплитуды движения. Сфотографируй прогресс!',
            'rom',
            tag
          )
        }
      }
    }
  }, [notificationsEnabled, notificationCategories, pushNotification])

  // ─── Interval: check every 60s ─────────────────────────────────────

  useEffect(() => {
    // Initial check
    checkReminders()

    const interval = setInterval(checkReminders, 60_000)
    return () => clearInterval(interval)
  }, [checkReminders])

  // ─── Reset shown set at midnight ───────────────────────────────────

  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        shownRef.current.clear()
      }
    }

    const interval = setInterval(checkMidnight, 60_000)
    return () => clearInterval(interval)
  }, [])

  return {
    inAppNotifications,
    dismissNotification,
    clearAll,
    unreadCount: inAppNotifications.filter((n) => !n.read).length,
  }
}
