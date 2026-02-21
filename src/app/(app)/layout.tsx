import { BottomTabs } from '@/components/layout/bottom-tabs'
import { NotificationProvider } from '@/components/notifications/notification-provider'
import { InstallBanner } from '@/components/install-banner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <InstallBanner />
      <main className="min-h-screen pb-20 max-w-lg mx-auto px-4">
        {children}
      </main>
      <BottomTabs />
    </NotificationProvider>
  )
}
