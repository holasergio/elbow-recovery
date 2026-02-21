'use client'

import { useEffect, useRef } from 'react'

export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return
    let released = false

    navigator.wakeLock.request('screen').then((lock) => {
      if (released) { lock.release(); return }
      lockRef.current = lock
    }).catch(() => {
      // Wake Lock API may not be supported or permission denied
    })

    return () => {
      released = true
      lockRef.current?.release()
      lockRef.current = null
    }
  }, [active])
}
