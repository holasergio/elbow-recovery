'use client'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Table config: Dexie table name → Supabase table name + field mapping ────

interface TableConfig {
  dexie: string
  supabase: string
  /** Maps Dexie camelCase → Supabase snake_case. Fields not listed are auto-converted. */
  fieldMap?: Record<string, string>
  /** Fields to skip when pushing to Supabase (e.g. photos as base64 are too large) */
  skipFields?: string[]
}

const TABLE_CONFIGS: TableConfig[] = [
  {
    dexie: 'exerciseSessions',
    supabase: 'exercise_sessions',
    fieldMap: {
      exerciseId: 'exercise_id',
      sessionSlot: 'session_slot',
      startedAt: 'started_at',
      completedAt: 'completed_at',
      completedSets: 'completed_sets',
      completedReps: 'completed_reps',
      painBefore: 'pain_before',
      painAfter: 'pain_after',
    },
  },
  {
    dexie: 'romMeasurements',
    supabase: 'rom_measurements',
    fieldMap: {
      extensionDeficit: 'extension_deficit',
      measuredBy: 'measured_by',
      aiMeasuredFlexion: 'ai_measured_flexion',
      aiMeasuredExtension: 'ai_measured_extension',
    },
    skipFields: ['photoFlexion', 'photoExtension'],
  },
  {
    dexie: 'painEntries',
    supabase: 'pain_entries',
    fieldMap: { numbness45: 'numbness45' },
  },
  {
    dexie: 'supplementLogs',
    supabase: 'supplement_logs',
    fieldMap: {
      supplementId: 'supplement_id',
      takenAt: 'taken_at',
      skippedReason: 'skipped_reason',
    },
  },
  {
    dexie: 'customSupplements',
    supabase: 'custom_supplements',
    fieldMap: {
      supplementId: 'supplement_id',
      createdAt: 'supplement_created_at',
    },
  },
  {
    dexie: 'sleepLogs',
    supabase: 'sleep_logs',
    fieldMap: {
      bedTime: 'bed_time',
      wakeTime: 'wake_time',
      totalHours: 'total_hours',
      wakeUps: 'wake_ups',
    },
  },
  {
    dexie: 'appointments',
    supabase: 'appointments',
  },
  {
    dexie: 'dailyLogs',
    supabase: 'daily_logs',
    fieldMap: {
      hangingHours: 'hanging_hours',
      fineMotor: 'fine_motor',
      sessionsCompleted: 'sessions_completed',
    },
  },
  {
    dexie: 'skippedSessions',
    supabase: 'skipped_sessions',
    fieldMap: {
      sessionSlot: 'session_slot',
      skippedAt: 'skipped_at',
    },
  },
  {
    dexie: 'moodEntries',
    supabase: 'mood_entries',
    fieldMap: {
      createdAt: 'mood_created_at',
    },
  },
  {
    dexie: 'journalEntries',
    supabase: 'journal_entries',
    fieldMap: {
      createdAt: 'entry_created_at',
    },
  },
]

// ─── Field conversion helpers ────────────────────────────────────────

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function mapDexieToSupabase(
  record: Record<string, unknown>,
  config: TableConfig,
  userId: string
): Record<string, unknown> {
  const result: Record<string, unknown> = { user_id: userId }
  const skipSet = new Set(config.skipFields ?? [])

  for (const [key, value] of Object.entries(record)) {
    // Skip internal Dexie fields and sync meta
    if (key === 'id' || key === '_uuid' || key === '_synced') continue
    if (skipSet.has(key)) continue
    if (value === undefined) continue

    // Use explicit mapping or auto-convert
    const supabaseKey = config.fieldMap?.[key] ?? toSnakeCase(key)
    result[supabaseKey] = value
  }

  return result
}

function mapSupabaseToDexie(
  record: Record<string, unknown>,
  config: TableConfig
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const reverseMap: Record<string, string> = {}

  // Build reverse mapping
  if (config.fieldMap) {
    for (const [dexieKey, supabaseKey] of Object.entries(config.fieldMap)) {
      reverseMap[supabaseKey] = dexieKey
    }
  }

  for (const [key, value] of Object.entries(record)) {
    // Skip Supabase-only fields
    if (key === 'user_id' || key === 'created_at' || key === 'local_id') continue
    if (value === undefined || value === null) continue

    if (key === 'id') {
      // Supabase UUID → _uuid
      result._uuid = value
      continue
    }

    const dexieKey = reverseMap[key] ?? toCamelCase(key)
    result[dexieKey] = value
  }

  result._synced = true
  return result
}

