'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/stores/app-store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (theme === 'dark' || (theme === 'system' && systemDark)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const currentTheme = useAppStore.getState().theme
      if (currentTheme === 'system') {
        document.documentElement.classList.toggle('dark', mq.matches)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Auto-force dark after 21:00 for melatonin protection
  useEffect(() => {
    const checkEveningMode = () => {
      const hour = new Date().getHours()
      const isEvening = hour >= 21 || hour < 7
      if (isEvening && theme === 'system') {
        document.documentElement.classList.remove('light')
        document.documentElement.classList.add('dark')
      }
    }
    checkEveningMode()
    const interval = setInterval(checkEveningMode, 60000) // check every minute
    return () => clearInterval(interval)
  }, [theme])

  return <>{children}</>
}
