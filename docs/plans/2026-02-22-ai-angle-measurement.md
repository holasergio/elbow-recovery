# AI Angle Measurement (MediaPipe Pose) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add AI-powered elbow angle measurement from photos using MediaPipe Pose Landmarker, with skeleton overlay visualization and auto-fill into ROM input form.

**Architecture:** MediaPipe `@mediapipe/tasks-vision` runs entirely client-side (WASM + GPU). User takes/selects a photo of their arm, the model detects 33 body landmarks, we extract shoulder→elbow→wrist points, compute the 3D angle via dot-product, and render a skeleton overlay on a canvas. The measured angle auto-fills the flexion or extension field. WASM + model files loaded from jsDelivr CDN (~15 MB on first load, cached after).

**Tech Stack:** @mediapipe/tasks-vision 0.10.x, React 19, Canvas API, Next.js 16 (client components)

---

## Context for Implementer

**Project:** `/Users/clawdbot/projects/elbow-recovery` — Next.js 16 PWA for elbow rehabilitation tracking.

**Patient:** Серж, 33 года, ORIF правый локоть (05.01.2026). App tracks ROM, exercises, pain, supplements.

**Design system:** Warm Recovery — CSS variables `var(--color-*)`, `var(--text-*)`, `var(--radius-*)`, `var(--shadow-*)`. See `src/app/globals.css`. Dark mode via `.dark` class.

**Existing photo flow:** `src/components/progress/rom-photo.tsx` — captures photo via `<input type="file" accept="image/*">`, compresses to 1200px JPEG base64 via canvas, passes data URL to parent.

**Existing ROM form:** `src/components/progress/rom-input.tsx` — fields: flexion (0-180°), extensionDeficit (0-90°), pronation, supination, photos, measuredBy, notes. Saves to `db.romMeasurements` (Dexie).

**DB schema:** `src/lib/db.ts` — `romMeasurements` table with `++id, date` indexes.

**Icons:** `@phosphor-icons/react` (duotone weight). Import pattern: `import { IconName } from '@phosphor-icons/react'`.

**Styling:** Inline `style={{}}` objects with CSS variables (NOT Tailwind classes in components). Follow existing pattern in rom-input.tsx and rom-photo.tsx.

**Key constraint:** All components are `'use client'`. MediaPipe WASM only works in browser — must guard against SSR with `typeof window !== 'undefined'` checks or dynamic imports.

---

### Task 1: Install @mediapipe/tasks-vision

**Files:**
- Modify: `package.json`

**Step 1: Install the package**

```bash
cd /Users/clawdbot/projects/elbow-recovery
npm install @mediapipe/tasks-vision
```

**Step 2: Verify installation**

```bash
ls node_modules/@mediapipe/tasks-vision/wasm/
```
Expected: Files including `vision_wasm_internal.js`, `vision_wasm_internal.wasm`

**Step 3: Verify build still works**

```bash
npm run build 2>&1 | tail -20
```
Expected: Build succeeds (no import errors)

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @mediapipe/tasks-vision for AI angle measurement"
```

---

### Task 2: Create pose angle utilities

**Files:**
- Create: `src/lib/pose-angle.ts`

**Step 1: Create the utility file**

Create `src/lib/pose-angle.ts` with these exports:

```typescript
/**
 * Landmark indices for arm joints (MediaPipe Pose 33-landmark model)
 */
export const LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
} as const

export interface Point3D {
  x: number
  y: number
  z: number
  visibility?: number
}

/**
 * Calculate angle at vertex B (in degrees) using 3D dot product.
 * More accurate than 2D atan2 because it accounts for depth.
 *
 * @param a - First point (e.g. shoulder)
 * @param b - Vertex point (e.g. elbow)
 * @param c - Third point (e.g. wrist)
 * @returns Angle in degrees [0, 180]
 */
export function calculateAngle3D(a: Point3D, b: Point3D, c: Point3D): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z }

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2)
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2)

  if (magBA === 0 || magBC === 0) return 0

  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)))
  return Math.acos(cosAngle) * (180 / Math.PI)
}

/**
 * Determine which arm is more visible/confident in the detected pose.
 * Returns 'right' or 'left'.
 */
