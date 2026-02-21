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
