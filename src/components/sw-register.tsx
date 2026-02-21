'use client'

import { useEffect, useCallback, createContext, useContext, useState } from 'react'

interface SWContextValue {
  updateAvailable: boolean
  applyUpdate: () => void
}

const SWContext = createContext<SWContextValue>({
  updateAvailable: false,
  applyUpdate: () => {},
})

export function useSWUpdate() {
  return useContext(SWContext)
}

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage('SKIP_WAITING')
    }
  }, [waitingWorker])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let registration: ServiceWorkerRegistration | null = null

    async function register() {
      try {
        registration = await navigator.serviceWorker.register('/sw.js')

        // Check if there's already a waiting worker (e.g. from a previous visit)
        if (registration.waiting) {
          setWaitingWorker(registration.waiting)
          setUpdateAvailable(true)
        }

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration!.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New SW installed while old one is still active = update available
              setWaitingWorker(newWorker)
              setUpdateAvailable(true)
            }
          })
        })
      } catch (err) {
        console.error('SW registration failed:', err)
      }
    }

    register()

    // When the new SW takes over, reload the page to use fresh assets
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })

    // Check for updates when the app becomes visible (tab switch, PWA resume)
    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && registration) {
        registration.update()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <SWContext.Provider value={{ updateAvailable, applyUpdate }}>
      {children}
    </SWContext.Provider>
  )
}
