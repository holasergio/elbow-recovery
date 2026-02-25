'use client'

import { useState, useEffect } from 'react'
import {
  slotLabels,
  slotSchedule,
  type SupplementSlot,
} from '@/data/supplements'
import { useSupplementsToday } from '@/hooks/use-supplements-today'
import { useCustomSupplements } from '@/hooks/use-custom-supplements'
import type { CustomSupplement } from '@/lib/db'
import { SupplementCard } from './supplement-card'
import { AddSupplementModal } from './add-supplement-modal'
import { Clock, Plus, CaretDown, CaretUp } from '@phosphor-icons/react'

const slotOrder: SupplementSlot[] = [
  'fasting',
  'breakfast',
  'lunch',
  'dinner',
  'bedtime',
]

// Натощак — всегда открыт, остальные — коллапсируемые
const ALWAYS_OPEN: SupplementSlot = 'fasting'

export function SupplementChecklist() {
  const {
    takenIds,
    totalCount,
    takenCount,
    allSupplements,
    customSupplementIds,
    toggleSupplement,
    isLoading,
  } = useSupplementsToday()
  const { deleteCustomSupplement, customSupplements } = useCustomSupplements()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSupplement, setEditingSupplement] = useState<CustomSupplement | null>(null)

  const [openSlots, setOpenSlots] = useState<Record<SupplementSlot, boolean>>({
    fasting: true,
    breakfast: true,
    lunch: true,
    dinner: true,
    bedtime: true,
  })

  // Авто-коллапс: скрываем слот когда все позиции выполнены
  useEffect(() => {
    if (!takenIds || !allSupplements) return
    setOpenSlots(prev => {
      const next = { ...prev }
      slotOrder.forEach(slot => {
        if (slot === ALWAYS_OPEN) return
        const items = allSupplements.filter(s => s.slot === slot)
        const taken = items.filter(s => takenIds.has(s.id)).length
        if (items.length > 0 && taken === items.length && prev[slot]) {
          next[slot] = false
        }
      })
      return next
    })
  }, [takenIds, allSupplements])

  function toggleSlot(slot: SupplementSlot) {
    if (slot === ALWAYS_OPEN) return
    setOpenSlots(prev => ({ ...prev, [slot]: !prev[slot] }))
  }

  function handleEditSupplement(supplementId: string) {
    const cs = customSupplements.find(c => c.supplementId === supplementId)
    if (cs) setEditingSupplement(cs)
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '48px 0',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}
      >
        Загрузка...
      </div>
    )
  }

  const progressPercent =
    totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0

  return (
    <div>
      {/* Progress bar */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            Принято {takenCount} из {totalCount}
          </span>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color:
                progressPercent === 100
                  ? 'var(--color-success)'
                  : 'var(--color-text-muted)',
            }}
          >
            {progressPercent}%
          </span>
        </div>

        {/* Track */}
        <div
          style={{
            height: '8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface-alt)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              borderRadius: 'var(--radius-full)',
              backgroundColor:
                progressPercent === 100
                  ? 'var(--color-success)'
                  : 'var(--color-primary)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Slot sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {slotOrder.map((slot) => {
          const items = allSupplements.filter((s) => s.slot === slot)
          if (items.length === 0) return null

          const slotTakenCount = items.filter((s) => takenIds.has(s.id)).length
          const isComplete = slotTakenCount === items.length
          const isOpen = openSlots[slot]
          const isCollapsible = slot !== ALWAYS_OPEN

          return (
            <section key={slot}>
              {/* Section header */}
              <div
                onClick={() => toggleSlot(slot)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: isOpen ? '10px' : 0,
                  paddingBottom: '6px',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: isCollapsible ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Clock
                    size={18}
                    weight="duotone"
                    style={{ color: isComplete ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 600,
                      color: isComplete ? 'var(--color-success)' : 'var(--color-text)',
                    }}
                  >
                    {slotLabels[slot]}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      fontWeight: 500,
                    }}
                  >
                    {slotSchedule[slot]}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isComplete ? 'var(--color-success)' : 'var(--color-text-muted)',
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isComplete
                        ? 'var(--color-primary-light)'
                        : 'var(--color-surface-alt)',
                    }}
                  >
                    {slotTakenCount} / {items.length}
                  </span>
                  {isCollapsible && (
                    <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                      {isOpen
                        ? <CaretUp size={14} weight="bold" />
                        : <CaretDown size={14} weight="bold" />}
                    </span>
                  )}
                </div>
              </div>

              {/* Cards — visible only when open */}
              {isOpen && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {items.map((supplement) => {
                    const isCustom = customSupplementIds.has(supplement.id)
                    return (
                      <SupplementCard
                        key={supplement.id}
                        supplement={supplement}
                        taken={takenIds.has(supplement.id)}
                        onToggle={toggleSupplement}
                        isCustom={isCustom}
                        onDelete={isCustom ? deleteCustomSupplement : undefined}
                        onEdit={isCustom ? () => handleEditSupplement(supplement.id) : undefined}
                      />
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/* Add supplement button */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        style={{
          marginTop: '24px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-primary)',
          border: `1.5px dashed var(--color-primary)`,
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.2s ease',
        }}
      >
        <Plus size={16} weight="bold" />
        Добавить добавку
      </button>

      {showAddModal && (
        <AddSupplementModal onClose={() => setShowAddModal(false)} />
      )}

      {editingSupplement && (
        <AddSupplementModal
          editData={editingSupplement}
          onClose={() => setEditingSupplement(null)}
        />
      )}
    </div>
  )
}
