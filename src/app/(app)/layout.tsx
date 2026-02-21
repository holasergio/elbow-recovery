import { BottomTabs } from '@/components/layout/bottom-tabs'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-screen pb-20 max-w-lg mx-auto px-4">
        {children}
      </main>
      <BottomTabs />
    </>
  )
}
