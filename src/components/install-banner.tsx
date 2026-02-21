'use client'

import { useState, useEffect } from 'react'
import { X, ShareNetwork } from '@phosphor-icons/react'

export function InstallBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    const dismissed = sessionStorage.getItem('pwa-banner-dismissed')

    if (!isStandalone && !dismissed) {
      setVisible(true)
    }
  }, [])

  function handleDismiss() {
    sessionStorage.setItem('pwa-banner-dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
        padding: '12px 16px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        boxShadow: '0 4px 12px rgba(45, 42, 38, 0.15)',
        animation: 'slide-down 0.4s ease-out',
      }}
    >
      <div className="max-w-lg mx-auto flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold"
            style={{ lineHeight: 1.3 }}
          >
            Установите приложение на домашний экран
          </p>
          <p
            className="text-xs mt-1 flex items-center gap-1 flex-wrap"
            style={{ opacity: 0.9, lineHeight: 1.4 }}
          >
            Нажмите{' '}
            <span
              className="inline-flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.25)',
                borderRadius: '4px',
                padding: '1px 4px',
                verticalAlign: 'middle',
              }}
            >
              <ShareNetwork size={14} weight="bold" />
            </span>{' '}
            <span style={{ whiteSpace: 'nowrap' }}>
              {'\u2192'} {'\u00AB'}На экран &quot;Домой&quot;{'\u00BB'}
            </span>
          </p>
        </div>

        {/* Animated arrow pointing toward iOS share button (bottom-center) */}
        <div
          className="flex-shrink-0 self-center"
          style={{ animation: 'bounce-arrow 1.2s ease-in-out infinite' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4 L10 16 M4 10 L10 16 L16 10"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-full transition-colors"
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
          }}
          aria-label="Закрыть"
        >
          <X size={16} weight="bold" />
        </button>
      </div>

      <style>{`
        @keyframes slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes bounce-arrow {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(5px); }
        }
      `}</style>
    </div>
  )
}
