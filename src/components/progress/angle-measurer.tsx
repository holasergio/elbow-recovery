'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Crosshair, ArrowCounterClockwise, Lightning } from '@phosphor-icons/react'
import { getPoseLandmarker } from '@/lib/mediapipe'
import { getElbowAngle, type ElbowAngleResult } from '@/lib/pose-angle'

interface AngleMeasurerProps {
  /** Base64 data URL of the photo to analyze */
  photoDataUrl: string
  /** Called when angle is successfully measured */
  onResult: (angle: number, arm: 'left' | 'right') => void
  /** Called to dismiss the measurer */
  onClose: () => void
}

type Status = 'loading-model' | 'analyzing' | 'result' | 'error'

export function AngleMeasurer({ photoDataUrl, onResult, onClose }: AngleMeasurerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<Status>('loading-model')
  const [result, setResult] = useState<ElbowAngleResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const analyze = useCallback(async () => {
    setStatus('loading-model')
    setResult(null)
    setErrorMsg('')

    try {
      const landmarker = await getPoseLandmarker()
      setStatus('analyzing')

      // Load the image into an HTMLImageElement
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = photoDataUrl
      })

      // Run detection
      const detection = landmarker.detect(img)

      if (!detection.landmarks.length) {
        setStatus('error')
        setErrorMsg('Поза не обнаружена. Убедитесь, что на фото видны плечо, локоть и запястье.')
        return
      }

      const angleResult = getElbowAngle(detection.landmarks[0], detection.worldLandmarks[0])

      if (angleResult.confidence < 0.3) {
        setStatus('error')
        setErrorMsg('Низкая точность. Попробуйте фото сбоку при хорошем освещении.')
        return
      }

      // Draw overlay on canvas
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')!

        // Draw image
        ctx.drawImage(img, 0, 0)

        const w = img.naturalWidth
        const h = img.naturalHeight

        // Helper to convert normalized to pixel coords
        const toPixel = (p: { x: number; y: number }) => ({
          x: p.x * w,
          y: p.y * h,
        })

        const shoulder = toPixel(angleResult.shoulderNorm)
        const elbow = toPixel(angleResult.elbowNorm)
        const wrist = toPixel(angleResult.wristNorm)

        // Draw arm lines
        ctx.strokeStyle = '#5B8A72' // --color-primary
        ctx.lineWidth = Math.max(4, w * 0.006)
        ctx.lineCap = 'round'

        ctx.beginPath()
        ctx.moveTo(shoulder.x, shoulder.y)
        ctx.lineTo(elbow.x, elbow.y)
        ctx.lineTo(wrist.x, wrist.y)
        ctx.stroke()

        // Draw arc at elbow
        const arcRadius = Math.max(30, w * 0.06)
        const angleToShoulder = Math.atan2(shoulder.y - elbow.y, shoulder.x - elbow.x)
        const angleToWrist = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x)

        ctx.strokeStyle = '#D4A76A' // --color-accent (gold)
        ctx.lineWidth = Math.max(3, w * 0.004)
        ctx.beginPath()
        ctx.arc(elbow.x, elbow.y, arcRadius, angleToWrist, angleToShoulder, false)
        ctx.stroke()

        // Draw joint dots
        const dotRadius = Math.max(8, w * 0.012)
        for (const point of [shoulder, elbow, wrist]) {
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = '#5B8A72'
          ctx.beginPath()
          ctx.arc(point.x, point.y, dotRadius * 0.7, 0, Math.PI * 2)
          ctx.fill()
        }

        // Draw angle text near elbow
        const fontSize = Math.max(28, w * 0.05)
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        // Text shadow
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillText(`${angleResult.angle}°`, elbow.x + 2, elbow.y - dotRadius - 8 + 2)
        // Text
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(`${angleResult.angle}°`, elbow.x, elbow.y - dotRadius - 8)
      }

      setResult(angleResult)
      setStatus('result')
    } catch (err) {
      console.error('Angle measurement error:', err)
      setStatus('error')
      setErrorMsg('Ошибка анализа. Попробуйте другое фото.')
    }
  }, [photoDataUrl])

  useEffect(() => {
    analyze()
  }, [analyze])

  const confidenceLabel = result
    ? result.confidence >= 0.7
      ? 'Высокая'
      : result.confidence >= 0.5
        ? 'Средняя'
        : 'Низкая'
    : ''

  const confidenceColor = result
    ? result.confidence >= 0.7
      ? 'var(--color-success)'
      : result.confidence >= 0.5
        ? 'var(--color-warning)'
        : 'var(--color-error)'
    : ''

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      {/* Status bar */}
      {(status === 'loading-model' || status === 'analyzing') && (
        <div style={{
          color: '#FFFFFF',
          fontSize: 'var(--text-base)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Lightning size={20} weight="duotone" style={{
            animation: 'pulse 1.5s infinite',
            color: 'var(--color-accent)',
          }} />
          {status === 'loading-model' ? 'Загрузка AI модели...' : 'Анализ позы...'}
        </div>
      )}

      {/* Canvas with photo + overlay */}
      <div style={{
        position: 'relative',
        maxWidth: '100%',
        maxHeight: '60vh',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            maxHeight: '60vh',
            objectFit: 'contain',
            display: status === 'result' ? 'block' : 'none',
          }}
        />
        {(status === 'loading-model' || status === 'analyzing') && (
          <img
            src={photoDataUrl}
            alt="Analyzing"
            style={{
              maxWidth: '100%',
              maxHeight: '60vh',
              objectFit: 'contain',
              opacity: 0.6,
            }}
          />
        )}
      </div>

      {/* Result panel */}
      {status === 'result' && result && (
        <div style={{
          marginTop: '16px',
          padding: '16px 24px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          minWidth: '240px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
            <Crosshair size={20} weight="duotone" style={{ color: 'var(--color-primary)' }} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-4xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
            }}>
              {result.angle}°
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '8px',
            fontSize: 'var(--text-xs)',
          }}>
            <span style={{ color: 'var(--color-text-muted)' }}>
              {result.arm === 'right' ? 'Правая рука' : 'Левая рука'}
            </span>
            <span style={{ color: confidenceColor, fontWeight: 600 }}>
              Точность: {confidenceLabel}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => {
                onResult(result.angle, result.arm)
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Применить {result.angle}°
            </button>
            <button
              type="button"
              onClick={analyze}
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
              aria-label="Повторить анализ"
            >
              <ArrowCounterClockwise size={18} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Error panel */}
      {status === 'error' && (
        <div style={{
          marginTop: '16px',
          padding: '16px 24px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          maxWidth: '320px',
        }}>
          <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', marginBottom: '12px' }}>
            {errorMsg}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={analyze}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <ArrowCounterClockwise size={16} weight="bold" />
              Повторить
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Close button (always visible) */}
      {status !== 'error' && (
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '12px',
            padding: '8px 24px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
          }}
        >
          Закрыть
        </button>
      )}
    </div>
  )
}
