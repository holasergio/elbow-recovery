// ──────────────────────────────────────────────
// session-store.ts — localStorage persistence for active session state
// Synchronous reads for instant restore on mount
// ──────────────────────────────────────────────

export interface ActiveSessionState {
  sessionId: number
  currentStep: number
  startTime: string            // ISO string — when the session was first started
  timerElapsedSeconds: number  // how many seconds of the current step timer have elapsed
  isTimerRunning: boolean
  savedAt: number              // Date.now() timestamp when this snapshot was saved
}

const KEY_PREFIX = 'active-session-'
const CURRENT_KEY = 'active-session-current'

export function saveSessionState(state: ActiveSessionState): void {
  try {
    const payload = JSON.stringify(state)
    localStorage.setItem(`${KEY_PREFIX}${state.sessionId}`, payload)
    localStorage.setItem(CURRENT_KEY, String(state.sessionId))
  } catch {
    // localStorage may be full or unavailable — silently ignore
  }
}

export function loadSessionState(sessionId: number): ActiveSessionState | null {
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${sessionId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ActiveSessionState
    // Basic validation
    if (
      typeof parsed.sessionId !== 'number' ||
      typeof parsed.currentStep !== 'number' ||
      typeof parsed.startTime !== 'string' ||
      typeof parsed.timerElapsedSeconds !== 'number' ||
      typeof parsed.isTimerRunning !== 'boolean' ||
      typeof parsed.savedAt !== 'number'
    ) {
      return null
    }
    // Expire sessions older than 4 hours (stale data)
    const ageMs = Date.now() - parsed.savedAt
    if (ageMs > 4 * 60 * 60 * 1000) {
      clearSessionState(sessionId)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearSessionState(sessionId: number): void {
  try {
    localStorage.removeItem(`${KEY_PREFIX}${sessionId}`)
    // Clear current pointer if it matches
    const current = localStorage.getItem(CURRENT_KEY)
    if (current === String(sessionId)) {
      localStorage.removeItem(CURRENT_KEY)
    }
  } catch {
    // silently ignore
  }
}

export function getActiveSession(): { sessionId: number } | null {
  try {
    const current = localStorage.getItem(CURRENT_KEY)
    if (!current) return null
    const sessionId = Number(current)
    if (isNaN(sessionId)) return null
    // Verify the session data still exists and is valid
    const state = loadSessionState(sessionId)
    if (!state) return null
    return { sessionId }
  } catch {
    return null
  }
}
