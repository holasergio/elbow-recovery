'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

export function useROMHistory() {
  const measurements = useLiveQuery(
    () => db.romMeasurements.orderBy('date').toArray()
  )

  const latest = measurements && measurements.length > 0
    ? measurements[measurements.length - 1]
    : null

  const best = measurements && measurements.length > 0
    ? measurements.reduce((a, b) => a.arc >= b.arc ? a : b)
    : null

  return {
    measurements: measurements ?? [],
    latest,
    best,
    isLoading: measurements === undefined,
  }
}