export function detectDominantArm(landmarks: Point3D[]): 'left' | 'right' {
  const rightVis =
    (landmarks[LANDMARKS.RIGHT_SHOULDER].visibility ?? 0) +
    (landmarks[LANDMARKS.RIGHT_ELBOW].visibility ?? 0) +
    (landmarks[LANDMARKS.RIGHT_WRIST].visibility ?? 0)

  const leftVis =
    (landmarks[LANDMARKS.LEFT_SHOULDER].visibility ?? 0) +
    (landmarks[LANDMARKS.LEFT_ELBOW].visibility ?? 0) +
    (landmarks[LANDMARKS.LEFT_WRIST].visibility ?? 0)

  return rightVis >= leftVis ? 'right' : 'left'
}

export interface ElbowAngleResult {
  angle: number
  arm: 'left' | 'right'
  confidence: number // 0-1, average visibility of 3 landmarks
  shoulderNorm: Point3D
  elbowNorm: Point3D
  wristNorm: Point3D
}

/**
 * Extract elbow angle from pose landmarks.
 * Uses worldLandmarks for 3D angle, normalized landmarks for overlay coordinates.
 *
 * @param normalizedLandmarks - Pose landmarks in image-normalized [0,1] coordinates
 * @param worldLandmarks - Pose landmarks in real-world meters
 */
export function getElbowAngle(
  normalizedLandmarks: Point3D[],
  worldLandmarks: Point3D[],
): ElbowAngleResult {
  const arm = detectDominantArm(normalizedLandmarks)

  const shoulderIdx = arm === 'right' ? LANDMARKS.RIGHT_SHOULDER : LANDMARKS.LEFT_SHOULDER
  const elbowIdx = arm === 'right' ? LANDMARKS.RIGHT_ELBOW : LANDMARKS.LEFT_ELBOW
  const wristIdx = arm === 'right' ? LANDMARKS.RIGHT_WRIST : LANDMARKS.LEFT_WRIST

  // Use world landmarks for accurate 3D angle
  const angle = calculateAngle3D(
    worldLandmarks[shoulderIdx],
    worldLandmarks[elbowIdx],
    worldLandmarks[wristIdx],
  )

  // Average visibility as confidence
  const confidence =
    ((normalizedLandmarks[shoulderIdx].visibility ?? 0) +
      (normalizedLandmarks[elbowIdx].visibility ?? 0) +
      (normalizedLandmarks[wristIdx].visibility ?? 0)) / 3

  return {
    angle: Math.round(angle),
    arm,
    confidence,
    shoulderNorm: normalizedLandmarks[shoulderIdx],
    elbowNorm: normalizedLandmarks[elbowIdx],
    wristNorm: normalizedLandmarks[wristIdx],
  }
}
```

**Step 2: Verify build**

```bash
cd /Users/clawdbot/projects/elbow-recovery && npm run build 2>&1 | tail -10
```
Expected: PASS

**Step 3: Commit**

```bash
git add src/lib/pose-angle.ts
git commit -m "feat: add pose angle calculation utilities for MediaPipe"
```

---

### Task 3: Create MediaPipe loader singleton

**Files:**
- Create: `src/lib/mediapipe.ts`

**Step 1: Create the loader**

Create `src/lib/mediapipe.ts`:

```typescript
'use client'

import type { PoseLandmarker as PoseLandmarkerType } from '@mediapipe/tasks-vision'

let instance: PoseLandmarkerType | null = null
let loading: Promise<PoseLandmarkerType> | null = null

/**
 * Lazy-load and cache a PoseLandmarker singleton.
 * WASM + model loaded from CDN (~15 MB, cached by browser).
 * Must only be called in the browser.
 */
export async function getPoseLandmarker(): Promise<PoseLandmarkerType> {
  if (instance) return instance

  if (loading) return loading

  loading = (async () => {
    const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
    )

    const landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task',
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
    })

    instance = landmarker
    return landmarker
  })()

  return loading
}
```

**Important:** We pin `@0.10.18` in the CDN URL for the WASM runtime for stability. The model URL uses `latest` which Google keeps updated.

**Step 2: Verify build**

```bash
cd /Users/clawdbot/projects/elbow-recovery && npm run build 2>&1 | tail -10
```
Expected: PASS

**Step 3: Commit**

```bash
git add src/lib/mediapipe.ts
git commit -m "feat: add MediaPipe PoseLandmarker lazy singleton loader"
```

---

### Task 4: Create AngleMeasurer component

**Files:**
- Create: `src/components/progress/angle-measurer.tsx`

This is the main component. It receives a base64 photo, runs MediaPipe detection, draws skeleton overlay on canvas, and returns the measured angle.

**Step 1: Create the component**

Create `src/components/progress/angle-measurer.tsx`:

```typescript
'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Camera, Crosshair, ArrowCounterClockwise, Lightning } from '@phosphor-icons/react'
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
```

**Step 2: Verify build**

```bash
cd /Users/clawdbot/projects/elbow-recovery && npm run build 2>&1 | tail -10
```
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/progress/angle-measurer.tsx
git commit -m "feat: add AngleMeasurer component with skeleton overlay"
```

