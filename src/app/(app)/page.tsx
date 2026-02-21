import { DayCounter } from '@/components/dashboard/day-counter'
import { ROMBadge } from '@/components/dashboard/rom-badge'
import { SessionList } from '@/components/dashboard/session-list'

export default function DashboardPage() {
  return (
    <div>
      <DayCounter />
      <ROMBadge />
      <SessionList />
    </div>
  )
}
