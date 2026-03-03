'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { getAuthUser, syncAll } from '@/lib/sync'
import { createClient } from '@/lib/supabase/client'

const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const runSync = useCallback(async () => {
    try {
      const user = await getAuthUser()
      if (!user) return // Not logged in — sync skipped

      const result = await syncAll()
      if (result.pushed > 0 || result.pulled > 0) {
        console.log(`[sync] pushed: ${result.pushed}, pulled: ${result.pulled}`)
      }
      if (result.pulled > 0) {
        setSyncMessage(`Синхронизировано: ${result.pulled} записей загружено`)
        setTimeout(() => setSyncMessage(null), 4000)
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
      syncAll().catch(() => {})
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Sync on auth state change (triggers sync immediately after login)
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setTimeout(runSync, 500)
      }
    })

    return () => {
      clearTimeout(initTimer)
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      subscription.unsubscribe()
    }
  }, [runSync])

  return (
    <>
      {children}
      {syncMessage && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1a1a2e',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {syncMessage}
        </div>
      )}
    </>
  )
}
