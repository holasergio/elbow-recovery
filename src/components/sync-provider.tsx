'use client'

import { useEffect, useRef, useCallback } from 'react'
import { getAuthUser, syncAll } from '@/lib/sync'

const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false)

  const runSync = useCallback(async () => {
    try {
      const user = await getAuthUser()
      if (!user) return // Not logged in — sync skipped

      const result = await syncAll()
      if (result.pushed > 0 || result.pulled > 0) {
        console.log(`[sync] pushed: ${result.pushed}, pulled: ${result.pulled}`)
      }
      if (result.errors.length > 0) {
        console.warn('[sync] errors:', result.errors)
      }
    } catch (err) {
      console.warn('[sync] failed:', err)
    }
  }, [])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Initial sync after short delay (let Dexie initialize first)
    const initTimer = setTimeout(runSync, 2000)

    // Periodic sync
    const interval = setInterval(runSync, SYNC_INTERVAL_MS)

    // Sync on visibility change (when user returns to app)
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        runSync()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Sync before page unload (best-effort)
    function handleBeforeUnload() {
      // Use sendBeacon-style approach via navigator
      // Can't do async here, so just trigger it
      syncAll().catch(() => {})
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearTimeout(initTimer)
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [runSync])

  return <>{children}</>
}
