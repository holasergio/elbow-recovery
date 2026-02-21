// ──────────────────────────────────────────────
// schedule.ts — 5 ежедневных сессий реабилитации
// ──────────────────────────────────────────────

export interface SessionStep {
  exerciseId?: string
  label: string
  durationMin?: number
  sets?: number
  reps?: number
  note?: string
}

export interface DailySession {
  id: number
  time: string
  type: 'full' | 'short' | 'light'
  name: string
  durationMin: number
  steps: SessionStep[]
}

export const dailySessions: DailySession[] = [
  // ───── Сессия 1: Утренняя полная (07:00) ─────
  {
    id: 1,
    time: '07:00',
    type: 'full',
    name: 'Утренняя полная',
    durationMin: 40,
    steps: [
      {
        label: 'Тёплый компресс',
        durationMin: 5,
        note: 'Тёплое полотенце или грелка на локоть. Разогрев тканей перед упражнениями.',
      },
      {
        exerciseId: 'ex_passive_flexion',
        label: 'Пассивное сгибание',
        sets: 3,
        reps: 10,
        durationMin: 8,
      },
      {
        exerciseId: 'ex_gravity_flexion',
        label: 'Гравитационное сгибание',
        durationMin: 10,
        note: 'Удержание 5–10 минут',
      },
      {
        exerciseId: 'ex_wall_slide',
        label: 'Скольжение по стене',
        sets: 1,
        reps: 10,
        durationMin: 5,
      },
      {
        exerciseId: 'ex_rotation',
        label: 'Пронация/Супинация',
        sets: 2,
        reps: 15,
        durationMin: 5,
      },
      {
        exerciseId: 'ex_gravity_extension',
        label: 'Маятник (свободное свисание)',
        durationMin: 3,
        note: 'Расслабленное свисание руки, лёгкие покачивания',
      },
      {
        label: 'Холодный компресс',
        durationMin: 4,
        note: 'Лёд через полотенце на локоть. Уменьшение отёка после нагрузки.',
      },
    ],
  },

  // ───── Сессия 2: Дневная короткая (12:00) ─────
  {
    id: 2,
    time: '12:00',
    type: 'short',
    name: 'Дневная короткая',
    durationMin: 15,
    steps: [
      {
        exerciseId: 'ex_wall_slide',
        label: 'Скольжение по стене',
        sets: 1,
        reps: 10,
        durationMin: 5,
      },
      {
        exerciseId: 'ex_passive_flexion',
        label: 'Пассивное сгибание',
        sets: 2,
        reps: 10,
        durationMin: 6,
      },
      {
        exerciseId: 'ex_gravity_extension',
        label: 'Маятник (свободное свисание)',
        durationMin: 4,
        note: 'Расслабленное свисание, покачивания',
      },
    ],
  },

  // ───── Сессия 3: Дневная полная (15:00) ─────
  {
    id: 3,
    time: '15:00',
    type: 'full',
    name: 'Дневная полная',
    durationMin: 40,
    steps: [
      {
        label: 'Тёплый компресс',
        durationMin: 5,
        note: 'Тёплое полотенце или грелка на локоть.',
      },
      {
        exerciseId: 'ex_passive_flexion',
        label: 'Пассивное сгибание',
        sets: 3,
        reps: 10,
        durationMin: 8,
      },
      {
        exerciseId: 'ex_gravity_flexion',
        label: 'Гравитационное сгибание',
        durationMin: 10,
        note: 'Удержание 5–10 минут',
      },
      {
        exerciseId: 'ex_towel_assist',
        label: 'Ассистированное сгибание полотенцем',
        sets: 1,
        reps: 10,
        durationMin: 4,
      },
      {
        exerciseId: 'ex_table_books',
        label: 'Статическое разгибание (книжки)',
        durationMin: 5,
        note: 'Удержание 5 минут с книжками под запястьем',
      },
      {
        exerciseId: 'ex_wrist_rehab',
        label: 'Разработка запястья',
        durationMin: 4,
        note: 'Все 5 движений по 10 повторений',
      },
      {
        label: 'Холодный компресс',
        durationMin: 4,
        note: 'Лёд через полотенце на локоть.',
      },
    ],
  },

  // ───── Сессия 4: Вечерняя короткая (18:00) ─────
  {
    id: 4,
    time: '18:00',
    type: 'short',
    name: 'Вечерняя короткая',
    durationMin: 15,
    steps: [
      {
        exerciseId: 'ex_gravity_flexion',
        label: 'Гравитационное сгибание',
        durationMin: 8,
        note: 'Удержание 5–8 минут',
      },
      {
        exerciseId: 'ex_table_books',
        label: 'Статическое разгибание (книжки)',
        durationMin: 7,
        note: 'Удержание 5–7 минут',
      },
    ],
  },

  // ───── Сессия 5: Вечерняя лёгкая (21:30) ─────
  {
    id: 5,
    time: '21:30',
    type: 'light',
    name: 'Вечерняя лёгкая',
    durationMin: 20,
    steps: [
      {
        label: 'Тёплый компресс',
        durationMin: 5,
        note: 'Расслабление тканей перед сном.',
      },
      {
        exerciseId: 'ex_passive_flexion',
        label: 'Пассивное сгибание (мягко)',
        sets: 2,
        reps: 10,
        durationMin: 6,
        note: 'Работать мягче, чем в дневных сессиях. Фокус на расслаблении.',
      },
      {
        exerciseId: 'ex_gravity_extension',
        label: 'Маятник (свободное свисание)',
        durationMin: 5,
        note: 'Максимально расслабленное свисание, лёгкие покачивания перед сном.',
      },
      {
        label: 'Самомассаж предплечья',
        durationMin: 4,
        note: 'Мягкий массаж мышц предплечья для снятия напряжения за день.',
      },
    ],
  },
]

export function getSessionById(id: number): DailySession | undefined {
  return dailySessions.find((s) => s.id === id)
}

export function getFullSessions(): DailySession[] {
  return dailySessions.filter((s) => s.type === 'full')
}

export function getTotalDailyMinutes(): number {
  return dailySessions.reduce((sum, s) => sum + s.durationMin, 0)
}
