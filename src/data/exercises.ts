// ──────────────────────────────────────────────
// exercises.ts — 9 упражнений медицинского протокола
// реабилитации локтевого сустава после ORIF
// ──────────────────────────────────────────────

export interface ExercisePhase {
  name: string
  description: string
  durationSec?: number
}

export interface Exercise {
  id: string
  name: string
  nameShort: string
  type:
    | 'passive'
    | 'passive_gravity'
    | 'active_assisted'
    | 'active'
    | 'static_progressive'
    | 'functional'
  target: 'flexion' | 'extension' | 'rotation' | 'wrist' | 'hand_function'
  priority: 1 | 2 | 3
  phases: ExercisePhase[]
  reps?: number
  sets?: number
  holdDurationSec?: number
  targetDurationSec?: number
  sessionsPerDay: number
  restBetweenRepsSec?: number
  restBetweenSetsSec?: number
  painRule: string
  goodFeeling: string
  badFeeling?: string
  availablePhases: number[]
}

export const exercises: Exercise[] = [
  // ───── 1. Пассивное сгибание здоровой рукой ─────
  {
    id: 'ex_passive_flexion',
    name: 'Пассивное сгибание здоровой рукой',
    nameShort: 'Сгибание',
    type: 'passive',
    target: 'flexion',
    priority: 1,
    phases: [
      {
        name: 'A — Исходное',
        description:
          'Сидя. Локоть на бедре. Рука расслаблена, угол ~20°.',
        durationSec: 5,
      },
      {
        name: 'B — Сгибание',
        description:
          'Здоровой рукой тянете запястье к плечу до ~60°. Плавно, без рывков.',
        durationSec: 5,
      },
      {
        name: 'C — Удержание',
        description:
          'Задержка 30 сек. Если боль ушла — чуть дальше. Ещё 30 сек. Вернулись.',
        durationSec: 30,
      },
    ],
    reps: 10,
    sets: 3,
    sessionsPerDay: 3,
    holdDurationSec: 30,
    restBetweenRepsSec: 3,
    restBetweenSetsSec: 60,
    painRule:
      'Тянущее ощущение спереди локтя = капсула растягивается (хорошо). Острая боль сзади (олекранон) = СТОП, уменьшить амплитуду.',
    goodFeeling:
      'Ощущение мягкого растяжения в передней части локтя, постепенное увеличение амплитуды.',
    badFeeling:
      'Острая боль сзади локтя (олекранон), онемение пальцев, щелчки в суставе.',
    availablePhases: [1, 2, 3, 4, 5],
  },

  // ───── 2. Гравитационное сгибание ЛЁЖА ─────
  {
    id: 'ex_gravity_flexion',
    name: 'Гравитационное сгибание лёжа',
    nameShort: 'Гравитация лёжа',
    type: 'passive_gravity',
    target: 'flexion',
    priority: 1,
    phases: [
      {
        name: 'A — Плечо вертикально',
        description:
          'Лёжа на спине. Плечо вертикально, локоть в потолок.',
        durationSec: 10,
      },
      {
        name: 'B — Предплечье свисает',
        description:
          'Предплечье свисает за голову. Сила тяжести мягко сгибает локоть. Мышцы полностью расслаблены.',
        durationSec: 300,
      },
      {
        name: 'C — С утяжелением',
        description:
          'Можно добавить 0.5 кг в кисть для усиления растяжения.',
        durationSec: 300,
      },
    ],
    holdDurationSec: 600,
    targetDurationSec: 600,
    sessionsPerDay: 4,
    painRule:
      'Мышцы расслаблены, артрогенный рефлекс минимален — идеальное растяжение. Если немеют пальцы — сменить положение плеча.',
    goodFeeling:
      'Приятная тяжесть в предплечье, постепенное проваливание руки глубже в сгибание.',
    badFeeling: 'Онемение пальцев, пульсирующая боль, спазм мышц.',
    availablePhases: [1, 2, 3, 4, 5],
  },

  // ───── 3. Скольжение по стене ─────
  {
    id: 'ex_wall_slide',
    name: 'Скольжение по стене',
    nameShort: 'Стена',
    type: 'active_assisted',
    target: 'flexion',
    priority: 2,
    phases: [
      {
        name: 'A — Ладонь на стене',
        description:
          'Стоя лицом к стене. Ладонь на стене на уровне лица.',
        durationSec: 5,
      },
      {
        name: 'B — Скольжение вниз',
        description:
          'Пальцы скользят вниз, корпус приближается к стене. Локоть сгибается.',
        durationSec: 10,
      },
      {
        name: 'C — Удержание',
        description:
          'Удержание в максимальной точке 15-20 сек.',
        durationSec: 20,
      },
    ],
    reps: 10,
    sets: 1,
    sessionsPerDay: 3,
    holdDurationSec: 20,
    restBetweenRepsSec: 5,
    painRule:
      'Лёгкое натяжение допустимо (до 3/10). Стена поддерживает вес руки — используйте это.',
    goodFeeling:
      'Плавное скольжение, ощущение работы мышц без перегрузки сустава.',
    badFeeling: 'Заклинивание в суставе, невозможность контролировать движение.',
    availablePhases: [1, 2, 3, 4, 5],
  },

  // ───── 4. Самопомощь с полотенцем ─────
  {
    id: 'ex_towel_assist',
    name: 'Самопомощь с полотенцем',
    nameShort: 'Полотенце',
    type: 'active_assisted',
    target: 'flexion',
    priority: 2,
    phases: [
      {
        name: 'A — Полотенце через плечо',
        description:
          'Сидя. Полотенце через плечо. Больная рука держит конец спереди.',
        durationSec: 5,
      },
      {
        name: 'B — Здоровая рука тянет',
        description:
          'Здоровая рука тянет вниз за спиной — локоть сгибается.',
        durationSec: 10,
      },
      {
        name: 'C — Удержание',
        description:
          'Удержание 15-20 сек в максимальной точке сгибания.',
        durationSec: 20,
      },
    ],
    reps: 10,
    sets: 1,
    sessionsPerDay: 3,
    holdDurationSec: 20,
    restBetweenRepsSec: 5,
    painRule:
      'Полотенце позволяет дозировать усилие. Тяните мягко, без рывков. Боль до 3/10.',
    goodFeeling:
      'Контролируемое, плавное увеличение амплитуды сгибания с каждым повторением.',
    badFeeling:
      'Рывки, невозможность контролировать скорость, острая боль в локте.',
    availablePhases: [1, 2, 3, 4, 5],
  },

  // ───── 5. Стол + книжки (прогрессивное растяжение) ─────
  {
    id: 'ex_table_books',
    name: 'Стол + книжки (прогрессивное растяжение)',
    nameShort: 'Книжки',
    type: 'static_progressive',
    target: 'flexion',
    priority: 2,
    phases: [
      {
        name: 'A — Неделя 1',
        description:
          '2 книжки ~25°. Сидя за столом, предплечье на столе, кисть на стопке книг.',
        durationSec: 300,
      },
      {
        name: 'B — Неделя 2',
        description:
          '4 книжки ~35°. Каждые 2-3 дня добавляем +1 книжку.',
        durationSec: 300,
      },
      {
        name: 'C — Неделя 3+',
        description:
          '6 книжек ~45°+. Удержание 5-10 мин. Можно при работе за ПК.',
        durationSec: 600,
      },
    ],
    holdDurationSec: 600,
    targetDurationSec: 600,
    sessionsPerDay: 4,
    painRule:
      'Допустимо тянущее ощущение (до 2/10). Нарастающая боль = уменьшить количество книг. +1 книжка каждые 2-3 дня.',
    goodFeeling:
      'Постепенное расслабление мышц, локоть «проваливается» в сгибание. Можно совмещать с работой за ПК.',
    badFeeling:
      'Жжение в области шва/пластины, покалывание в пальцах, спазм.',
    availablePhases: [1, 2, 3, 4, 5],
  },

  // ───── 6. Свободное свисание (разгибание) ─────
  {
    id: 'ex_gravity_extension',
    name: 'Свободное свисание руки (гравитационное разгибание)',
    nameShort: 'Маятник',
    type: 'passive_gravity',
    target: 'extension',
    priority: 1,
    phases: [
      {
        name: 'Свисание',
        description:
          'Стоя или сидя, опустите руку вдоль тела. Полностью расслабьте мышцы. Гравитация мягко разгибает локоть. Носите руку расслабленной в течение дня — суммарно до 6 часов.',
      },
    ],
    targetDurationSec: 21600, // 6 часов
    sessionsPerDay: 1, // в течение дня
    painRule:
      'Без боли. Это фоновое упражнение — рука просто свисает расслабленно.',
    goodFeeling:
      'Ощущение тяжести и лёгкого растяжения. Рука постепенно выпрямляется.',
    availablePhases: [1, 2, 3, 4, 5],
  },

  // ───── 7. Пронация / Супинация ─────
  {
    id: 'ex_rotation',
    name: 'Пронация и супинация предплечья',
    nameShort: 'Ротация',
    type: 'active',
    target: 'rotation',
    priority: 2,
    phases: [
      {
        name: 'Ротация',
        description:
          'Локоть прижат к телу, согнут на 90°. Поворачивайте предплечье: ладонь вверх (супинация) → ладонь вниз (пронация). Движение плавное, полная амплитуда.',
        durationSec: 3,
      },
    ],
    reps: 15,
    sets: 2,
    sessionsPerDay: 3,
    restBetweenRepsSec: 2,
    restBetweenSetsSec: 30,
    painRule:
      'Вращение должно быть безболезненным. При боли — уменьшить амплитуду, но не скорость.',
    goodFeeling:
      'Свободное вращение, увеличение амплитуды с каждым подходом.',
    badFeeling:
      'Хруст, щелчки, боль при повороте ладони вверх — сигнал остановиться.',
    availablePhases: [2, 3, 4, 5],
  },

  // ───── 8. Разработка запястья ─────
  {
    id: 'ex_wrist_rehab',
    name: 'Разработка запястья',
    nameShort: 'Запястье',
    type: 'active',
    target: 'wrist',
    priority: 2,
    phases: [
      {
        name: 'Сгибание запястья',
        description:
          'Предплечье на столе, кисть свисает. Сгибайте запястье вниз и возвращайте. 10 повторений.',
        durationSec: 30,
      },
      {
        name: 'Разгибание запястья',
        description:
          'Предплечье на столе ладонью вниз, кисть свисает. Поднимайте кисть вверх и опускайте. 10 повторений.',
        durationSec: 30,
      },
      {
        name: 'Радиальное отведение',
        description:
          'Предплечье на столе, большой палец вверх. Отводите кисть в сторону большого пальца. 10 повторений.',
        durationSec: 30,
      },
      {
        name: 'Ульнарное отведение',
        description:
          'Предплечье на столе, большой палец вверх. Отводите кисть в сторону мизинца. 10 повторений.',
        durationSec: 30,
      },
      {
        name: 'Круговые движения',
        description:
          'Вращайте кисть по кругу: 10 раз по часовой, 10 раз против часовой стрелки.',
        durationSec: 60,
      },
    ],
    reps: 10,
    sets: 1,
    sessionsPerDay: 2,
    painRule:
      'Запястье не оперировалось, но может быть скованным после иммобилизации. Работайте мягко.',
    goodFeeling:
      'Увеличение подвижности запястья, уменьшение скованности с каждым днём.',
    badFeeling:
      'Боль, отдающая в локоть — значит запястье компенсирует за локтевой сустав. Уменьшить амплитуду.',
    availablePhases: [2, 3, 4, 5],
  },

  // ───── 9. Мелкая моторика ─────
  {
    id: 'ex_fine_motor',
    name: 'Мелкая моторика кисти',
    nameShort: 'Моторика',
    type: 'functional',
    target: 'hand_function',
    priority: 3,
    phases: [
      {
        name: 'Сжатие мяча',
        description:
          'Мягкий мяч или эспандер. Сжимайте и удерживайте 3 секунды. 10 повторений.',
        durationSec: 60,
      },
      {
        name: 'Разведение пальцев',
        description:
          'Наденьте резинку на пальцы. Разводите пальцы, преодолевая сопротивление. 10 повторений.',
        durationSec: 40,
      },
      {
        name: 'Касание пальцев',
        description:
          'Поочерёдно касайтесь большим пальцем каждого пальца руки. 3 круга.',
        durationSec: 30,
      },
      {
        name: 'Перебирание предметов',
        description:
          'Перебирайте мелкие предметы (монеты, пуговицы, бусины) больной рукой.',
        durationSec: 120,
      },
      {
        name: 'Письмо',
        description:
          'Пишите короткие предложения больной рукой. Фокус на контроле, не на скорости.',
        durationSec: 120,
      },
      {
        name: 'Бытовые действия',
        description:
          'Застёгивание пуговиц, завязывание шнурков, использование столовых приборов больной рукой.',
        durationSec: 180,
      },
    ],
    sessionsPerDay: 1,
    painRule:
      'Мелкая моторика не должна вызывать боль в локте. Если болит — кисть перенапрягается.',
    goodFeeling:
      'Улучшение координации, уверенность в захвате, возвращение навыков повседневной жизни.',
    badFeeling:
      'Дрожание руки, быстрая усталость кисти, боль в предплечье.',
    availablePhases: [2, 3, 4, 5],
  },
]

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((ex) => ex.id === id)
}

export function getExercisesForPhase(phase: number): Exercise[] {
  return exercises.filter((ex) => ex.availablePhases.includes(phase))
}

export function getExercisesByPriority(priority: 1 | 2 | 3): Exercise[] {
  return exercises.filter((ex) => ex.priority === priority)
}
