'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db, type CustomSupplement } from '@/lib/db'
import type { Supplement } from '@/data/supplements'

export type { CustomSupplement }

export function useCustomSupplements() {
  const customSupplements =
    useLiveQuery(async () => {
      try {
        return await db.customSupplements.orderBy('supplementId').toArray()
      } catch {
        return []
      }
    }, []) ?? []

  async function addCustomSupplement(
    data: Omit<CustomSupplement, 'id' | 'supplementId' | 'createdAt'>
  ) {
    const supplementId = `custom_${Date.now()}`
    await db.customSupplements.add({
      ...data,
      supplementId,
      createdAt: new Date().toISOString(),
    })
    return supplementId
  }

  async function updateCustomSupplement(
    supplementId: string,
    data: Partial<Omit<CustomSupplement, 'id' | 'supplementId' | 'createdAt'>>
  ) {
    await db.customSupplements
      .where('supplementId')
      .equals(supplementId)
      .modify(data)
  }

  async function deleteCustomSupplement(supplementId: string) {
    // Delete all logs for this supplement
    await db.supplementLogs.where('supplementId').equals(supplementId).delete()
    // Delete the custom supplement definition
    await db.customSupplements.where('supplementId').equals(supplementId).delete()
  }

  // Convert to Supplement shape for compatibility with existing components
  const asSupplements: Supplement[] = customSupplements.map((cs) => ({
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

  return {
    customSupplements,
    asSupplements,
    addCustomSupplement,
    updateCustomSupplement,
    deleteCustomSupplement,
    isLoading: customSupplements === undefined,
  }
}
