'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { supplements, type SupplementSlot, type Supplement } from '@/data/supplements'
import { toLocalDateStr } from '@/lib/date-utils'

export function useSupplementsToday() {
  const today = toLocalDateStr()

  const logs = useLiveQuery(
    () => db.supplementLogs.where('date').equals(today).toArray(),
    [today]
  )

  const customDefs = useLiveQuery(
    async () => {
      try {
        return await db.customSupplements.orderBy('supplementId').toArray()
      } catch {
        return []
      }
    },
    []
  )

  const customSupplements: Supplement[] = (customDefs ?? []).map((cs) => ({
    id: cs.supplementId,
    name: cs.name,
    dose: cs.dose,
    timing: cs.timing,
    slot: cs.slot,
    priority: cs.priority,
    category: cs.category,
    reason: cs.reason,
    roleDetailed: cs.reason,
  }))

  const allSupplements: Supplement[] = [...supplements, ...customSupplements]

  const takenIds = new Set(
    (logs ?? []).filter((l) => l.taken).map((l) => l.supplementId)
  )

  const totalCount = allSupplements.length
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
    allSupplements,
    customSupplementIds: new Set((customDefs ?? []).map((cs) => cs.supplementId)),
    toggleSupplement,
    isLoading: logs === undefined,
    today,
  }
}
