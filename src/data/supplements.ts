// ──────────────────────────────────────────────
// supplements.ts — Нутрицевтический протокол
// восстановления после ORIF локтевого сустава
// ──────────────────────────────────────────────

export interface Supplement {
  id: string
  name: string
  dose: string
  timing: string
  slot: 'fasting' | 'breakfast' | 'lunch' | 'dinner' | 'bedtime'
  priority: 1 | 2 | 3
  category: 'mineral' | 'vitamin' | 'protein' | 'fatty_acid' | 'compound'
  reason: string
  roleDetailed: string
  form?: string
  note?: string
  interactions?: string[]
  testMarker?: string
  targetLevel?: string
  idealTimeFrom?: string   // e.g. "06:00"
  idealTimeTo?: string     // e.g. "07:30"
  idealNote?: string       // e.g. "За 30 мин до завтрака"
}

export const supplements: Supplement[] = [
  // ───── Натощак (06:30) ─────
  {
    id: 'sup_collagen',
    name: 'Коллаген',
    dose: '10–15 г',
    timing: '06:30 натощак',
    slot: 'fasting',
    priority: 1,
    category: 'protein',
    reason:
      'Основной строительный белок соединительной ткани. Приём натощак повышает биодоступность для связок и хряща.',
    roleDetailed:
      'Кость на 30% состоит из коллагена I типа. Гидролизат содержит пептиды пролина и глицина — строительные блоки. Принимать с витамином C (кофактор гидроксилирования).',
    form: 'Гидролизат коллагена I и III типа (порошок)',
    note: 'Принимать за 30–60 минут до еды. Обязательно вместе с витамином C для синтеза.',
    interactions: ['Принимать за 30-60 мин до еды', 'Обязательно с витамином C'],
    idealTimeFrom: '06:00',
    idealTimeTo: '07:00',
    idealNote: 'Натощак, за 30–60 мин до еды',
  },
  {
    id: 'sup_vitc_fasting',
    name: 'Витамин C',
    dose: '500 мг',
    timing: '06:30 натощак',
    slot: 'fasting',
    priority: 1,
    category: 'vitamin',
    reason:
      'Кофактор синтеза коллагена. Без витамина C коллаген не встраивается в ткани.',
    roleDetailed:
      'Без витамина C невозможно гидроксилирование пролина и лизина — ключевой этап формирования зрелого коллагена.',
    form: 'Аскорбат кальция или Ester-C',
    note: 'Принимать одновременно с коллагеном.',
    interactions: ['Принимать вместе с коллагеном'],
    idealTimeFrom: '06:00',
    idealTimeTo: '07:00',
    idealNote: 'Натощак, за 30–60 мин до еды',
  },

  // ───── Завтрак (07:30) ─────
  {
    id: 'sup_d3',
    name: 'Витамин D3',
    dose: '4000–5000 МЕ',
    timing: '07:30 с завтраком',
    slot: 'breakfast',
    priority: 1,
    category: 'vitamin',
    reason:
      'Регулирует усвоение кальция и фосфора. Критичен для минерализации костной мозоли после перелома.',
    roleDetailed:
      'Активирует абсорбцию кальция в кишечнике, стимулирует остеобласты, регулирует ПТГ. Московская зима = дефицит >80% населения.',
    form: 'Холекальциферол в масляной форме (капли или капсулы)',
    note: 'Принимать с жирной пищей для лучшего усвоения. Контроль уровня 25(OH)D каждые 3 месяца.',
    interactions: ['С жирной пищей', 'Синергия с K2'],
    testMarker: '25-OH Vitamin D',
    targetLevel: '40-60 нг/мл',
    idealTimeFrom: '07:30',
    idealTimeTo: '08:30',
    idealNote: 'Во время или сразу после завтрака',
  },
  {
    id: 'sup_k2',
    name: 'Витамин K2 (MK-7)',
    dose: '100–200 мкг',
    timing: '07:30 с завтраком',
    slot: 'breakfast',
    priority: 1,
    category: 'vitamin',
    reason:
      'Направляет кальций в кости, предотвращая отложение в сосудах. Синергия с D3.',
    roleDetailed:
      'Без K2 кальций может откладываться в сосудах вместо костей. Активирует остеокальцин.',
    form: 'Менахинон-7 (MK-7)',
    note: 'Обязательный компаньон D3. При приёме антикоагулянтов — согласовать с врачом.',
    interactions: ['С витамином D3 и жирной пищей'],
    idealTimeFrom: '07:30',
    idealTimeTo: '08:30',
    idealNote: 'Во время или сразу после завтрака',
  },
  {
    id: 'sup_omega3_am',
    name: 'Омега-3',
    dose: '1–1.5 г (EPA+DHA)',
    timing: '07:30 с завтраком',
    slot: 'breakfast',
    priority: 1,
    category: 'fatty_acid',
    reason:
      'Противовоспалительное действие. Уменьшает послеоперационный отёк и боль.',
    roleDetailed:
      'Снижает продукцию провоспалительных цитокинов, которые замедляют костное сращение. EPA конвертируется в резолвины.',
    form: 'Рыбий жир в триглицеридной форме (капсулы)',
    note: 'Важно содержание EPA >= 600 мг и DHA >= 400 мг на порцию.',
    interactions: ['С жирной пищей', 'Вторая доза в обед'],
    idealTimeFrom: '07:30',
    idealTimeTo: '08:30',
    idealNote: 'Во время или сразу после завтрака',
  },
  {
    id: 'sup_calcium_am',
    name: 'Кальций',
    dose: '500 мг',
    timing: '07:30 с завтраком',
    slot: 'breakfast',
    priority: 1,
    category: 'mineral',
    reason:
      'Основной минерал костной ткани. Разделённый приём (2 x 500 мг) повышает усвоение.',
    roleDetailed:
      'Основной минерал кости (гидроксиапатит). Не более 500 мг за раз — абсорбция падает. Цитрат лучше карбоната.',
    form: 'Цитрат кальция (лучше усваивается, чем карбонат)',
    note: 'Не принимать одновременно с железом или цинком — конкурируют за транспорт.',
    interactions: ['НЕ с Остеогеноном (разнести на 2 часа)', 'НЕ с цинком'],
    testMarker: 'Кальций ионизированный',
    targetLevel: '1.12-1.32 ммоль/л',
    idealTimeFrom: '07:30',
    idealTimeTo: '08:30',
    idealNote: 'Во время или сразу после завтрака',
  },
  {
    id: 'sup_osteogenon_am',
    name: 'Остеогенон',
    dose: '1 таблетка (830 мг)',
    timing: '07:30 с завтраком',
    slot: 'breakfast',
    priority: 2,
    category: 'compound',
    reason:
      'Оссеин-гидроксиапатитный комплекс. Содержит органическую и минеральную фракции кости, стимулирует остеобласты.',
    roleDetailed:
      'Содержит органический (оссеин) и минеральный (гидроксиапатит) компоненты кости.',
    form: 'Таблетки',
    note: 'Назначение врача. Курс обычно 3–6 месяцев.',
    interactions: ['Разнести с чистым кальцием на 2 часа'],
    idealTimeFrom: '07:30',
    idealTimeTo: '08:30',
    idealNote: 'Во время или сразу после завтрака',
  },
  {
    id: 'sup_b6',
    name: 'Витамин B6',
    dose: '25 мг',
    timing: '07:30 с завтраком',
    slot: 'breakfast',
    priority: 2,
    category: 'vitamin',
    reason:
      'Участвует в синтезе коллагена и метаболизме аминокислот. Поддерживает нервную проводимость (важно при послеоперационном онемении).',
    roleDetailed:
      'Участвует в трансаминировании аминокислот, необходимых для коллагена. Поддерживает иммунную функцию.',
    form: 'Пиридоксин гидрохлорид или P-5-P (активная форма)',
    interactions: [],
    idealTimeFrom: '07:30',
    idealTimeTo: '08:30',
    idealNote: 'Во время или сразу после завтрака',
  },
  {
    id: 'sup_boron',
    name: 'Бор',
    dose: '3 мг',
    timing: '07:30 с завтраком',
    slot: 'breakfast',
    priority: 3,
    category: 'mineral',
    reason:
      'Микроэлемент, улучшающий метаболизм кальция, магния и витамина D. Поддерживает плотность костной ткани.',
    roleDetailed:
      'Усиливает действие витамина D, улучшает утилизацию кальция и магния, поддерживает уровень свободного тестостерона.',
    form: 'Борат натрия или борглюконат кальция',
    interactions: [],
    idealTimeFrom: '07:30',
    idealTimeTo: '08:30',
    idealNote: 'Во время или сразу после завтрака',
  },

  // ───── Обед (13:00) ─────
  {
    id: 'sup_calcium_pm',
    name: 'Кальций',
    dose: '500 мг',
    timing: '13:00 с обедом',
    slot: 'lunch',
    priority: 1,
    category: 'mineral',
    reason:
      'Вторая порция кальция. Разделение на 2 приёма обеспечивает равномерное усвоение в течение дня.',
    roleDetailed:
      'Разделение дозы на 2 приёма повышает общую абсорбцию.',
    form: 'Цитрат кальция',
    interactions: ['С едой'],
    idealTimeFrom: '12:00',
    idealTimeTo: '13:30',
    idealNote: 'Во время обеда',
  },
  {
    id: 'sup_vitc_lunch',
    name: 'Витамин C',
    dose: '500 мг',
    timing: '13:00 с обедом',
    slot: 'lunch',
    priority: 2,
    category: 'vitamin',
    reason:
      'Вторая порция для поддержания постоянного уровня (витамин C водорастворим, быстро выводится).',
    roleDetailed:
      'Витамин C водорастворимый — выводится за 4-6 часов. Разделение на 2 приёма поддерживает постоянный уровень.',
    form: 'Аскорбат кальция или Ester-C',
    interactions: [],
    idealTimeFrom: '12:00',
    idealTimeTo: '13:30',
    idealNote: 'Во время обеда',
  },
  {
    id: 'sup_omega3_pm',
    name: 'Омега-3',
    dose: '1–1.5 г (EPA+DHA)',
    timing: '13:00 с обедом',
    slot: 'lunch',
    priority: 2,
    category: 'fatty_acid',
    reason:
      'Вторая порция для поддержания противовоспалительного фона в течение дня.',
    roleDetailed:
      'Разделение на 2 приёма для лучшей абсорбции и постоянного противовоспалительного эффекта.',
    form: 'Рыбий жир в триглицеридной форме (капсулы)',
    interactions: ['С едой'],
    idealTimeFrom: '12:00',
    idealTimeTo: '13:30',
    idealNote: 'Во время обеда',
  },

  // ───── Ужин (19:00) ─────
  {
    id: 'sup_zinc',
    name: 'Цинк',
    dose: '25–30 мг',
    timing: '19:00 с ужином',
    slot: 'dinner',
    priority: 2,
    category: 'mineral',
    reason:
      'Критичен для заживления ран и синтеза коллагена. Участвует в работе 300+ ферментов.',
    roleDetailed:
      'Кофактор синтеза тестостерона. Кофактор щелочной фосфатазы (фермент минерализации). НЕ натощак (тошнота).',
    form: 'Цинк бисглицинат (хелатная форма, минимум побочек для ЖКТ)',
    note: 'Принимать отдельно от кальция (разнесены по времени — утро и вечер).',
    interactions: ['НЕ натощак', 'НЕ одновременно с кальцием', 'При дозе >30 мг — добавить медь'],
    testMarker: 'Цинк сыворотки',
    targetLevel: '11-23 мкмоль/л',
    idealTimeFrom: '18:00',
    idealTimeTo: '20:00',
    idealNote: 'Во время ужина',
  },
  {
    id: 'sup_osteogenon_pm',
    name: 'Остеогенон',
    dose: '1 таблетка (830 мг)',
    timing: '19:00 с ужином',
    slot: 'dinner',
    priority: 2,
    category: 'compound',
    reason:
      'Вторая порция оссеин-гидроксиапатитного комплекса для поддержания остеогенеза.',
    roleDetailed:
      'Вечерний приём обеспечивает субстрат для ночной костной репарации.',
    form: 'Таблетки',
    interactions: [],
    idealTimeFrom: '18:00',
    idealTimeTo: '20:00',
    idealNote: 'Во время ужина',
  },
  {
    id: 'sup_silicon',
    name: 'Кремний',
    dose: '5–10 мг',
    timing: '19:00 с ужином',
    slot: 'dinner',
    priority: 3,
    category: 'mineral',
    reason:
      'Участвует в формировании коллагенового матрикса кости. Улучшает прочность соединительной ткани.',
    roleDetailed:
      'Стимулирует синтез коллагена I типа, участвует в cross-linking коллагеновых волокон.',
    form: 'Ортокремниевая кислота (жидкая форма) или холин-стабилизированная',
    interactions: [],
    idealTimeFrom: '18:00',
    idealTimeTo: '20:00',
    idealNote: 'Во время ужина',
  },

  // ───── Перед сном (22:00) ─────
  {
    id: 'sup_magnesium',
    name: 'Магний',
    dose: '300–400 мг',
    timing: '22:00 перед сном',
    slot: 'bedtime',
    priority: 1,
    category: 'mineral',
    reason:
      'Расслабляет мышцы (антиспазматический эффект), улучшает сон, участвует в минерализации кости. Приём на ночь оптимален.',
    roleDetailed:
      'Расслабляет мускулатуру. Кофактор >300 ферментов. Участвует в минерализации кости. Улучшает качество сна → больше ГР.',
    form: 'Магний бисглицинат или магний L-треонат',
    note: 'Бисглицинат — для мышц и сна. L-треонат — дополнительно для нервной системы. Не совмещать с кальцием.',
    interactions: ['Перед сном', 'Синергия со сном и ГР'],
    testMarker: 'Магний сыворотки',
    targetLevel: '0.66-1.07 ммоль/л',
    idealTimeFrom: '21:00',
    idealTimeTo: '22:30',
    idealNote: 'За 30 мин до сна',
  },
]

export type SupplementSlot = Supplement['slot']

export const slotSchedule: Record<SupplementSlot, string> = {
  fasting: '06:30',
  breakfast: '07:30',
  lunch: '13:00',
  dinner: '19:00',
  bedtime: '22:00',
}

export const slotLabels: Record<SupplementSlot, string> = {
  fasting: 'Натощак',
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  bedtime: 'Перед сном',
}

export function getSupplementsBySlot(slot: SupplementSlot): Supplement[] {
  return supplements.filter((s) => s.slot === slot)
}

export function getSupplementsByPriority(priority: 1 | 2 | 3): Supplement[] {
  return supplements.filter((s) => s.priority === priority)
}
