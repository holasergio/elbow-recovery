'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

export function useExerciseStats(date: string) {
  const sessions = useLiveQuery(
    () => db.exerciseSessions.where('date').equals(date).toArray(),
    [date]
  )

  const exerciseIds = sessions
    ? [...new Set(sessions.map(s => s.exerciseId))]
    : []

  return {
    totalExercises: sessions?.length ?? 0,
    uniqueExercises: exerciseIds.length,
    exerciseIds,
    loading: sessions === undefined,
  }
}

export function useTodayStats() {
  const today = new Date().toISOString().split('T')[0]
  return useExerciseStats(today)
}
