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
 * Show a browser notification.
 *
 * Strategy (most reliable first):
 * 1. ServiceWorkerRegistration.showNotification() — works in PWA on iOS/Android
 * 2. new Notification() — works in desktop Chrome/Firefox when SW is not available
 * 3. postMessage to SW controller — last-resort fallback if SW not yet ready
 *
 * The old approach (new Notification first, postMessage fallback) failed because:
 * - new Notification() is forbidden in PWA mode on iOS and Android Chrome
 * - The SW only handled 'SKIP_WAITING' messages, not 'SHOW_NOTIFICATION'
 */
export async function showNotification(title: string, body: string, tag?: string): Promise<void> {
  if (!canNotify()) return

  const options: NotificationOptions = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',  // badge-72.png does not exist → use existing icon
    tag: tag || 'elbow-recovery',
    silent: false,
  }

  // 1) Prefer SW registration.showNotification() — required for PWA on mobile
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, options)
      return
    } catch {
      // SW not ready or showNotification unsupported — fall through
    }
  }

  // 2) Direct Notification constructor — works on desktop browsers
  try {
    new Notification(title, options)
    return
  } catch {
    // Forbidden in some contexts (PWA foreground on some platforms) — fall through
  }

  // 3) Last resort: postMessage to active SW controller
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      body,
      tag,
    })
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
