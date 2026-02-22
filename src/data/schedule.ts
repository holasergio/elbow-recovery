// ──────────────────────────────────────────────
// schedule.ts — 5 ежедневных сессий реабилитации
// Протокол PDF: Phase 1-2 (~7 недель после ORIF)
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

/** Протокол тепла: ПЕРЕД сессией */
export const warmProtocol =
  '10-15 мин теплое полотенце или ванночка 37-38\u00B0C. Капсула эластичнее на 15-20%.'

/** Протокол холода: ПОСЛЕ сессии */
export const coldProtocol =
  '10 мин лёд через полотенце. Снимает воспаление от растяжения.'

export const dailySessions: DailySession[] = [
  // ───── Сессия 1: Утренняя полная (07:00) ─────
  // Тепло → Упр.1 → Упр.2 → Упр.3 → Холод
  {
    id: 1,
    time: '07:00',
    type: 'full',
    name: 'Утренняя полная',
    durationMin: 40,
    steps: [
      {
        label: 'Тёплый компресс',
        durationMin: 12,
        note: warmProtocol,
      },
      {
        exerciseId: 'ex_passive_flexion',
        label: 'Упр.1 — Пассивное сгибание здоровой рукой',
        sets: 3,
        reps: 10,
        durationMin: 8,
      },
      {
        exerciseId: 'ex_gravity_flexion',
        label: 'Упр.2 — Гравитационное сгибание лёжа',
        durationMin: 10,
        note: 'Лёжа на спине, локоть в потолок, предплечье свисает за голову. 5-10 мин.',
      },
      {
        exerciseId: 'ex_wall_slide',
        label: 'Упр.3 — Скольжение по стене',
        sets: 1,
        reps: 10,
        durationMin: 5,
      },
      {
        label: 'Холодный компресс',
        durationMin: 10,
        note: coldProtocol,
      },
    ],
  },

  // ───── Сессия 2: Дневная короткая (12:00) ─────
  // Упр.3 (стена) + Упр.1 (2 подхода)
  {
    id: 2,
    time: '12:00',
    type: 'short',
    name: 'Дневная короткая',
    durationMin: 15,
    steps: [
      {
        exerciseId: 'ex_wall_slide',
        label: 'Упр.3 — Скольжение по стене',
        sets: 1,
        reps: 10,
        durationMin: 5,
      },
      {
        exerciseId: 'ex_passive_flexion',
        label: 'Упр.1 — Пассивное сгибание (2 подхода)',
        sets: 2,
        reps: 10,
        durationMin: 6,
      },
    ],
  },

  // ───── Сессия 3: Дневная полная (15:00) ─────
  // Тепло → Упр.1 → Упр.2 → Упр.4 → Упр.5 → Холод
  {
    id: 3,
    time: '15:00',
    type: 'full',
    name: 'Дневная полная',
    durationMin: 40,
    steps: [
      {
        label: 'Тёплый компресс',
        durationMin: 12,
        note: warmProtocol,
      },
      {
        exerciseId: 'ex_passive_flexion',
        label: 'Упр.1 — Пассивное сгибание здоровой рукой',
        sets: 3,
        reps: 10,
        durationMin: 8,
      },
      {
        exerciseId: 'ex_gravity_flexion',
        label: 'Упр.2 — Гравитационное сгибание лёжа',
        durationMin: 10,
        note: 'Лёжа на спине, локоть в потолок, предплечье свисает за голову. 5-10 мин.',
      },
      {
        exerciseId: 'ex_towel_assist',
        label: 'Упр.4 — Самопомощь с полотенцем',
        sets: 1,
        reps: 10,
        durationMin: 4,
      },
      {
        exerciseId: 'ex_table_books',
        label: 'Упр.5 — Стол + книжки',
        durationMin: 5,
        note: 'Удержание 5-10 мин. +1 книжка каждые 2-3 дня.',
      },
      {
        label: 'Холодный компресс',
        durationMin: 10,
        note: coldProtocol,
      },
    ],
  },

  // ───── Сессия 4: Вечерняя короткая (18:00) ─────
  // ТОЛЬКО Упр.2 (гравитация лёжа) 10 мин
  {
    id: 4,
    time: '18:00',
    type: 'short',
    name: 'Вечерняя короткая',
    durationMin: 15,
    steps: [
      {
        exerciseId: 'ex_gravity_flexion',
        label: 'Упр.2 — Гравитационное сгибание лёжа',
        durationMin: 10,
        note: 'Лёжа на спине, локоть в потолок, предплечье свисает за голову. 10 мин.',
      },
    ],
  },

  // ───── Сессия 5: Вечерняя мягкая (21:30) ─────
  // Тепло → Упр.1 мягко → Сон до 23:00!
  {
    id: 5,
    time: '21:30',
    type: 'light',
    name: 'Вечерняя мягкая',
    durationMin: 30,
    steps: [
      {
        label: 'Тёплый компресс',
        durationMin: 12,
        note: warmProtocol,
      },
      {
        exerciseId: 'ex_passive_flexion',
        label: 'Упр.1 — Пассивное сгибание (мягко)',
        sets: 2,
        reps: 10,
        durationMin: 6,
        note: 'Работать мягче, чем в дневных сессиях. Сон до 23:00!',
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
