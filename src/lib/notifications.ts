// ──────────────────────────────────────────────
// notifications.ts — Notification service
// Browser Notification API + in-app notification queue
// ──────────────────────────────────────────────

/**
 * Request browser notification permission.
 * Returns true if granted, false otherwise.
 * Gracefully handles environments where Notification API is unavailable
 * (e.g. iOS PWA before full Web Push support).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false

  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

/**
 * Check if browser notifications are currently permitted.
 */
export function canNotify(): boolean {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false
  return Notification.permission === 'granted'
}

/**
 * Show a browser notification. Falls back to service worker
 * notification if the Notification constructor throws
 * (some environments restrict direct construction).
 */
export function showNotification(title: string, body: string, tag?: string) {
  if (!canNotify()) return

  try {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: tag || 'elbow-recovery',
      silent: false,
    })
  } catch {
    // Fallback: try service worker notification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        tag,
      })
    }
  }
}

// ─── In-App Notification Types ───────────────────────────────────────

export type NotificationType = 'session' | 'supplement' | 'sleep' | 'rom' | 'general'

export interface InAppNotification {
  id: string
  title: string
  body: string
  type: NotificationType
  timestamp: number
  read: boolean
}

/**
 * Create an InAppNotification object.
 */
export function createInAppNotification(
  title: string,
  body: string,
  type: NotificationType,
  tag: string
): InAppNotification {
  return {
    id: tag,
    title,
    body,
    type,
    timestamp: Date.now(),
    read: false,
  }
}