---

### Task 5: Add AI measurement trigger to ROMPhoto

**Files:**
- Modify: `src/components/progress/rom-photo.tsx`

The ROMPhoto component needs a new "AI Замер" button that appears when a photo is loaded. When pressed, it triggers the AngleMeasurer overlay via a callback.

**Step 1: Update ROMPhoto interface and component**

In `src/components/progress/rom-photo.tsx`:

1. Add new prop `onMeasureAngle?: () => void` to `ROMPhotoProps`
2. When a photo is loaded (value is truthy), show a small "AI" button below the thumbnail

Updated interface:

```typescript
interface ROMPhotoProps {
  label: string
  value?: string
  onChange: (dataUrl: string | undefined) => void
  onMeasureAngle?: () => void
}
```

Add the AI button below the photo preview (when `value` is truthy and `onMeasureAngle` is provided):

```typescript
{value && onMeasureAngle && (
  <button
    type="button"
    onClick={onMeasureAngle}
    style={{
      marginTop: '4px',
      padding: '4px 10px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--color-accent)',
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-accent)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      width: '120px',
      justifyContent: 'center',
    }}
    aria-label={`AI замер угла по ${label.toLowerCase()}`}
  >
    <Crosshair size={14} weight="duotone" />
    AI Замер
  </button>
)}
```

Import `Crosshair` from `@phosphor-icons/react` at the top.

**Step 2: Verify build**

```bash
cd /Users/clawdbot/projects/elbow-recovery && npm run build 2>&1 | tail -10
```

**Step 3: Commit**

```bash
git add src/components/progress/rom-photo.tsx
git commit -m "feat: add AI measure button to ROMPhoto component"
```

---

### Task 6: Integrate AngleMeasurer into ROM input form

**Files:**
- Modify: `src/components/progress/rom-input.tsx`

This task wires everything together. When user clicks "AI Замер" on a photo, open the AngleMeasurer overlay. On result, auto-fill the flexion field.

**Step 1: Add state and imports**

At the top of `rom-input.tsx`, add:

```typescript
import { AngleMeasurer } from './angle-measurer'
```

Inside `ROMInput()`, add new state:

```typescript
const [analyzingPhoto, setAnalyzingPhoto] = useState<string | null>(null)
const [analyzeTarget, setAnalyzeTarget] = useState<'flexion' | 'extension'>('flexion')
```

**Step 2: Add handler**

```typescript
const handleAngleResult = useCallback((angle: number) => {
  if (analyzeTarget === 'flexion') {
    setFlexion(angle)
  } else {
    // For extension photo, the angle represents how far from 180° full extension
    // Extension deficit = 180 - measured angle (if arm not fully straight)
    const deficit = Math.max(0, 180 - angle)
    setExtensionDeficit(deficit)
  }
  setAnalyzingPhoto(null)
}, [analyzeTarget])
```

**Step 3: Pass callbacks to ROMPhoto components**

For the flexion photo:

```typescript
<ROMPhoto
  label="Фото сгибания"
  value={photoFlexion}
  onChange={setPhotoFlexion}
  onMeasureAngle={photoFlexion ? () => {
    setAnalyzeTarget('flexion')
    setAnalyzingPhoto(photoFlexion)
  } : undefined}
/>
```

For the extension photo:

```typescript
<ROMPhoto
  label="Фото разгибания"
  value={photoExtension}
  onChange={setPhotoExtension}
  onMeasureAngle={photoExtension ? () => {
    setAnalyzeTarget('extension')
    setAnalyzingPhoto(photoExtension)
  } : undefined}
/>
```

**Step 4: Render AngleMeasurer when active**

At the end of the component JSX (before closing `</div>`):

