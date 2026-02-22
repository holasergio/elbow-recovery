# Elbow Recovery — Техническая документация проекта

> **PWA-приложение для реабилитации локтевого сустава после ORIF**
> Версия: 1.0.0-beta | Платформа: Web (PWA) | Язык интерфейса: русский

---

## Оглавление

1. [Обзор проекта](#1-обзор-проекта)
2. [Технологический стек](#2-технологический-стек)
3. [Архитектура приложения](#3-архитектура-приложения)
4. [Структура файлов](#4-структура-файлов)
5. [Маршрутизация (App Router)](#5-маршрутизация-app-router)
6. [База данных (IndexedDB / Dexie.js)](#6-база-данных-indexeddb--dexiejs)
7. [Дизайн-система](#7-дизайн-система)
8. [Функциональные модули](#8-функциональные-модули)
9. [PWA-инфраструктура](#9-pwa-инфраструктура)
10. [AI-модуль (MediaPipe)](#10-ai-модуль-mediapipe)
11. [Предметная область](#11-предметная-область)
12. [История версий](#12-история-версий)
13. [Деплой и CI/CD](#13-деплой-и-cicd)
14. [Запуск и разработка](#14-запуск-и-разработка)

---

## 1. Обзор проекта

**Elbow Recovery** — мобильное PWA-приложение для пациента, проходящего реабилитацию после операции ORIF (Open Reduction Internal Fixation) на правом локтевом суставе.

### Ключевые характеристики

| Параметр | Значение |
|---|---|
| Тип | Progressive Web App (standalone) |
| Целевая платформа | iOS Safari / Android Chrome (мобильные) |
| Пользователь | Один пациент (Серж, 33 года) |
| Дата операции | 5 января 2026 |
| Протокол | 5 фаз реабилитации, 78 недель |
| Хранение данных | Локально (IndexedDB), без сервера |
| Язык интерфейса | Русский |

### Что делает приложение

- **Ведёт пациента через 5 ежедневных сессий** с пошаговым таймером, аудио-сигналами и блокировкой экрана
- **Отслеживает ROM** (Range of Motion) — с ручным вводом и AI-замером через камеру
- **Ведёт дневник боли** с распознаванием красных флагов (ульнарный нерв, крепитация, ночная боль)
- **Контролирует приём 16 нутрицевтиков** по 5 слотам в день
- **Мониторит сон** с визуализацией гормонального цикла
- **Показывает прогресс** на графиках с 3 сценариями восстановления
- **Работает офлайн** — все данные хранятся на устройстве

---

## 2. Технологический стек

### Runtime & Framework

| Технология | Версия | Назначение |
|---|---|---|
| Next.js | 16.1.6 | App Router, SSR, маршрутизация |
| React | 19.2.3 | UI-библиотека |
| TypeScript | ^5 | Типизация |
| Tailwind CSS | v4 | CSS-native design tokens (`@theme`) |

### Управление данными

| Технология | Версия | Назначение |
|---|---|---|
| Dexie.js | ^4.3.0 | IndexedDB ORM, 7 таблиц |
| dexie-react-hooks | ^4.2.0 | Реактивные live-запросы (`useLiveQuery`) |
| Zustand | ^5.0.11 | Глобальное состояние (тема, настройки) |
| idb-keyval | ^6.2.2 | Простое key-value хранилище |

### UI & Визуализация

| Технология | Версия | Назначение |
|---|---|---|
| Phosphor Icons | ^2.1.10 | Иконки (duotone weight) |
| Recharts | ^3.7.0 | График ROM-прогресса |
| Fraunces + DM Sans | Google Fonts | Шрифты (display + body) |

### AI & Media

| Технология | Версия | Назначение |
|---|---|---|
| @mediapipe/tasks-vision | ^0.10.32 | Pose detection (WASM + GPU) |

### Инфраструктура

| Технология | Назначение |
|---|---|
| Vercel | Хостинг и деплой |
| Service Worker (custom) | Кеширование, офлайн, push-нотификации |
| GitHub Actions | CI/CD pipeline |

---

## 3. Архитектура приложения

### Принципы

- **Offline-first** — все данные в IndexedDB, сервер не требуется
- **Client-side only** — нет бэкенда, нет API, нет базы на сервере
- **Inline styles** — компоненты используют `style={{}}` с CSS-переменными, не Tailwind-классы
- **Реактивные запросы** — `useLiveQuery` автоматически обновляет UI при изменении данных
- **Lazy-loading AI** — MediaPipe загружается только при запросе пользователя

### Диаграмма компонентов

```
RootLayout
├── ThemeProvider (Zustand → CSS class .dark/.light)
├── ServiceWorkerProvider (регистрация SW, обнаружение обновлений)
│   ├── StorageInit (запрос persistent storage)
│   ├── UpdatePrompt (баннер «Обновить приложение»)
│   └── AppLayout (route group)
│       ├── NotificationProvider (scheduling, toasts)
│       ├── InstallBanner (PWA install prompt)
│       ├── PullToRefresh (standalone mode)
│       ├── BottomTabs (5 вкладок)
│       └── Page Content
│           ├── Dashboard (/, DayCounter + TodayExercises + ROMBadge + SessionList)
│           ├── Exercises (/exercises, каталог + ExerciseDetail + ExerciseSVG)
│           ├── Session (/session/[id], SessionRunner с persistence)
│           ├── Progress (/progress, ROMChart + StreakCalendar + AngleMeasurer)
│           ├── Health (/health/*, PainForm + SupplementChecklist + SleepForm + Calendar)
│           └── Settings (/settings, ThemeToggle + Export/Import + NotificationSettings)
└── OnboardingFlow (/onboarding, 3 шага)
```

### Потоки данных

```
User Action → Component State → Dexie.js (IndexedDB) → useLiveQuery → UI Update
                                        ↓
                              localStorage (session persistence, 4hr TTL)
                                        ↓
                              Zustand Store (theme, notifications, onboarding)
```

---

## 4. Структура файлов

```
elbow-recovery/
├── public/
│   ├── sw.js                    # Service Worker (версионированный при build)
│   └── icons/                   # PWA-иконки (192px, 512px, maskable)
├── scripts/
│   └── stamp-sw.mjs             # Prebuild: штампует APP_VERSION в sw.js
├── src/
│   ├── app/
│   │   ├── globals.css          # Дизайн-система + Tailwind v4 @theme
│   │   ├── layout.tsx           # Root layout
│   │   ├── manifest.ts          # PWA manifest (MetadataRoute)
│   │   ├── (app)/               # Route group — основное приложение
│   │   │   ├── layout.tsx       # Notifications + InstallBanner + BottomTabs
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── exercises/       # Каталог упражнений
│   │   │   ├── session/[id]/    # Сессия (динамический маршрут)
│   │   │   ├── progress/        # Прогресс + ROM
│   │   │   ├── health/          # Боль / Добавки / Сон / Календарь
│   │   │   └── settings/        # Настройки
│   │   ├── onboarding/          # Первый запуск (3 шага)
│   │   └── offline/             # Офлайн-заглушка
│   ├── components/              # 34 компонента
│   │   ├── dashboard/           # DayCounter, ROMBadge, SessionList, TodayExercises
│   │   ├── exercises/           # ExerciseDetail, ExerciseSVG
│   │   ├── health/              # PainForm, SupplementChecklist, SleepForm, и др.
│   │   ├── layout/              # BottomTabs
│   │   ├── notifications/       # NotificationProvider, NotificationToast
│   │   ├── progress/            # ROMChart, ROMInput, ROMPhoto, AngleMeasurer, StreakCalendar
│   │   ├── session/             # SessionRunner
│   │   └── settings/            # ThemeToggle, DataExport, DataImport, и др.
│   ├── data/                    # Статические данные (5 файлов)
│   │   ├── exercises.ts         # 9 упражнений
│   │   ├── schedule.ts          # 5 ежедневных сессий
│   │   ├── patient.ts           # Данные пациента + утилиты фаз
│   │   ├── phases.ts            # 5 фаз реабилитации
│   │   └── supplements.ts       # 16 нутрицевтиков
│   ├── hooks/                   # 7 кастомных хуков
│   │   ├── use-timer.ts         # Wall-clock таймер + audio beep
│   │   ├── use-rom.ts           # История ROM-замеров
│   │   ├── use-exercise-stats.ts # Статистика выполнения
│   │   ├── use-wake-lock.ts     # Screen Wake Lock API
│   │   ├── use-notifications.ts # Планирование нотификаций
│   │   ├── use-today-data.ts    # Агрегация данных за сегодня
│   │   └── use-supplements-today.ts # Добавки сегодня
│   ├── lib/                     # 10 утилит
│   │   ├── db.ts                # Dexie.js схема (7 таблиц)
│   │   ├── export.ts            # CSV/JSON экспорт + импорт
│   │   ├── mediapipe.ts         # PoseLandmarker singleton
│   │   ├── pose-angle.ts        # 3D-вычисление угла локтя
│   │   ├── session-store.ts     # localStorage persistence (4hr TTL)
│   │   ├── red-flags.ts         # Детекция красных флагов боли
│   │   ├── rom-interpretation.ts # Arc → функциональные milestone'ы
│   │   ├── notifications.ts     # Browser Notification API
│   │   ├── storage.ts           # StorageManager API
│   │   └── fonts.ts             # next/font/google — Fraunces + DM Sans
│   ├── providers/
│   │   └── theme-provider.tsx   # CSS class dark/light
│   └── stores/
│       └── app-store.ts         # Zustand + localStorage persist
├── .github/workflows/
│   └── deploy.yml               # GitHub Actions → Vercel
├── package.json
├── tsconfig.json
└── next.config.ts
```

**Метрики:** 73 TypeScript/TSX файла, ~4500 строк кода (без node_modules).

---

## 5. Маршрутизация (App Router)

| Маршрут | Файл | Описание |
|---|---|---|
| `/` | `(app)/page.tsx` | Dashboard: день, неделя, фаза, ROM, сессии |
| `/exercises` | `(app)/exercises/page.tsx` | Каталог упражнений с фильтрацией |
| `/session/[id]` | `(app)/session/[id]/page.tsx` | Пошаговый runner сессии 1-5 |
| `/progress` | `(app)/progress/page.tsx` | ROM-график, streak-календарь |
| `/progress/rom` | `(app)/progress/rom/page.tsx` | Форма замера ROM + AI |
| `/health` | `(app)/health/page.tsx` | Hub: боль, добавки, сон, календарь |
| `/health/pain` | `(app)/health/pain/page.tsx` | Дневник боли с раскрытием заметок |
| `/health/supplements` | `(app)/health/supplements/page.tsx` | Чек-лист нутрицевтиков |
| `/health/sleep` | `(app)/health/sleep/page.tsx` | Лог сна + гормональный таймлайн |
| `/health/calendar` | `(app)/health/calendar/page.tsx` | Записи к врачу, фазовый таймлайн |
| `/settings` | `(app)/settings/page.tsx` | Тема, нотификации, экспорт/импорт |
| `/onboarding` | `onboarding/page.tsx` | 3-шаговый первый запуск |
| `/offline` | `offline/page.tsx` | Заглушка при отсутствии сети |

### Layouts

- **Root** (`app/layout.tsx`): ThemeProvider → ServiceWorkerProvider → StorageInit → UpdatePrompt
- **App** (`app/(app)/layout.tsx`): NotificationProvider → InstallBanner → PullToRefresh → BottomTabs
- **Onboarding** (`app/onboarding/layout.tsx`): минимальный, без навигации

---

## 6. База данных (IndexedDB / Dexie.js)

### Схема `RecoveryDB`

| Таблица | Primary Key | Индексы | Назначение |
|---|---|---|---|
| `exerciseSessions` | `++id` (auto) | `date`, `exerciseId`, `sessionSlot`, `[date+sessionSlot]` | Записи о выполнении упражнений |
| `romMeasurements` | `++id` (auto) | `date` | Замеры Range of Motion |
| `painEntries` | `++id` (auto) | `date` | Записи дневника боли |
| `supplementLogs` | `++id` (auto) | `date`, `supplementId`, `[date+slot]` | Приём нутрицевтиков |
| `sleepLogs` | `++id` (auto) | `&date` (unique) | Логи сна (1 запись/день) |
| `appointments` | `++id` (auto) | `date`, `type` | Записи к врачу |
| `dailyLogs` | `++id` (auto) | `&date` (unique) | Общие дневные заметки |

### Ключевые интерфейсы

**ExerciseSession:**
```typescript
{
  exerciseId: string          // e.g. 'ex_passive_flexion'
  sessionSlot: number         // 1-5 (номер сессии) или 0 (ручное выполнение)
  date: string                // 'YYYY-MM-DD'
  startedAt: string           // ISO datetime
  completedAt?: string
  completedSets: number
  completedReps: number
  painBefore?: number         // 0-10
  painAfter?: number          // 0-10
  notes?: string
}
```

**ROMMeasurement:**
```typescript
{
  date: string
  flexion: number             // градусы
  extensionDeficit: number    // градусы
  pronation?: number
  supination?: number
  arc: number                 // flexion - extensionDeficit
  photoFlexion?: Blob
  photoExtension?: Blob
  measuredBy: 'self' | 'physio'
  aiMeasuredFlexion?: number  // от MediaPipe
  aiMeasuredExtension?: number
}
```

**PainEntry:**
```typescript
{
  date: string
  time: string
  level: number               // 0-10
  locations: string[]         // 'lateral', 'medial', 'posterior', etc.
  character: string[]         // 'aching', 'sharp', 'burning', etc.
  triggers: string[]
  crepitation: 'none' | 'mild' | 'moderate' | 'severe'
  numbness45: boolean         // пальцы 4-5 (ульнарный нерв)
  notes?: string
}
```

---

## 7. Дизайн-система

### Палитра «Warm Recovery»

| Токен | Light | Dark | Использование |
|---|---|---|---|
| `--color-primary` | `#5B8A72` | `#7BAF96` | CTA, акценты, навигация |
| `--color-secondary` | `#C4785B` | `#D4956F` | Вторичные элементы |
| `--color-accent` | `#D4A76A` | `#E0BA7E` | Золото, ROM-точки |
| `--color-bg` | `#FAFAF7` | `#1A1917` | Фон приложения |
| `--color-surface` | `#FFFFFF` | `#252320` | Карточки, модалки |
| `--color-text` | `#2D2A26` | `#F0EDE8` | Основной текст |
| `--color-error` | `#C25B4E` | `#D4756A` | Ошибки, красные флаги |

### Типографика

| Уровень | Шрифт | Вес | Размер |
|---|---|---|---|
| Display / заголовки | Fraunces | variable | 24-32px |
| Body / UI | DM Sans | variable | 12-16px |

Масштаб: Major Second (1.125×) — xs=12px, sm=14px, base=16px, lg=18px, xl=20px, 2xl=24px.

### Border Radius

sm=8px, md=12px, lg=16px, xl=24px, full=9999px.

### Dark Mode

Стратегия: CSS class `.dark` на `<html>`, управляется через Zustand (auto/light/dark). ThemeProvider читает `prefers-color-scheme` для режима `system`.

---

## 8. Функциональные модули

### 8.1 Dashboard (`/`)

Главный экран с 4 виджетами:

- **DayCounter** — неделя, день, фаза восстановления с цветным бейджем
- **TodayExercises** — раскрываемая панель: X из Y уникальных упражнений, список с временем и количеством, бейдж «Перевыполнено!»
- **ROMBadge** — последний замер дуги (arc°), цветовой индикатор vs фазовая норма
- **SessionList** — 5 сессий дня с временем, длительностью, статусом выполнения

### 8.2 Каталог упражнений (`/exercises`)

- Фильтрация по приоритету: Все / Обязательные / Рекомендуемые / Дополнительные
- Группировка по типу: пассивные, гравитационные, активно-ассистированные, активные, статические, функциональные
- Каждое упражнение — раскрываемая карточка (`ExerciseDetail`):
  - SVG-анимация (`ExerciseSVG` — 9 уникальных иллюстраций)
  - Бейджи приоритета и целевого движения
  - Параметры: подходы, повторения, длительность удержания
  - Кнопка «Выполнить» / «Выполнить ещё раз» (сохраняет запись с sessionSlot=0)
  - 2-секундная обратная связь «Выполнено ✓»

### 8.3 Session Runner (`/session/[id]`)

Пошаговый проводник через сессию:

- **Шаги:** разогрев → упражнение 1 → упражнение 2 → ... → охлаждение
- **Wall-clock таймер** (не interval-based — без дрифта)
- **Screen Wake Lock** — экран не гаснет во время сессии
- **Audio beep** (880 Hz, WebAudio API) при завершении шага
- **Persistence:** состояние сохраняется в localStorage каждые 5 секунд + при смене шага
  - При возврате на страницу — баннер «Продолжить сессию»
  - 4-часовой TTL (auto-expiry)
- **Индивидуальный трекинг:** одна запись `exerciseSession` на каждое упражнение (не на сессию)

### 8.4 ROM-трекинг (`/progress`)

**Замер ROM:**
- Ручной ввод: flexion, extension deficit, pronation, supination
- **AI-замер через камеру:**
  - `@mediapipe/tasks-vision` PoseLandmarker (WASM + GPU)
  - Модель: `pose_landmarker_full` (float16, ~4MB)
  - Lazy-loading: модель загружается только при нажатии кнопки AI
  - 3D-вектора: shoulder → elbow → wrist → dot product → angle°
  - Canvas overlay с визуализацией скелета
- Фото-захват через камеру или галерею (хранятся как Blob в IndexedDB)

**Визуализация прогресса:**
- **ROMChart** (Recharts ComposedChart): 3 сценарные кривые (optimistic / average / conservative) + фактические замеры
- **StreakCalendar** — полногодовой heatmap (Jan 1 → Dec 31), GitHub-стиль:
  - Зелёные градации = количество упражнений в день
  - Золотые точки = дни с ROM-замерами
  - Auto-scroll к текущей неделе
  - Ячейка 12px, gap 2px, горизонтальный scroll

**ROM Interpretation:**
- Arc → функциональные milestone'ы: клавиатура (30°), руль (50°), вилка/ложка (60°), расчёска (80°), телефон к уху (120°), норма (145°)
- Статус фазы: опережение / в норме / отставание

### 8.5 Дневник боли (`/health/pain`)

- Слайдер 0-10 с цветовым градиентом
- Мультивыбор: локация, характер, триггеры
- Крепитация (4 уровня) и онемение пальцев 4-5
- Раскрываемые заметки (анимация max-height)
- **Red Flag Detection** (автоматические предупреждения):
  - Онемение пальцев 4-5 → ульнарная нейропатия
  - Боль 8+ два дня подряд → системная проблема
  - Тяжёлая крепитация → возможное повреждение
  - Ночная боль 6+ → инфекция / осложнение

### 8.6 Нутрицевтики (`/health/supplements`)

- 16 добавок в 5 слотах (натощак → завтрак → обед → ужин → перед сном)
- Tap-to-mark: отметка приёма с timestamp
- Карточки с дозировкой, приоритетом (1-3), описанием роли
- Данные из `supplements.ts`: коллаген, витамин D3, K2, омега-3, кальций, магний, цинк и др.

### 8.7 Протокол сна (`/health/sleep`)

- Форма: время сна/пробуждения, качество (1-5), количество пробуждений
- **Гормональный таймлайн** (HormoneTimeline): визуализация мелатонина, кортизола, GH
- Рекомендация: сон до 23:00 (синхронизировано с Session 5 в 21:30)

### 8.8 Календарь (`/health/calendar`)

- Записи к врачу (CT, осмотр, анализы, физиотерапия)
- Фазовый таймлайн (PhaseTimeline): визуализация 5 фаз реабилитации
- Карточки записей (AppointmentCard) с типом, датой, статусом

### 8.9 Настройки (`/settings`)

- Тема: светлая / тёмная / системная
- Нотификации: глобальный переключатель + категории (сессии, добавки, сон, ROM)
- **Экспорт данных:**
  - CSV по категориям: ROM, боль, сессии, сон, добавки, дневные логи
  - CSV all-in-one (комбинированный файл)
  - JSON полный бэкап (для импорта)
- **Импорт данных:** JSON-файл с валидацией версии, превью количества записей, bulkAdd
- Информация о хранилище (StorageInfo): используемый объём, квота
- Web Share API (если доступен) для отправки экспорта

### 8.10 Onboarding (`/onboarding`)

3 шага с анимациями slide/fade:
1. Welcome — описание приложения
2. Surgery date — подтверждение даты операции, счётчик дней
3. Ready — обзор функций, кнопка «Перейти к приложению»

---

## 9. PWA-инфраструктура

### Service Worker (`public/sw.js`)

| Стратегия | Ресурсы | Обоснование |
|---|---|---|
| Network-First + cache | HTML/navigation | Свежий контент, офлайн-fallback |
| Network-First + cache | JS, CSS, `/_next/static/` | Свежий код после деплоя |
| Cache-First + network | Images, fonts, `/icons/` | Редко меняются |
| Network-First + cache | Всё остальное | Безопасный default |

**Версионирование:** `APP_VERSION` штампуется при `npm run build` через `scripts/stamp-sw.mjs` (ISO timestamp). Cache name: `elbow-recovery-{version}`. Старые кеши удаляются при activate.

### Жизненный цикл обновления

```
Build → stamp-sw.mjs пишет timestamp в sw.js
     → Deploy to Vercel
     → Пользователь открывает приложение
     → Browser сравнивает sw.js (byte diff)
     → Если новый → install + activate
     → ServiceWorkerProvider → updateAvailable = true
     → UpdatePrompt: зелёная кнопка «Обновить приложение»
     → Пользователь нажимает → SKIP_WAITING → controllerchange → reload
```

Дополнительно: проверка обновлений при `visibilitychange` (возврат в приложение).

### Push-нотификации

Обработчики в sw.js:
- `push` event → `showNotification()` с иконкой и бейджем
- `notificationclick` → focus existing window или `openWindow()`

### Offline

- Precache: `/` и `/offline`
- Навигация: network → cache → `/offline` fallback
- Страница `/offline`: статичная, «Нет соединения»

### Другие PWA-функции

- **Install Banner** — кастомный баннер с кнопкой «Установить» (перехватывает `beforeinstallprompt`)
- **Pull-to-Refresh** — для standalone режима (touch events)
- **Screen Wake Lock** — во время сессий упражнений
- **Persistent Storage** — запрос `navigator.storage.persist()` при первом запуске

---

## 10. AI-модуль (MediaPipe)

### Стек

```
Камера/Галерея → <img> → PoseLandmarker.detect()
                                    ↓
                          33 body landmarks (3D)
                                    ↓
                      getElbowAngle() — dot product 3D vectors
                          shoulder → elbow → wrist
                                    ↓
                      Canvas overlay (скелет + угол)
                                    ↓
                      Автозаполнение поля flexion/extension
```

### Детали реализации

- **Модель:** `pose_landmarker_full` (float16) — ~4MB, CDN jsdelivr
- **WASM runtime:** загружается с CDN при первом использовании
- **GPU-ускорение:** WebGPU/WebGL delegate
- **Singleton:** одна инстанция PoseLandmarker на всё приложение
- **Определение руки:** автоматически определяет правую/левую руку по `patient.targetArm`
- **3D angle:** вычисление через dot product трёх 3D-точек (shoulder, elbow, wrist)

---

## 11. Предметная область

### Пациент

| Параметр | Значение |
|---|---|
| Имя | Серж |
| Возраст | 33 |
| Операция | ORIF правого локтя |
| Дата травмы | 24 декабря 2025 |
| Дата операции | 5 января 2026 |
| Начальный ROM | 30° |

### 5 фаз реабилитации

| Фаза | Недели | ROM-цель | Ключевые задачи |
|---|---|---|---|
| 1. Ранняя мобилизация | 0-6 | 15-30° | Защита, пассивные движения, контроль отёка |
| 2. Активная разработка | 7-12 | 60-80° | Активно-ассистированные движения, пронация/супинация |
| 3. Силовая фаза | 13-20 | 80-100° | Укрепление, лёгкое сопротивление |
| 4. Функциональная фаза | 21-32 | 100-120° | Возврат к ADL, вождение, подъём 5-10 кг |
| 5. Оптимизация | 33-78 | 100-130° | Спорт, решение об удалении металлоконструкции |

### 9 упражнений протокола

| # | Упражнение | Тип | Параметры | Фазы |
|---|---|---|---|---|
| 1 | Пассивное сгибание здоровой рукой | passive | 3×10, hold 30s | 1-5 |
| 2 | Гравитационное сгибание лёжа | passive_gravity | hold 10 min | 1-5 |
| 3 | Скольжение по стене | active_assisted | 1×10, hold 20s | 1-5 |
| 4 | Самопомощь с полотенцем | active_assisted | 1×10, hold 20s | 1-5 |
| 5 | Стол + книжки | static_progressive | hold 10 min | 1-5 |
| 6 | Свободное свисание руки | passive_gravity | 6 ч/день | 1-5 |
| 7 | Пронация и супинация | active | 2×15 | 2-5 |
| 8 | Разработка запястья | active | 1×10, 5 фаз | 2-5 |
| 9 | Мелкая моторика кисти | functional | 6 фаз | 2-5 |

### 5 ежедневных сессий (140 мин/день)

| # | Время | Тип | Длительность | Упражнения |
|---|---|---|---|---|
| 1 | 07:00 | Полная | 40 мин | Тепло → ex1 → ex2 → ex3 → Холод |
| 2 | 12:00 | Короткая | 15 мин | ex1 → ex2 |
| 3 | 15:00 | Полная | 40 мин | Тепло → ex1 → ex2 → ex4 → ex5 → Холод |
| 4 | 18:00 | Короткая | 15 мин | ex2 (10 мин гравитация) |
| 5 | 21:30 | Мягкая | 30 мин | ex1 → ex2 (мягче, сон до 23:00) |

**Термотерапия:**
- Перед сессией: тёплое полотенце / ванночка 37-38°C, 10-15 мин
- После сессии: лёд через полотенце, 10 мин

### 16 нутрицевтиков

Протокол костной регенерации: коллаген I+III (10-15 г), витамин C (1000 мг), D3 (5000 IU), K2 MK-7 (200 мкг), кальций цитрат (1000 мг), магний бисглицинат (400 мг), цинк (30 мг), омега-3 (3 г), бор (3 мг), кремний (10 мг), остеогенон (1660 мг), B6 (25 мг).

---

## 12. История версий

### Хронология разработки

Весь проект создан за **~5 часов** непрерывной разработки 21-22 февраля 2026 года.

---

#### v0.1.0 — Foundation (21 февраля, 22:28-22:44)

**Коммиты:** `27a827b` → `598da8a` (5 коммитов)

- Инициализация Next.js 16 + React 19 + TypeScript
- Дизайн-система: Fraunces + DM Sans, палитра Warm Recovery, Tailwind v4 tokens
- Data layer: 9 упражнений, 16 добавок, 5 сессий, 5 фаз, конфиг пациента
- Zustand store с localStorage persistence
- Dexie.js база: 7 таблиц с compound indexes
- PWA: manifest, service worker, offline fallback
- Bottom tabs навигация (5 вкладок)

---

#### v0.2.0 — Core Features (21 февраля, 22:45-22:58)

**Коммиты:** `49b1ff8` → `7b73d00` (5 коммитов)

- Dashboard: DayCounter, ROM badge, session list
- Session Runner: пошаговые упражнения, wall-clock таймер, wake lock, audio cues
- Supplement tracker: ежедневный чек-лист по слотам
- Pain diary: форма со слайдером, red flag detection
- ROM tracking: ввод угла, фото-захват, IndexedDB storage

---

#### v0.3.0 — Health & Progress (21 февраля, 22:58-23:12)

**Коммиты:** `3068ade` → `0a7f7c9` (5 коммитов)

- Notification system: in-app reminders, browser notifications
- Progress charts: ROM-график с 3 сценариями, streak calendar (12 недель)
- Sleep protocol: лог сна, гормональный таймлайн
- PWA onboarding: 3-шаговый flow
- Settings: тема, нотификации, CSV export
- Календарь: записи к врачу, фазовый таймлайн
- Fix: CSS.escape() для SSR-совместимости

---

#### v0.4.0 — AI & Media (22 февраля, 00:30-01:01)

**Коммиты:** `59ec7d3` → `a623a3c` (3 коммита)

- AI angle measurement: MediaPipe PoseLandmarker, 3D angle calculation
- Camera/gallery photo integration
- Session bug fixes: remount, gallery photos, pronation/supination hints
- Pull-to-refresh для PWA standalone mode

---

#### v0.5.0 — UX Upgrade Batch A-B (22 февраля, 02:06)

**Коммит:** `2addb1c`

- ROM interpretation: arc → functional milestones
- Exercise selector в session runner
- Sleep form improvements
- PWA icons (192px, 512px, maskable)

---

#### v0.6.0 — UX Upgrade Batch C (22 февраля, 02:12)

**Коммит:** `6a1be47`

- Full-year activity calendar (Jan-Dec, GitHub-style heatmap)
- Exercise catalog page с SVG-иллюстрациями (9 анимированных stick-figures)
- Filter tabs: All / Required / Recommended / Additional

---

#### v0.7.0 — PWA Auto-Update (22 февраля, 02:25)

**Коммит:** `58d23b5`

- Prebuild stamp: `scripts/stamp-sw.mjs` → версионированный SW
- Network-First для JS/CSS (fix: был Cache-First → stale bundles)
- ServiceWorkerProvider: полный lifecycle management
- UpdatePrompt: зелёная кнопка «Обновить приложение»
- Проверка обновлений при visibilitychange

---

#### v0.8.0 — PDF Protocol Sync (22 февраля, 03:09)

**Коммит:** `160cb49`

- Синхронизация 5 упражнений и расписания с PDF-протоколом врача
- Session persistence: сохранение/восстановление при навигации (localStorage, 4hr TTL)
- Individual exercise tracking: одна запись на упражнение (не на сессию)
- SVG updates: упражнение 2 = лёжа на спине (не сидя), упражнение 4 = полотенце через плечо

---

#### v1.0.0-beta — Feature Complete (22 февраля, 03:27)

**Коммит:** `f966134`

- «Выполнить» кнопка на карточках упражнений (ручное выполнение без сессии)
- Expandable «Выполнено сегодня» dropdown с деталями
- Full data export: все 6 типов данных (CSV + JSON)
- Data import: JSON с валидацией и превью
- Pain diary: раскрываемые заметки с деталями
- Бейдж «Перевыполнено!»

---

#### v1.1.0 — Medical Review Implementation (22 февраля)

**Источник:** Мультидисциплинарное ревью от команды медицинских агентов (ортопедия, реабилитология, нутрициология, эндокринология).

##### Критические исправления

- **Сессия 5 переработана:** переименована в «Предсонная мягкая» (25 мин), добавлены гравитационное сгибание (5 мин расслабленно) + шаг расслабления (3 мин подготовка ко сну)
- **Защита термотерапии:** предупреждающий модал при попытке пропустить тёплый/холодный компресс — с объяснением медицинского обоснования (эластичность капсулы +15-20%, контроль воспаления)
- **Правило 30 секунд:** интерактивный диалог после удержания в упр.1 — «Боль ушла?» → продвигаться дальше / вернуться / СТОП (экстренная остановка)
- **Нутрицевтики — полная детализация:** добавлены `category`, `roleDetailed`, `interactions`, `testMarker`, `targetLevel` для всех 16 добавок (биохимическое обоснование каждой)

##### Данные и протокол

- **ROM-сценарии:** кривые заменены на медицински валидированные данные (12-13 точек на кривую, недели 0-52)
- **Функциональные milestone'ы:** 7 точек на графике (30° клавиатура → 140° полная норма)
- **Фазовая приоритизация упражнений:** каждое упражнение имеет `phasePriority` — required/recommended/optional по фазам 1-5
- **Прогрессия книжек (упр.5):** трекер с +/- кнопками, оценка высоты/угла, напоминание при стагнации 3+ дня

##### Dashboard — новые виджеты

- **Пропущенные сессии:** баннер с предложением «Выполнить сейчас?» для сессий, чьё время прошло 30+ мин назад
- **Data-driven мотивация:** динамические сообщения на основе ROM-прогресса, серии дней, текущей фазы
- **Трекер свисания руки:** кнопка старт/стоп, прогресс-бар 0/6 часов, сохранение в dailyLogs

##### UX / Polish

- **Авто-тёмная тема 21:00-07:00:** при `theme: 'system'` — защита мелатонина от синего света
- **Дифференцированные звуки:** 5 типов audio cues (holdStart 440Hz, holdEnd 880Hz, setComplete аккорд C-E-G, sessionComplete победный, warning нисходящий)
- **Book stack progression:** интерактивный трекер количества книжек с оценкой угла

##### Новые файлы

| Файл | Назначение |
|---|---|
| `src/lib/audio.ts` | 5 типов звуков через WebAudio API |
| `src/components/dashboard/missed-sessions.tsx` | Баннер пропущенных сессий |
| `src/components/dashboard/motivation.tsx` | Мотивационные сообщения |
| `src/components/dashboard/hanging-tracker.tsx` | Трекер свисания руки |

##### Изменённые файлы

| Файл | Изменения |
|---|---|
| `src/data/schedule.ts` | Session 5: +gravity flexion, +расслабление |
| `src/data/supplements.ts` | +category, +roleDetailed, +interactions, +testMarker, +targetLevel |
| `src/data/exercises.ts` | +phasePriority, +progressionRules, +getExercisePriorityForPhase() |
| `src/components/progress/scenario-curves.ts` | Медицински валидированные кривые + milestones |
| `src/components/session/session-runner.tsx` | +skip warning, +pain dialog, +playSound |
| `src/hooks/use-timer.ts` | playSound('holdEnd') вместо inline AudioContext |
| `src/components/exercises/exercise-detail.tsx` | +BookStackTracker для ex_table_books |
| `src/providers/theme-provider.tsx` | +вечерний авто-dark mode |
| `src/app/(app)/page.tsx` | +Motivation, +MissedSessions, +HangingTracker |

---

## 13. Деплой и CI/CD

### Vercel

- **Хостинг:** Vercel (Free plan)
- **Git Integration:** GitHub webhook → автодеплой при push в `main`
- **Build:** `npm run build` (включает prebuild stamp-sw.mjs)
- **Домен:** автоматический `.vercel.app`

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4 (node 20)
      - run: npm ci
      - run: npx vercel pull --yes --environment=production
      - run: npx vercel build --prod
      - run: npx vercel deploy --prebuilt --prod
```

**Secrets:** `VERCEL_TOKEN` (в GitHub repo settings).

### Build Pipeline

```
npm run build
  → prebuild: node scripts/stamp-sw.mjs (штампует APP_VERSION в sw.js)
  → next build (SSR + static generation)
  → Vercel deploy (prebuilt)
```

---

## 14. Запуск и разработка

### Требования

- Node.js 20+
- npm

### Команды

```bash
# Установка зависимостей
npm install

# Режим разработки
npm run dev        # → http://localhost:3000

# Production build
npm run build      # prebuild → next build

# Production server
npm run start      # → http://localhost:3000

# Линтер
npm run lint
```

### Переменные окружения

Не требуются — приложение полностью клиентское, без бэкенда.

### Особенности разработки

- **Inline styles:** компоненты используют `style={{}}` с CSS-переменными, НЕ Tailwind-классы
- **'use client':** все интерактивные компоненты помечены как client components
- **Path alias:** `@/` → `./src/`
- **Strict TypeScript:** включён strict mode
- **Service Worker:** в dev-режиме SW не активен (только production build)

---

> Документация сгенерирована автоматически на основе анализа кодовой базы.
> Последнее обновление: 22 февраля 2026, v1.1.0 — Medical Review Implementation.
