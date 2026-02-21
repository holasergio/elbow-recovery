'use client'

import { useNotifications } from '@/hooks/use-notifications'
import { NotificationToast } from './notification-toast'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { inAppNotifications, dismissNotification } = useNotifications()

  const unread = inAppNotifications.filter((n) => !n.read).slice(0, 3)

  return (
    <>
      {children}
      <div
        style={{
          position: 'fixed',
          top: 'env(safe-area-inset-top, 16px)',
          left: '16px',
          right: '16px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: unread.length > 0 ? 'auto' : 'none',
        }}
      >
        {unread.map((n) => (
          <NotificationToast
            key={n.id}
            notification={n}
            onDismiss={() => dismissNotification(n.id)}
          />
        ))}
      </div>
    </>
  )
}
