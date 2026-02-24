export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string        // Phosphor icon name for rendering
  category: 'streak' | 'sessions' | 'supplements' | 'rom' | 'wellness' | 'milestone'
  xp: number          // XP reward
}

export const achievements: AchievementDef[] = [
  // -- Streak --
  { id: 'streak_3',   name: 'Разгон',            description: '3 дня подряд',                      icon: 'Fire',          category: 'streak',      xp: 30 },
  { id: 'streak_7',   name: 'Неделя!',           description: '7 дней подряд',                      icon: 'Fire',          category: 'streak',      xp: 70 },
  { id: 'streak_14',  name: 'Двухнедельник',     description: '14 дней подряд',                     icon: 'Fire',          category: 'streak',      xp: 150 },
  { id: 'streak_30',  name: 'Месяц стали',       description: '30 дней подряд',                     icon: 'Trophy',        category: 'streak',      xp: 300 },

  // -- Sessions --
  { id: 'first_session',  name: 'Первый шаг',    description: 'Заверши первую сессию',              icon: 'Play',          category: 'sessions',    xp: 20 },
  { id: 'all_5_today',    name: 'Полный день',    description: 'Сделай все 5 сессий за день',        icon: 'CheckCircle',   category: 'sessions',    xp: 100 },
  { id: 'sessions_50',    name: 'Полтинник',      description: '50 сессий всего',                    icon: 'Barbell',       category: 'sessions',    xp: 200 },

  // -- Supplements --
  { id: 'sups_perfect_day', name: 'Все по плану', description: 'Прими все добавки за день',          icon: 'Pill',          category: 'supplements', xp: 50 },
  { id: 'sups_7_days',     name: 'Протокол недели', description: '7 дней все добавки приняты',       icon: 'Pill',          category: 'supplements', xp: 150 },

  // -- ROM --
  { id: 'rom_first',    name: 'Первый замер',     description: 'Сделай первый замер ROM',            icon: 'Ruler',         category: 'rom',         xp: 20 },
  { id: 'rom_90',       name: 'Прямой угол',      description: 'Достигни 90\u00B0 флексии',          icon: 'TrendUp',       category: 'rom',         xp: 250 },
  { id: 'rom_120',      name: 'Почти норма',      description: 'Достигни 120\u00B0 флексии',         icon: 'Star',          category: 'rom',         xp: 500 },

  // -- Wellness --
  { id: 'sleep_7h_week', name: 'Режим сна',       description: '7 дней спать >= 7 часов',            icon: 'Moon',          category: 'wellness',    xp: 100 },

  // -- Milestones --
  { id: 'score_80',     name: 'Идеальный день',   description: 'Recovery Score >= 80',               icon: 'Target',        category: 'milestone',   xp: 80 },
  { id: 'score_100',    name: 'Стопроцентный',    description: 'Recovery Score = 100',               icon: 'Crown',         category: 'milestone',   xp: 300 },
]

export function getAchievementById(id: string): AchievementDef | undefined {
  return achievements.find(a => a.id === id)
}
