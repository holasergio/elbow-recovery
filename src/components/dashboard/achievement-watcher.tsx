'use client'

import { useAchievementChecker } from '@/hooks/use-achievement-checker'

export function AchievementWatcher() {
  useAchievementChecker()
  return null
}
