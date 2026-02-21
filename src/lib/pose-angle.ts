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
