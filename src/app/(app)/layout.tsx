import { BottomTabs } from '@/components/layout/bottom-tabs'
import { NotificationProvider } from '@/components/notifications/notification-provider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <main className="min-h-screen pb-20 max-w-lg mx-auto px-4">
        {children}
      </main>
      <BottomTabs />
    </NotificationProvider>
  )
}
