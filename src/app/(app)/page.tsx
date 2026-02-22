import { DayCounter } from '@/components/dashboard/day-counter'
import { ROMBadge } from '@/components/dashboard/rom-badge'
import { SessionList } from '@/components/dashboard/session-list'
import { TodayExercises } from '@/components/dashboard/today-exercises'

export default function DashboardPage() {
  return (
    <div>
      <DayCounter />
      <TodayExercises />
      <ROMBadge />
      <SessionList />
    </div>
  )
}
