# UX Upgrade Batch — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Major UX upgrade: ROM interpretation, session selector, exercise catalog with SVG illustrations, sleep improvements, full-year activity calendar, app icon, layout fixes.

**Architecture:** All client-side React components. Data from existing Dexie IndexedDB. No new API routes or server dependencies. Design system: inline style={{}} with CSS variables var(--color-*), var(--text-*), var(--radius-*). Icons: @phosphor-icons/react (duotone weight).

**Tech Stack:** Next.js 16, React 19, Dexie.js, Recharts, Phosphor Icons, CSS variables

---

## Context

- **Project:** `/Users/clawdbot/projects/elbow-recovery` — Elbow recovery PWA
- **Patient:** Серж, 33, ORIF правый локоть 05.01.2026, текущая фаза 2
- **Design tokens:** `src/app/globals.css` — var(--color-primary: #5B8A72), var(--color-accent: #D4A76A), var(--color-secondary: #C4785B)
- **DB:** `src/lib/db.ts` — Dexie with exerciseSessions, romMeasurements, painEntries, supplementLogs, sleepLogs, appointments, dailyLogs
- **Exercises:** `src/data/exercises.ts` — 9 exercises with phases, reps, sets, pain rules
- **Recovery phases:** `src/data/phases.ts` — 5 phases with ROM targets
- **ALL components use inline style={{}} with CSS variables, NOT Tailwind utility classes**

---

### Task 1: Fix safe area layout overflow

The progress page content overflows beyond the iPhone safe area notch.

**Files:**
- Modify: `src/app/(app)/layout.tsx`

**Implementation:**

Update the `<main>` element to include safe area padding:

```tsx
<main className="min-h-screen pb-20 max-w-lg mx-auto px-4"
  style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
```

Also add `overflow-x: hidden` to prevent horizontal overflow on the container.

**Commit:** `fix: add safe area padding to app layout`

---

### Task 2: Session page — exercise selector

Currently `src/app/(app)/session/page.tsx` is a blank placeholder. Replace with a full exercise selection screen showing exercises available for the current phase, grouped by type.

**Files:**
- Rewrite: `src/app/(app)/session/page.tsx`

**Implementation:**

```tsx
'use client'

import Link from 'next/link'
import { Barbell, ArrowRight, Timer, Repeat, Fire } from '@phosphor-icons/react'
import { getCurrentPhase } from '@/data/patient'
import { getExercisesForPhase, type Exercise } from '@/data/exercises'

const TYPE_LABELS: Record<string, string> = {
  passive: 'Пассивные',
  passive_gravity: 'Гравитационные',
  active_assisted: 'Активные с поддержкой',
  active: 'Активные',
  static_progressive: 'Статические',
  functional: 'Функциональные',
}

const TYPE_ORDER = ['passive', 'passive_gravity', 'active_assisted', 'active', 'static_progressive', 'functional']

const PRIORITY_COLORS: Record<number, string> = {
  1: 'var(--color-error)',
  2: 'var(--color-warning)',
  3: 'var(--color-info)',
}

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Обязательно',
  2: 'Рекомендуется',
  3: 'Дополнительно',
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const totalTime = exercise.phases.reduce((sum, p) => sum + (p.durationSec ?? 0), 0)
  const timeLabel = totalTime >= 60 ? `${Math.round(totalTime / 60)} мин` : `${totalTime} сек`

  return (
    <Link
      href={`/session/${exercises.indexOf(exercise) + 1}`}  // Map to session ID
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        textDecoration: 'none',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Left side */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}>
            {exercise.nameShort}
          </span>
          <span style={{
            fontSize: '10px',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: `color-mix(in srgb, ${PRIORITY_COLORS[exercise.priority]} 12%, transparent)`,
            color: PRIORITY_COLORS[exercise.priority],
          }}>
            {PRIORITY_LABELS[exercise.priority]}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {exercise.reps && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Repeat size={12} weight="bold" /> {exercise.sets}×{exercise.reps}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Timer size={12} weight="bold" /> {timeLabel}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Fire size={12} weight="bold" /> {exercise.sessionsPerDay}×/день
          </span>
        </div>
      </div>
      {/* Arrow */}
      <ArrowRight size={18} weight="bold" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
    </Link>
  )
}
```

The page groups exercises by type using TYPE_ORDER, renders section headers, and lists ExerciseCards below each. Each card links to `/session/{id}` which launches the SessionRunner.

**Note:** The session ID mapping needs to match the exercise index. Currently sessions are 1-5. We need to update the session/[id]/page.tsx to accept exercise IDs (strings) or map indices properly. For now, the session page shows the catalog — tapping an exercise shows its description and a "Start" button that opens the existing session runner.

**Commit:** `feat: add exercise selection screen with phase-filtered catalog`

---

### Task 3: ROM interpretation card

After saving a ROM measurement, show a contextual interpretation card explaining what the angle means — functional milestones, comparison to phase target, week-over-week change.

**Files:**
- Create: `src/lib/rom-interpretation.ts`
- Modify: `src/components/progress/rom-input.tsx` (the "saved" state)

**rom-interpretation.ts** — Pure function:

```typescript
export interface ROMInterpretation {
  summary: string           // "62° — нормальный прогресс для 7-й недели"
  functionalNext: string    // "Следующий рубеж: 80° (дверная ручка)"
  weeklyChange?: string     // "+12° за неделю"
  canDo: string[]           // ["Работа за клавиатурой", "Держать руль"]
  cantYet: string[]         // ["Поднести ложку ко рту (нужно 100°)"]
  phaseStatus: 'ahead' | 'on-track' | 'behind'
}

const MILESTONES = [
  { angle: 30, label: 'Работа за клавиатурой' },
  { angle: 50, label: 'Держать руль' },
  { angle: 80, label: 'Открыть дверную ручку' },
  { angle: 90, label: 'Застегнуть пуговицу' },
  { angle: 100, label: 'Поднести ложку ко рту' },
  { angle: 110, label: 'Пить из чашки' },
  { angle: 120, label: 'Телефон к уху' },
  { angle: 130, label: 'Причесаться' },
  { angle: 145, label: 'Полная норма' },
]

export function interpretROM(arc: number, phaseNum: number, targetMin: number, targetMax: number, previousArc?: number): ROMInterpretation
```

This function returns structured data. The saved state in rom-input.tsx renders it as a card with canDo/cantYet sections and motivational context.

**Commit:** `feat: add ROM interpretation with functional milestones`

---

### Task 4: ROM field explanations

Add short helper text explaining what "Сгибание" and "Дефицит разгибания" mean for manual input.

**Files:**
- Modify: `src/components/progress/rom-input.tsx`

Under the Flexion NumberField add:
```
Угол максимального сгибания локтя. Полностью согните руку и измерьте гониометром.
```

Under Extension deficit NumberField add:
```
Сколько градусов не хватает до полного разгибания (0° = полностью прямая рука).
```

Simple `<p>` tags with `fontSize: var(--text-xs), color: var(--color-text-muted)`.

**Commit:** `feat: add field explanations for flexion and extension deficit`

---

### Task 5: History button + current angle on Progress page

Add a "История замеров" button and highlight the current ROM angle prominently.

**Files:**
- Modify: `src/app/(app)/progress/page.tsx`

**Changes:**
1. Add a current ROM badge at the top (big number like "62°" with phase target context)
2. Add "История замеров" link button next to "Новый замер"

Use `useROM()` hook to get latest measurement.

**Commit:** `feat: add current angle display and history link to progress page`

---

### Task 6: Full-year activity calendar

Replace the 12-week StreakCalendar with a full-year GitHub-style heatmap (Jan 1 → Dec 31) showing exercise sessions AND ROM measurements.

**Files:**
- Rewrite: `src/components/progress/streak-calendar.tsx`

**Changes:**
- Show full year from Jan 1 to Dec 31 of current year
- Month labels across top (Янв, Фев, Мар...)
- Day rows (Пн-Вс)
- Color intensity = session count + last ROM measurement for that day
- Horizontally scrollable on mobile (overflow-x: auto)
- Today highlighted with a border

**Commit:** `feat: full-year activity calendar with ROM overlay`

---

### Task 7: Sleep log expandable detail

Make sleep log entries tappable to expand and show full details (notes, wake-ups count).

**Files:**
- Modify: `src/app/(app)/health/sleep/page.tsx`

**Changes:**
- Each sleep log card becomes a button that toggles `expanded` state
- When expanded: show notes (full text), wake-ups count, quality description
- Smooth animation (animate-fade-in)

**Commit:** `feat: expandable sleep log entries with full details`

---

### Task 8: Sleep form date picker

Fix: user can't log yesterday's sleep. Add a date picker to the sleep form.

**Files:**
- Modify: `src/components/health/sleep-form.tsx`

**Changes:**
- Add date input field defaulting to today
- Use that date instead of hardcoded `new Date().toISOString().split('T')[0]`
- Validate: date must be today or up to 7 days ago
- The `db.sleepLogs.put()` uses this date as the key

**Commit:** `fix: add date picker to sleep form for past entries`

---

### Task 9: Hormone tooltips

Make hormone labels in the timeline tappable. Tap shows a small popover with description.

**Files:**
- Modify: `src/components/health/hormone-timeline.tsx`

**Hormone descriptions:**

| Hormone | Description |
|---------|------------|
| Мелатонин | Гормон сна. Начинает вырабатываться при снижении освещённости. Регулирует циркадный ритм и запускает каскад восстановительных процессов. |
| Гормон роста | Ключевой для регенерации кости. 60-70% суточной дозы выделяется в первые 2 часа глубокого сна. Стимулирует остеобласты — клетки, строящие новую костную ткань. |
| Глубокий сон | Фаза максимальной репарации тканей. Иммунная система активно работает, воспаление снижается, мышцы восстанавливаются. |
| Кортизол ↑ | Гормон бодрости. Начинает расти к утру, готовя организм к пробуждению. Умеренный уровень необходим для нормального метаболизма кости. |
| Тестостерон | Влияет на плотность костной ткани и мышечную силу. Пик выработки — ранние утренние часы во время REM-сна. |
| Пробуждение | Оптимальное время подъёма. Кортизол на пике, мелатонин подавлен — организм готов к активности. |

Each hormone section in the timeline bar becomes a button. On tap, a small tooltip appears below/above it with the description. Only one tooltip visible at a time (tap another = switch, tap same = close).

**Commit:** `feat: add tappable hormone tooltips with medical descriptions`

---

### Task 10: App icon

Create a PWA icon (192x192 and 512x512) in the Warm Recovery style.

**Files:**
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`
- Create: `public/icons/icon-maskable-512.png`

**Design concept:** SVG-based, rendered to PNG. A stylized elbow joint angle (like a bent arm silhouette) in Sage Green (#5B8A72) on a warm cream (#FAFAF7) background. Simple, clean, recognizable at small sizes. The angle/arc motif connects to the ROM measurement feature.

Use canvas API or SVG → PNG conversion in a build script.

**Commit:** `feat: add PWA app icons in Warm Recovery style`

---

### Task 11: Exercise catalog page with SVG illustrations

New dedicated page for browsing all exercises with animated SVG illustrations.

**Files:**
- Create: `src/app/(app)/exercises/page.tsx`
- Create: `src/components/exercises/exercise-detail.tsx`
- Create: `src/components/exercises/exercise-svg.tsx`
- Modify: `src/components/layout/bottom-tabs.tsx` (add Exercises tab)

**SVG Illustrations:**
Simple stick-figure style SVGs showing the exercise position. Each SVG is a React component with CSS animation for the movement (e.g., arm bending). Colors use design tokens.

Example exercise SVGs:
- Passive flexion: Arm on table, arrow showing bend direction
- Gravity flexion: Seated, arm hanging with gravity arrow
- Wall slide: Figure at wall, arm sliding up
- Towel assist: Figure with towel loop over neck
- Table books: Arm on table with books under wrist
- Gravity extension: Standing, arm hanging straight
- Rotation: Top-down view of forearm rotating
- Wrist rehab: Wrist circles
- Fine motor: Hand with ball

**Bottom tabs update:** Replace 5-tab layout or add 6th tab. Since 5 is standard for mobile, consider replacing the "Сессия" tab with "Упражнения" tab that includes both the catalog AND the "Start session" functionality.

**Commit:** `feat: exercise catalog with SVG illustrations and animations`

---

## Execution Order

**Batch A (parallel — quick fixes):** Tasks 1, 4, 8
**Batch B (parallel — medium):** Tasks 2, 3, 5, 7, 9
**Batch C (parallel — large):** Tasks 6, 10, 11

Total: 11 tasks, 3 batches
