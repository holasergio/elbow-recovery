'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { ArrowClockwise } from '@phosphor-icons/react'

const THRESHOLD = 80
const MAX_PULL = 120

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)
  const pulling = useRef(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const isAtTop = useCallback(() => {
    return window.scrollY <= 0
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isAtTop() || refreshing) return
    startY.current = e.touches[0].clientY
    currentY.current = startY.current
    pulling.current = true
  }, [isAtTop, refreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling.current || refreshing) return

    currentY.current = e.touches[0].clientY
    const distance = Math.max(0, currentY.current - startY.current)

    if (distance > 0 && isAtTop()) {
      // Apply resistance (square root for natural feel)
      const dampened = Math.min(MAX_PULL, Math.sqrt(distance) * 6)
      setPullDistance(dampened)

      if (distance > 10) {
        e.preventDefault()
      }
    }
  }, [isAtTop, refreshing])

  const handleTouchEnd = useCallback(() => {
    if (!pulling.current) return
    pulling.current = false

    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true)
      setPullDistance(THRESHOLD * 0.6)

      // Small delay for visual feedback, then reload
      setTimeout(() => {
        window.location.reload()
      }, 400)
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, refreshing])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const progress = Math.min(1, pullDistance / THRESHOLD)
  const showIndicator = pullDistance > 10

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Pull indicator */}
      {showIndicator && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 999,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: `${Math.max(8, pullDistance - 20)}px`,
            transition: pulling.current ? 'none' : 'padding-top 0.3s ease',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `rotate(${progress * 360}deg)`,
              transition: pulling.current ? 'none' : 'transform 0.3s ease',
              opacity: progress,
            }}
          >
            <ArrowClockwise
              size={20}
              weight="bold"
              style={{
                color: progress >= 1 ? 'var(--color-primary)' : 'var(--color-text-muted)',
                animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Content with pull offset */}
      <div
        style={{
          transform: `translateY(${pullDistance > 10 ? pullDistance * 0.4 : 0}px)`,
          transition: pulling.current ? 'none' : 'transform 0.3s ease',
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
