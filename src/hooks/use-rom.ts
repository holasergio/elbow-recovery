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

  return {
    measurements: measurements ?? [],
    latest,
    isLoading: measurements === undefined,
  }
}
