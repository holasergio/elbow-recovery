// ──────────────────────────────────────────────
// audio.ts — Differentiated audio cues
// Different sounds for different session events
// ──────────────────────────────────────────────

type SoundType = 'holdStart' | 'holdEnd' | 'setComplete' | 'sessionComplete' | 'warning'

interface SoundConfig {
  frequencies: number[]
  duration: number
  gain: number
}

const SOUNDS: Record<SoundType, SoundConfig> = {
  holdStart: { frequencies: [440], duration: 200, gain: 0.25 },
  holdEnd: { frequencies: [880], duration: 400, gain: 0.3 },
  setComplete: { frequencies: [523, 659, 784], duration: 300, gain: 0.25 },
  sessionComplete: { frequencies: [523, 659, 784, 1047], duration: 600, gain: 0.3 },
  warning: { frequencies: [400, 300], duration: 500, gain: 0.25 },
}

export function playSound(type: SoundType): void {
  try {
    const ctx = new AudioContext()
    const config = SOUNDS[type]
    const now = ctx.currentTime

    config.frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      osc.frequency.value = freq
      const startTime = now + (i * config.duration) / 1000 / config.frequencies.length
      const endTime = startTime + config.duration / 1000 / config.frequencies.length
      gainNode.gain.setValueAtTime(config.gain, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, endTime)
      osc.start(startTime)
      osc.stop(endTime)
    })
  } catch {
    // AudioContext may not be available
  }
}
