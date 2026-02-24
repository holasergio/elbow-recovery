// ──────────────────────────────────────────────
// haptic.ts — Тактильная обратная связь (vibrate API)
// На iOS PWA vibrate не работает — silently ignored
// ──────────────────────────────────────────────

type HapticPattern = 'light' | 'medium' | 'success' | 'error' | 'milestone'

const PATTERNS: Record<HapticPattern, number[]> = {
  light:     [15],
  medium:    [40],
  success:   [30, 40, 60],
  error:     [80, 30, 80],
  milestone: [30, 50, 30, 50, 100],
}

export function haptic(pattern: HapticPattern = 'light'): void {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(PATTERNS[pattern])
    }
  } catch {
    // ignore — API not available
  }
}
