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
  // ───── 1. Пассивное сгибание ─────
  {
    id: 'ex_passive_flexion',
    name: 'Пассивное сгибание',
    nameShort: 'Сгибание',
    type: 'passive',
    target: 'flexion',
    priority: 1,
    phases: [
      {
        name: 'Подготовка',
        description:
          'Сядьте за стол, предплечье лежит на поверхности. Расслабьте руку полностью.',
        durationSec: 10,
      },
      {
        name: 'Сгибание',
        description:
          'Здоровой рукой мягко давите на предплечье, увеличивая сгибание. Доведите до лёгкого натяжения и задержите на 5 секунд.',
        durationSec: 5,
      },
      {
        name: 'Возврат',
        description:
          'Плавно верните руку в исходное положение. Отдых 3 секунды перед следующим повторением.',
        durationSec: 3,
      },
    ],
    reps: 10,
    sets: 3,
    sessionsPerDay: 3,
    restBetweenRepsSec: 3,
    restBetweenSetsSec: 60,
    painRule:
      'Допустима лёгкая тянущая боль (до 3/10). При острой боли — немедленно остановиться.',
    goodFeeling:
      'Ощущение мягкого растяжения в передней части локтя, постепенное увеличение амплитуды.',
    badFeeling:
      'Острая или стреляющая боль, онемение пальцев, щелчки в суставе.',
    availablePhases: [2, 3, 4, 5],
  },

  // ───── 2. Гравитационное сгибание ─────
  {
    id: 'ex_gravity_flexion',
    name: 'Гравитационное сгибание',
    nameShort: 'Гравитация',
    type: 'passive_gravity',
    target: 'flexion',
    priority: 1,
    phases: [
      {
        name: 'Подготовка',
        description:
          'Сядьте на стул, плечо прижато к телу. Предплечье свисает вниз под действием силы тяжести.',
        durationSec: 10,
      },
      {
        name: 'Удержание',
        description:
          'Позвольте гравитации мягко сгибать руку. Расслабьте мышцы полностью. Удерживайте позицию 5 минут.',
        durationSec: 300,
      },
      {
        name: 'Отдых',
        description:
          'Аккуратно выпрямите руку, положите на колено. Отдохните 1 минуту.',
        durationSec: 60,
      },
    ],
    holdDurationSec: 300,
    targetDurationSec: 600,
    sessionsPerDay: 4,
    painRule:
      'Тяжесть и тянущее ощущение нормальны. При боли выше 2/10 — уменьшить время удержания.',
    goodFeeling:
      'Приятная тяжесть в предплечье, постепенное проваливание руки глубже в сгибание.',
    badFeeling: 'Пульсирующая боль, отёк после упражнения, спазм мышц.',
    availablePhases: [2, 3, 4, 5],
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
        name: 'Подготовка',
        description:
          'Встаньте лицом к стене на расстоянии вытянутой руки. Положите ладонь на стену на уровне плеча.',
        durationSec: 10,
      },
      {
        name: 'Скольжение вверх',
        description:
          'Медленно скользите ладонью вверх по стене, сгибая локоть. Шагните ближе к стене для увеличения амплитуды. Задержитесь на 5 секунд в верхней точке.',
        durationSec: 5,
      },
      {
        name: 'Возврат',
        description:
          'Плавно скользите ладонью вниз, возвращаясь в исходное положение.',
        durationSec: 5,
      },
    ],
    reps: 10,
    sets: 1,
    sessionsPerDay: 3,
    restBetweenRepsSec: 5,
    painRule:
      'Лёгкое натяжение допустимо (до 3/10). Стена поддерживает вес руки — используйте это.',
    goodFeeling:
      'Плавное скольжение, ощущение работы мышц без перегрузки сустава.',
    badFeeling: 'Заклинивание в суставе, невозможность контролировать движение.',
    availablePhases: [2, 3, 4, 5],
  },

  // ───── 4. Полотенце ─────
  {
    id: 'ex_towel_assist',
    name: 'Ассистированное сгибание полотенцем',
    nameShort: 'Полотенце',
    type: 'active_assisted',
    target: 'flexion',
    priority: 2,
    phases: [
      {
        name: 'Подготовка',
        description:
          'Перекиньте полотенце через шею. Оба конца держите больной рукой, создавая петлю.',
        durationSec: 10,
      },
      {
        name: 'Подтягивание',
        description:
          'Здоровой рукой тяните конец полотенца, помогая больной руке согнуться. Задержите на 5 секунд в точке максимального комфортного сгибания.',
        durationSec: 5,
      },
      {
        name: 'Возврат',
        description:
          'Медленно ослабьте натяжение, позвольте руке выпрямиться.',
        durationSec: 5,
      },
    ],
    reps: 10,
    sets: 1,
    sessionsPerDay: 3,
    restBetweenRepsSec: 5,
    painRule:
      'Полотенце позволяет дозировать усилие. Тяните мягко, без рывков. Боль до 3/10.',
    goodFeeling:
      'Контролируемое, плавное увеличение амплитуды сгибания с каждым повторением.',
    badFeeling:
      'Рывки, невозможность контролировать скорость, острая боль в локте.',
    availablePhases: [2, 3, 4, 5],
  },

  // ───── 5. Стол + книжки ─────
  {
    id: 'ex_table_books',
    name: 'Статическое разгибание (стол + книжки)',
    nameShort: 'Книжки',
    type: 'static_progressive',
    target: 'extension',
    priority: 2,
    phases: [
      {
        name: 'Подготовка',
        description:
          'Положите руку на стол ладонью вверх. Подложите стопку книг под запястье, чтобы локоть слегка провисал.',
        durationSec: 15,
      },
      {
        name: 'Удержание',
        description:
          'Расслабьте руку и позвольте гравитации разгибать локоть. Удерживайте 5 минут. При привыкании добавьте ещё одну книгу.',
        durationSec: 300,
      },
      {
        name: 'Отдых',
        description:
          'Снимите руку со стола, мягко согните и разогните несколько раз.',
        durationSec: 30,
      },
    ],
    holdDurationSec: 300,
    targetDurationSec: 600,
    sessionsPerDay: 4,
    painRule:
      'Допустимо тянущее ощущение в задней части локтя (до 2/10). Нарастающая боль = уменьшить высоту книг.',
    goodFeeling:
      'Постепенное расслабление мышц, локоть «проваливается» в разгибание.',
    badFeeling:
      'Жжение в области шва/пластины, покалывание в пальцах, спазм трицепса.',
    availablePhases: [2, 3, 4, 5],
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
