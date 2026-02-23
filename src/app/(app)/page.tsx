import { DayCounter } from '@/components/dashboard/day-counter'
import { ROMBadge } from '@/components/dashboard/rom-badge'
import { SessionList } from '@/components/dashboard/session-list'
import { TodayExercises } from '@/components/dashboard/today-exercises'
import { MissedSessions } from '@/components/dashboard/missed-sessions'
import { Motivation } from '@/components/dashboard/motivation'
import { HangingTracker } from '@/components/dashboard/hanging-tracker'

export default function DashboardPage() {
  return (
    <div>
      <DayCounter />
      <Motivation />
      <ROMBadge />
      <TodayExercises />
      <MissedSessions />
      <HangingTracker />
      <SessionList />
    </div>
  )
}
