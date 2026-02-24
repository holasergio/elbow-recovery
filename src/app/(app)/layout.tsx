import { BottomTabs } from '@/components/layout/bottom-tabs'
import { NotificationProvider } from '@/components/notifications/notification-provider'
import { InstallBanner } from '@/components/install-banner'
import { PullToRefresh } from '@/components/pull-to-refresh'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <InstallBanner />
      <PullToRefresh>
        <main
          className="min-h-screen max-w-lg mx-auto px-4"
          style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
            overflowX: 'hidden',
          }}
        >
          {children}
        </main>
      </PullToRefresh>
      <BottomTabs />
    </NotificationProvider>
  )
}
