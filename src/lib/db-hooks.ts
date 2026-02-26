/**
 * Dexie middleware: auto-assign _uuid and _synced=false on every create/update.
 * Import this file once (e.g., in storage-init.tsx) to activate.
 */
import { db } from './db'

let initialized = false

export function initDbSyncHooks() {
  if (initialized) return
  initialized = true

  // Hook into creating — add _uuid and _synced for new records
  const tables = [
    db.exerciseSessions,
    db.romMeasurements,
    db.painEntries,
    db.supplementLogs,
    db.sleepLogs,
    db.appointments,
    db.dailyLogs,
    db.skippedSessions,
    db.moodEntries,
    db.journalEntries,
    db.customSupplements,
  ]

  for (const table of tables) {
    table.hook('creating', function (_primKey, obj) {
      if (!obj._uuid) {
        obj._uuid = crypto.randomUUID()
      }
      obj._synced = false
    })

    table.hook('updating', function () {
      // Mark as unsynced on any update
      return { _synced: false }
    })
  }
}
