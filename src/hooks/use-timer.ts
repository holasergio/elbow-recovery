'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export function useTimer(targetSeconds: number, initialElapsed: number = 0) {
  const [isRunning, setIsRunning] = useState(false)
  const [remaining, setRemaining] = useState(Math.max(0, targetSeconds - initialElapsed))
  const startTimeRef = useRef<number>(0)
  const elapsedBeforePauseRef = useRef<number>(initialElapsed)

  // Expose total elapsed seconds for persistence
  const getElapsed = useCallback(() => {
    if (isRunning) {
      return elapsedBeforePauseRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000)
    }
    return elapsedBeforePauseRef.current
  }, [isRunning])

  const start = useCallback(() => {
    startTimeRef.current = Date.now()
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    elapsedBeforePauseRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000)
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setRemaining(targetSeconds)
    elapsedBeforePauseRef.current = 0
  }, [targetSeconds])

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      const currentElapsed = elapsedBeforePauseRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000)
      const left = Math.max(0, targetSeconds - currentElapsed)
      setRemaining(left)
      if (left === 0) {
        setIsRunning(false)
        playCompletionSound()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isRunning, targetSeconds])

  return { remaining, isRunning, start, pause, reset, isComplete: remaining === 0, getElapsed }
}

function playCompletionSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // AudioContext may not be available in all environments
  }
}
