import { db, type PainEntry } from '@/lib/db'

export interface RedFlag {
  condition: string
  message: string
  severity: 'red' | 'yellow'
}

export async function checkRedFlags(entry: PainEntry): Promise<RedFlag[]> {
  const flags: RedFlag[] = []

  // Numbness in fingers 4-5 = ulnar nerve neuropathy
  if (entry.numbness45) {
    flags.push({
      condition: 'numbness',
      message: 'Онемение 4-5 пальцев! Возможная нейропатия локтевого нерва. Срочно к врачу.',
      severity: 'red',
    })
  }

  // High pain 8+ for 2+ days
  if (entry.level >= 8) {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const recentHigh = await db.painEntries
      .where('date')
      .above(twoDaysAgo.toISOString().split('T')[0])
      .filter((e) => e.level >= 8)
      .count()
    if (recentHigh >= 2) {
      flags.push({
        condition: 'sustained_high_pain',
        message: 'Боль 8+ два дня подряд. Рекомендуется консультация врача.',
        severity: 'red',
      })
    }
  }

  // Severe crepitation
  if (entry.crepitation === 'severe') {
    flags.push({
      condition: 'severe_crepitation',
      message: 'Выраженная крепитация. Обсудите с врачом на ближайшем приёме.',
      severity: 'yellow',
    })
  }

  // Night pain above 6
  if (entry.level >= 6 && entry.triggers.includes('night')) {
    flags.push({
      condition: 'night_pain',
      message: 'Ночная боль 6+. Может мешать восстановлению. Обсудите обезболивание с врачом.',
      severity: 'yellow',
    })
  }

  return flags
}
