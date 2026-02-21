'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db, type SupplementLog } from '@/lib/db'
import { supplements, type SupplementSlot } from '@/data/supplements'

export function useSupplementsToday() {
  const today = new Date().toISOString().split('T')[0]

  const logs = useLiveQuery(
    () => db.supplementLogs.where('date').equals(today).toArray(),
    [today]
  )

  const takenIds = new Set(
    (logs ?? []).filter((l) => l.taken).map((l) => l.supplementId)
  )

  const totalCount = supplements.length
  const takenCount = takenIds.size

  async function toggleSupplement(
    supplementId: string,
    slot: SupplementSlot
  ) {
    const existing = await db.supplementLogs
      .where('[date+slot]')
      .equals([today, slot])
      .filter((l) => l.supplementId === supplementId)
      .first()

    if (existing) {
      await db.supplementLogs.update(existing.id!, {
        taken: !existing.taken,
        takenAt: !existing.taken ? new Date().toISOString() : undefined,
      })
    } else {
      await db.supplementLogs.add({
        supplementId,
        date: today,
        slot,
        taken: true,
        takenAt: new Date().toISOString(),
      })
    }
  }

  return {
    logs: logs ?? [],
    takenIds,
    totalCount,
    takenCount,
    toggleSupplement,
    isLoading: logs === undefined,
    today,
  }
}
