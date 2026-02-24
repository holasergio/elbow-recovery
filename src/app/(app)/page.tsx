import { DayCounter } from '@/components/dashboard/day-counter'
import { ROMBadge } from '@/components/dashboard/rom-badge'
import { SessionList } from '@/components/dashboard/session-list'
import { TodayExercises } from '@/components/dashboard/today-exercises'
import { MissedSessions } from '@/components/dashboard/missed-sessions'
import { Motivation } from '@/components/dashboard/motivation'
import { HangingTracker } from '@/components/dashboard/hanging-tracker'
import { RecoveryScoreCard } from '@/components/dashboard/recovery-score'
import { AchievementWatcher } from '@/components/dashboard/achievement-watcher'
import { AchievementToast } from '@/components/dashboard/achievement-toast'

export default function DashboardPage() {
  return (
    <div>
      <AchievementWatcher />
      <AchievementToast />
      <RecoveryScoreCard />
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