// ─── Sync Engine ─────────────────────────────────────────────────────

export interface SyncResult {
  pushed: number
  pulled: number
  errors: string[]
}

let syncInProgress = false

/**
 * Push all unsynced Dexie records to Supabase.
 */
export async function pushToSupabase(supabase: SupabaseClient, userId: string): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, errors: [] }

  for (const config of TABLE_CONFIGS) {
    try {
      const table = db.table(config.dexie)
      const unsynced = await table
        .where('_synced')
        .equals(0) // Dexie stores booleans as 0/1
        .toArray()

      if (unsynced.length === 0) continue

      // Batch upsert
      const rows = unsynced.map(record => {
        const mapped = mapDexieToSupabase(record, config, userId)
        mapped.id = record._uuid
        mapped.local_id = record.id
        return mapped
      })

      const { error } = await supabase
        .from(config.supabase)
        .upsert(rows, { onConflict: 'id' })

      if (error) {
        result.errors.push(`Push ${config.dexie}: ${error.message}`)
        continue
      }

      // Mark as synced
      const ids = unsynced.map(r => r.id).filter(Boolean) as number[]
      await table
        .where('id')
        .anyOf(ids)
        .modify({ _synced: true })

      result.pushed += unsynced.length
    } catch (err) {
      result.errors.push(`Push ${config.dexie}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return result
}

/**
 * Pull all records from Supabase and merge into Dexie.
 * Used for recovery after cache clear or initial sync on new device.
 */
export async function pullFromSupabase(supabase: SupabaseClient): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, errors: [] }

  for (const config of TABLE_CONFIGS) {
    try {
      const { data, error } = await supabase
        .from(config.supabase)
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        result.errors.push(`Pull ${config.supabase}: ${error.message}`)
        continue
      }

      if (!data || data.length === 0) continue

      const table = db.table(config.dexie)

      // Get existing UUIDs in Dexie to avoid duplicates
      const existingRecords = await table.toArray()
      const existingUUIDs = new Set(
        existingRecords
          .map((r: Record<string, unknown>) => r._uuid as string)
          .filter(Boolean)
      )

      let pulledCount = 0
      for (const remoteRecord of data) {
        const uuid = remoteRecord.id as string
        if (existingUUIDs.has(uuid)) continue // Already exists locally

        const dexieRecord = mapSupabaseToDexie(remoteRecord, config)
        await table.add(dexieRecord)
        pulledCount++
      }

      result.pulled += pulledCount
    } catch (err) {
      result.errors.push(`Pull ${config.supabase}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return result
}

/**
 * Full bidirectional sync: push local changes, then pull remote.
 */
export async function syncAll(): Promise<SyncResult> {
  if (syncInProgress) {
    return { pushed: 0, pulled: 0, errors: ['Sync already in progress'] }
  }

  syncInProgress = true
  const combined: SyncResult = { pushed: 0, pulled: 0, errors: [] }

  try {
    const supabase = createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { pushed: 0, pulled: 0, errors: ['Not authenticated'] }
    }

    // Get internal user_id
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!userData) {
      return { pushed: 0, pulled: 0, errors: ['User profile not found'] }
    }

    const userId = userData.id as string

    // Push first, then pull
    const pushResult = await pushToSupabase(supabase, userId)
    combined.pushed = pushResult.pushed
    combined.errors.push(...pushResult.errors)

    const pullResult = await pullFromSupabase(supabase)
    combined.pulled = pullResult.pulled
    combined.errors.push(...pullResult.errors)
  } catch (err) {
    combined.errors.push(`Sync: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    syncInProgress = false
  }

  return combined
}

/**
 * Check if user is authenticated. Returns user or null.
 * Auth is handled by middleware + login page — no auto-creation here.
 */
export async function getAuthUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
