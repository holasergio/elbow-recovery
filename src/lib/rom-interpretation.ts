export interface ROMInterpretation {
  summary: string
  functionalNext: string
  weeklyChange?: string
  canDo: string[]
  cantYet: string[]
  phaseStatus: 'ahead' | 'on-track' | 'behind'
}

const MILESTONES = [
  { angle: 30, label: 'Работа за клавиатурой' },
  { angle: 50, label: 'Держать руль' },
  { angle: 60, label: 'Писать на бумаге' },
  { angle: 80, label: 'Открыть дверную ручку' },
  { angle: 90, label: 'Застегнуть пуговицу на груди' },
  { angle: 100, label: 'Поднести ложку ко рту' },
  { angle: 110, label: 'Пить из чашки' },
  { angle: 120, label: 'Телефон к уху' },
  { angle: 130, label: 'Причесаться' },
  { angle: 145, label: 'Полная норма' },
]

export function interpretROM(
  arc: number,
  phaseNum: number,
  targetMin: number,
  targetMax: number,
  previousArc?: number,
): ROMInterpretation {
  // Guard against invalid values
  if (isNaN(arc) || arc < 0) arc = 0
  if (arc > 180) arc = 180

  const canDo = MILESTONES.filter(m => m.angle <= arc).map(m => m.label)
  const cantYet = MILESTONES.filter(m => m.angle > arc).map(m => `${m.label} (нужно ${m.angle}°)`)
  const nextMilestone = MILESTONES.find(m => m.angle > arc)

  let phaseStatus: 'ahead' | 'on-track' | 'behind' = 'on-track'
  if (arc >= targetMax) phaseStatus = 'ahead'
  else if (arc < targetMin) phaseStatus = 'behind'

  const statusText = phaseStatus === 'ahead'
    ? `Опережаете цель фазы ${phaseNum}!`
    : phaseStatus === 'on-track'
      ? `В пределах цели фазы ${phaseNum} (${targetMin}–${targetMax}°)`
      : `Ниже цели фазы ${phaseNum} (${targetMin}–${targetMax}°), продолжайте упражнения`

  const summary = `${arc}° — ${statusText}`

  const functionalNext = nextMilestone
    ? `Следующий рубеж: ${nextMilestone.angle}° (${nextMilestone.label})`
    : 'Все функциональные вехи достигнуты!'

  const weeklyChange = previousArc !== undefined
    ? `${arc >= previousArc ? '+' : ''}${arc - previousArc}° за последний замер`
    : undefined

  return { summary, functionalNext, weeklyChange, canDo, cantYet, phaseStatus }
}
