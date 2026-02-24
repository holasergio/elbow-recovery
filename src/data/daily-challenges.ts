export interface DailyChallenge {
  id: string
  title: string
  description: string
  icon: string
  category: 'exercise' | 'wellness' | 'nutrition' | 'mindset'
  xpReward: number
  condition: 'sessions_3' | 'all_supplements' | 'sleep_7h' | 'no_pain_skip' | 'rom_measure' | 'journal_entry' | 'mood_log' | 'breathing' | 'score_70' | 'all_5_sessions'
}

export const dailyChallenges: DailyChallenge[] = [
  { id: 'ch_3_sessions', title: 'Тройка', description: 'Завершить 3 сессии сегодня', icon: 'Lightning', category: 'exercise', xpReward: 15, condition: 'sessions_3' },
  { id: 'ch_all_5', title: 'Марафонец', description: 'Все 5 сессий за день', icon: 'Trophy', category: 'exercise', xpReward: 30, condition: 'all_5_sessions' },
  { id: 'ch_supplements', title: 'Фармацевт', description: 'Принять все добавки', icon: 'Pill', category: 'nutrition', xpReward: 15, condition: 'all_supplements' },
  { id: 'ch_sleep', title: 'Соня', description: 'Спать >= 7 часов', icon: 'Moon', category: 'wellness', xpReward: 10, condition: 'sleep_7h' },
  { id: 'ch_rom', title: 'Измеритель', description: 'Сделать замер ROM', icon: 'Ruler', category: 'exercise', xpReward: 10, condition: 'rom_measure' },
  { id: 'ch_journal', title: 'Летописец', description: 'Написать в дневник', icon: 'NotePencil', category: 'mindset', xpReward: 10, condition: 'journal_entry' },
  { id: 'ch_mood', title: 'Самоанализ', description: 'Отметить настроение', icon: 'Smiley', category: 'mindset', xpReward: 5, condition: 'mood_log' },
  { id: 'ch_breathing', title: 'Дыхание', description: 'Дыхательная практика', icon: 'Wind', category: 'wellness', xpReward: 10, condition: 'breathing' },
  { id: 'ch_score_70', title: 'Целеустремлённый', description: 'Recovery Score >= 70', icon: 'Target', category: 'exercise', xpReward: 20, condition: 'score_70' },
]

/** Pick 3 challenges for today based on day-of-year rotation */
export function getTodayChallenges(): DailyChallenge[] {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const shuffled = [...dailyChallenges].sort((a, b) => {
    const hashA = (dayOfYear * 31 + a.id.charCodeAt(3)) % 100
    const hashB = (dayOfYear * 31 + b.id.charCodeAt(3)) % 100
    return hashA - hashB
  })
  return shuffled.slice(0, 3)
}