```typescript
{analyzingPhoto && (
  <AngleMeasurer
    photoDataUrl={analyzingPhoto}
    onResult={handleAngleResult}
    onClose={() => setAnalyzingPhoto(null)}
  />
)}
```

**Step 5: Verify build**

```bash
cd /Users/clawdbot/projects/elbow-recovery && npm run build 2>&1 | tail -10
```

**Step 6: Commit**

```bash
git add src/components/progress/rom-input.tsx
git commit -m "feat: integrate AI angle measurement into ROM input form"
```

---

### Task 7: Add photo guide hint

**Files:**
- Modify: `src/components/progress/rom-input.tsx`

Add a brief instructional hint above the photo section explaining how to take photos for best AI results.

**Step 1: Add hint text**

Above the photo capture `<div>`, add:

```typescript
{/* Photo guide for AI measurement */}
<div style={{
  padding: '12px 16px',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--color-accent-light)',
  display: 'flex',
  gap: '8px',
  alignItems: 'flex-start',
}}>
  <Crosshair size={18} weight="duotone" style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
    <strong>AI-замер:</strong> Сфотографируйте руку сбоку, чтобы были видны плечо, локоть и запястье. После загрузки нажмите «AI Замер».
  </p>
</div>
```

Import `Crosshair` from `@phosphor-icons/react` (add to existing import).

**Step 2: Verify build**

```bash
cd /Users/clawdbot/projects/elbow-recovery && npm run build 2>&1 | tail -10
```

**Step 3: Commit**

```bash
git add src/components/progress/rom-input.tsx
git commit -m "feat: add photo guide for AI angle measurement"
```

---

### Task 8: Add DB field for AI measurements

**Files:**
- Modify: `src/lib/db.ts`
- Modify: `src/components/progress/rom-input.tsx`

Track whether a measurement was made manually or by AI.

**Step 1: Update ROMMeasurement interface in db.ts**

Add optional field to the ROMMeasurement interface:

```typescript
aiMeasuredFlexion?: number    // AI-detected flexion angle (if used)
aiMeasuredExtension?: number  // AI-detected extension deficit (if used)
```

No schema version bump needed — these are optional fields in Dexie and don't require migration.

**Step 2: Save AI values in rom-input.tsx handleSave**

Add state to track AI values:

```typescript
const [aiFlexion, setAiFlexion] = useState<number | undefined>()
const [aiExtension, setAiExtension] = useState<number | undefined>()
```

Update `handleAngleResult`:

```typescript
const handleAngleResult = useCallback((angle: number) => {
  if (analyzeTarget === 'flexion') {
    setFlexion(angle)
    setAiFlexion(angle)
  } else {
    const deficit = Math.max(0, 180 - angle)
    setExtensionDeficit(deficit)
    setAiExtension(deficit)
  }
  setAnalyzingPhoto(null)
}, [analyzeTarget])
```

In `handleSave`, include AI values:

```typescript
await db.romMeasurements.add({
  // ...existing fields...
  aiMeasuredFlexion: aiFlexion,
  aiMeasuredExtension: aiExtension,
})
```

Reset in the setTimeout block:

```typescript
setAiFlexion(undefined)
setAiExtension(undefined)
```

**Step 3: Verify build**

```bash
cd /Users/clawdbot/projects/elbow-recovery && npm run build 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/lib/db.ts src/components/progress/rom-input.tsx
git commit -m "feat: store AI-measured angles in ROM measurements"
```

---

## Summary

| Task | Description | Key Files |
|------|------------|-----------|
| 1 | Install @mediapipe/tasks-vision | package.json |
| 2 | Angle calculation utilities | src/lib/pose-angle.ts |
| 3 | MediaPipe loader singleton | src/lib/mediapipe.ts |
| 4 | AngleMeasurer component with canvas overlay | src/components/progress/angle-measurer.tsx |
| 5 | AI measure button on ROMPhoto | src/components/progress/rom-photo.tsx |
| 6 | Integration into ROM input form | src/components/progress/rom-input.tsx |
| 7 | Photo guide hint | src/components/progress/rom-input.tsx |
| 8 | DB field for AI measurements | src/lib/db.ts, rom-input.tsx |

**Total new files:** 3 (pose-angle.ts, mediapipe.ts, angle-measurer.tsx)
**Modified files:** 3 (rom-photo.tsx, rom-input.tsx, db.ts)
