# Wave 1: Gamification — Recovery Score + Achievements + Streak Freeze

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add gamification layer (Recovery Score, badges/XP, streak freeze) to boost daily retention ~50%.

**Architecture:** Three new data modules + two UI components + one Zustand store extension. Recovery Score is a pure function computing 0-100 from today's data. Achievements stored in Zustand (persistent). Streak freeze adds a `streakFreezes` counter to app-store. No backend changes. No new DB tables — achievements derived from existing data + timestamps in Zustand.

**Tech Stack:** React 19, TypeScript, Zustand (persist), Dexie (read-only queries), Phosphor Icons, CSS variables, `style={{}}` inline.

---

## Context for Implementer

**Project:** `/Users/clawdbot/projects/elbow-recovery` — Next.js 15 PWA, App Router.

**Key conventions:**
- All components use `style={{}}` with `var(--color-*)` CSS variables — NO Tailwind classes for component styling (only layout utilities like `py-6`)
- Icons: `@phosphor-icons/react` with `weight="duotone"` default
- DB: `src/lib/db.ts` — Dexie with `useLiveQuery`
- State: `src/stores/app-store.ts` — Zustand with `persist` middleware
- Hooks: `src/hooks/use-*.ts` — `'use client'` directive required
- Language: Russian for all UI strings
- Dashboard: `src/app/(app)/page.tsx` imports dashboard components

**Existing hooks to reuse (DO NOT duplicate queries):**
- `useStreak()` → `{ streak, totalSessions, activeDays }`
- `useSupplementsToday()` → `{ takenCount, totalCount }`
- `useTodayData()` → `{ sessionsToday, supplementsToday, painToday, latestROM }`

**5 daily sessions** with ids 1-5 (schedule.ts). A completed session = row in `exerciseSessions` table.

**32 supplements** across 5 slots. A taken supplement = row in `supplementLogs` with `taken: true`.

---

## Task 1: Recovery Score computation hook

**Files:**
- Create: `src/hooks/use-recovery-score.ts`

**What it does:** Pure computation hook. Takes today's data and returns a score 0-100.

**Scoring formula:**
| Component | Max Points | Logic |
|---|---|---|
| Sessions | 30 | `completedSlots / 5 * 30` (unique slots completed today) |
| Supplements | 20 | `takenCount / totalCount * 20` |
| Sleep | 20 | 20 if sleep logged AND totalHours >= 7, 10 if logged but < 7, 0 if not logged |
| Pain | 15 | 15 if no pain logged (good day!) OR average pain <= 3; 10 if avg 4-5; 5 if avg 6-7; 0 if avg 8+ |
| ROM | 15 | 15 if ROM measured today, 0 otherwise |

**Step 1: Create the hook**

```typescript
// src/hooks/use-recovery-score.ts
'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { supplements } from '@/data/supplements'

export interface RecoveryScore {
  total: number           // 0–100
  sessions: number        // 0–30
  supplements: number     // 0–20
  sleep: number           // 0–20
  pain: number            // 0–15
  rom: number             // 0–15
  isLoading: boolean
}

export function useRecoveryScore(): RecoveryScore {
  const today = new Date().toISOString().split('T')[0]

  const sessionsToday = useLiveQuery(
    () => db.exerciseSessions.where('date').equals(today).toArray(),
    [today]
  )
  const supplementsToday = useLiveQuery(
    () => db.supplementLogs.where('date').equals(today).filter(l => l.taken).toArray(),
    [today]
  )
  const sleepToday = useLiveQuery(
    () => db.sleepLogs.where('date').equals(today).first(),
    [today]
  )
  const painToday = useLiveQuery(
    () => db.painEntries.where('date').equals(today).toArray(),
    [today]
  )
  const romToday = useLiveQuery(
    () => db.romMeasurements.where('date').equals(today).first(),
    [today]
  )

  return useMemo(() => {
    const isLoading = sessionsToday === undefined

    if (isLoading) {
      return { total: 0, sessions: 0, supplements: 0, sleep: 0, pain: 0, rom: 0, isLoading: true }
    }

    // Sessions: unique completed slots / 5 * 30
    const completedSlots = new Set(sessionsToday!.map(s => s.sessionSlot)).size
    const sessionsScore = Math.round((completedSlots / 5) * 30)

    // Supplements: taken / total * 20
    const takenCount = supplementsToday?.length ?? 0
    const totalCount = supplements.length
    const supplementsScore = totalCount > 0 ? Math.round((takenCount / totalCount) * 20) : 0

    // Sleep: 20 if logged >= 7h, 10 if logged < 7h, 0 if not logged
    let sleepScore = 0
    if (sleepToday) {
      sleepScore = sleepToday.totalHours >= 7 ? 20 : 10
    }

    // Pain: 15 if no entries or avg <= 3, scaled down for higher pain
    let painScore = 15
    if (painToday && painToday.length > 0) {
      const avg = painToday.reduce((sum, p) => sum + p.level, 0) / painToday.length
      if (avg <= 3) painScore = 15
      else if (avg <= 5) painScore = 10
      else if (avg <= 7) painScore = 5
      else painScore = 0
    }

    // ROM: 15 if measured today
    const romScore = romToday ? 15 : 0

    const total = sessionsScore + supplementsScore + sleepScore + painScore + romScore

    return {
      total,
      sessions: sessionsScore,
      supplements: supplementsScore,
      sleep: sleepScore,
      pain: painScore,
      rom: romScore,
      isLoading: false,
    }
  }, [sessionsToday, supplementsToday, sleepToday, painToday, romToday])
}
```

**Step 2: Verify TypeScript**

Run: `cd /Users/clawdbot/projects/elbow-recovery && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/hooks/use-recovery-score.ts
git commit -m "feat: add useRecoveryScore hook (0-100 daily score)"
```

---

## Task 2: RecoveryScoreCard dashboard component

**Files:**
- Create: `src/components/dashboard/recovery-score.tsx`
- Modify: `src/app/(app)/page.tsx`

**What it does:** Circular progress ring (SVG) showing today's score 0-100 with color gradient (red → yellow → green) and breakdown chips below. Placed at the TOP of the dashboard, before DayCounter.

**Step 1: Create the component**

```typescript
// src/components/dashboard/recovery-score.tsx
'use client'

import { useRecoveryScore } from '@/hooks/use-recovery-score'

const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--color-success)'
  if (score >= 50) return 'var(--color-warning)'
  return 'var(--color-error)'
}

function scoreLabel(score: number): string {
  if (score >= 90) return 'Отлично!'
  if (score >= 70) return 'Хорошо'
  if (score >= 50) return 'Нормально'
  if (score >= 30) return 'Можно лучше'
  return 'Начни день'
}

interface ChipProps {
  label: string
  value: number
  max: number
  color: string
}

function Chip({ label, value, max, color }: ChipProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      backgroundColor: 'var(--color-surface-alt)',
      fontSize: 'var(--text-xs)',
    }}>
      <span style={{
        width: 8, height: 8,
        borderRadius: '50%',
        backgroundColor: value > 0 ? color : 'var(--color-border)',
        flexShrink: 0,
      }} />
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: 'var(--color-text)', marginLeft: 'auto' }}>
        {value}/{max}
      </span>
    </div>
  )
}

export function RecoveryScoreCard() {
  const score = useRecoveryScore()

  if (score.isLoading) return null

  const color = scoreColor(score.total)
  const offset = CIRCUMFERENCE - (score.total / 100) * CIRCUMFERENCE

  return (
    <div style={{
      padding: '20px',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-surface)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
    }}>
      {/* Score ring */}
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <svg width={120} height={120} viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease',
            }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 700,
            color,
            lineHeight: 1,
          }}>
            {score.total}
          </span>
          <span style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 2,
          }}>
            из 100
          </span>
        </div>
      </div>

      {/* Label */}
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-lg)',
        fontWeight: 600,
        color: 'var(--color-text)',
      }}>
        {scoreLabel(score.total)}
      </span>

      {/* Breakdown chips */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'center',
        width: '100%',
      }}>
        <Chip label="Сессии" value={score.sessions} max={30} color="var(--color-primary)" />
        <Chip label="Добавки" value={score.supplements} max={20} color="var(--color-accent)" />
        <Chip label="Сон" value={score.sleep} max={20} color="var(--color-info)" />
        <Chip label="Боль" value={score.pain} max={15} color="var(--color-secondary)" />
        <Chip label="ROM" value={score.rom} max={15} color="var(--color-success)" />
      </div>
    </div>
  )
}
```

**Step 2: Wire into dashboard**

In `src/app/(app)/page.tsx`, add import and place `<RecoveryScoreCard />` FIRST:

```typescript
import { RecoveryScoreCard } from '@/components/dashboard/recovery-score'
// ... existing imports

export default function DashboardPage() {
  return (
    <div>
      <RecoveryScoreCard />
      <DayCounter />
      <Motivation />
      <ROMBadge />
      <TodayExercises />
      <MissedSessions />
      <HangingTracker />
      <SessionList />
    </div>
  )
}
```

**Step 3: Verify TypeScript**

Run: `cd /Users/clawdbot/projects/elbow-recovery && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/components/dashboard/recovery-score.tsx src/app/\(app\)/page.tsx
git commit -m "feat: RecoveryScoreCard — circular progress ring with breakdown chips on dashboard"
```

---

## Task 3: Achievement definitions + Zustand store

**Files:**
- Create: `src/data/achievements.ts`
- Modify: `src/stores/app-store.ts`

**What it does:** Define 15 achievements (badges) with unlock conditions. Store unlocked achievements (id + timestamp) in Zustand.

**Step 1: Create achievement definitions**

```typescript
// src/data/achievements.ts

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string        // Phosphor icon name for rendering
  category: 'streak' | 'sessions' | 'supplements' | 'rom' | 'wellness' | 'milestone'
  xp: number          // XP reward
}

export const achievements: AchievementDef[] = [
  // ── Streak ──
  { id: 'streak_3',   name: 'Разгон',            description: '3 дня подряд',                      icon: 'Fire',          category: 'streak',      xp: 30 },
  { id: 'streak_7',   name: 'Неделя!',           description: '7 дней подряд',                      icon: 'Fire',          category: 'streak',      xp: 70 },
  { id: 'streak_14',  name: 'Двухнедельник',     description: '14 дней подряд',                     icon: 'Fire',          category: 'streak',      xp: 150 },
  { id: 'streak_30',  name: 'Месяц стали',       description: '30 дней подряд',                     icon: 'Trophy',        category: 'streak',      xp: 300 },

  // ── Sessions ──
  { id: 'first_session',  name: 'Первый шаг',    description: 'Заверши первую сессию',              icon: 'Play',          category: 'sessions',    xp: 20 },
  { id: 'all_5_today',    name: 'Полный день',    description: 'Сделай все 5 сессий за день',        icon: 'CheckCircle',   category: 'sessions',    xp: 100 },
  { id: 'sessions_50',    name: 'Полтинник',      description: '50 сессий всего',                    icon: 'Barbell',       category: 'sessions',    xp: 200 },

  // ── Supplements ──
  { id: 'sups_perfect_day', name: 'Все по плану', description: 'Прими все добавки за день',          icon: 'Pill',          category: 'supplements', xp: 50 },
  { id: 'sups_7_days',     name: 'Протокол недели', description: '7 дней все добавки приняты',       icon: 'Pill',          category: 'supplements', xp: 150 },

  // ── ROM ──
  { id: 'rom_first',    name: 'Первый замер',     description: 'Сделай первый замер ROM',            icon: 'Ruler',         category: 'rom',         xp: 20 },
  { id: 'rom_90',       name: 'Прямой угол',      description: 'Достигни 90° флексии',               icon: 'TrendUp',       category: 'rom',         xp: 250 },
  { id: 'rom_120',      name: 'Почти норма',      description: 'Достигни 120° флексии',              icon: 'Star',          category: 'rom',         xp: 500 },

  // ── Wellness ──
  { id: 'sleep_7h_week', name: 'Режим сна',       description: '7 дней спать >= 7 часов',            icon: 'Moon',          category: 'wellness',    xp: 100 },

  // ── Milestones ──
  { id: 'score_80',     name: 'Идеальный день',   description: 'Recovery Score >= 80',               icon: 'Target',        category: 'milestone',   xp: 80 },
  { id: 'score_100',    name: 'Стопроцентный',    description: 'Recovery Score = 100',               icon: 'Crown',         category: 'milestone',   xp: 300 },
]

export function getAchievementById(id: string): AchievementDef | undefined {
  return achievements.find(a => a.id === id)
}
```

**Step 2: Extend Zustand store**

In `src/stores/app-store.ts`, add achievements state:

Add to `AppState` interface:
```typescript
  // Gamification
  unlockedAchievements: Record<string, number>  // { achievementId: unlockedTimestamp }
  streakFreezes: number                         // available freezes (max 1 at a time, replenish every 7 streak days)
  totalXP: number
  unlockAchievement: (id: string, xp: number) => void
  useStreakFreeze: () => boolean
  replenishStreakFreeze: () => void
```

Add to initial state in `(set) => ({`:
```typescript
      unlockedAchievements: {},
      streakFreezes: 0,
      totalXP: 0,
      unlockAchievement: (id, xp) =>
        set((state) => {
          if (state.unlockedAchievements[id]) return state  // already unlocked
          return {
            unlockedAchievements: { ...state.unlockedAchievements, [id]: Date.now() },
            totalXP: state.totalXP + xp,
          }
        }),
      useStreakFreeze: () => {
        let used = false
        set((state) => {
          if (state.streakFreezes <= 0) return state
          used = true
          return { streakFreezes: state.streakFreezes - 1 }
        })
        return used
      },
      replenishStreakFreeze: () =>
        set((state) => ({
          streakFreezes: Math.min(state.streakFreezes + 1, 1),
        })),
```

**Step 3: Verify TypeScript**

Run: `cd /Users/clawdbot/projects/elbow-recovery && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/data/achievements.ts src/stores/app-store.ts
git commit -m "feat: 15 achievement definitions + gamification state in Zustand"
```

---

## Task 4: Achievement checker hook

**Files:**
- Create: `src/hooks/use-achievement-checker.ts`

**What it does:** Runs on every dashboard render. Checks each achievement condition against live data. If met and not yet unlocked, calls `unlockAchievement`. Also handles streak freeze replenishment (every 7 streak days).

**Step 1: Create the hook**

```typescript
// src/hooks/use-achievement-checker.ts
'use client'

import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { supplements } from '@/data/supplements'
import { achievements } from '@/data/achievements'
import { useAppStore } from '@/stores/app-store'
import { useStreak } from '@/hooks/use-streak'
import { useRecoveryScore } from '@/hooks/use-recovery-score'

export function useAchievementChecker() {
  const today = new Date().toISOString().split('T')[0]
  const { streak, totalSessions } = useStreak()
  const score = useRecoveryScore()

  const { unlockedAchievements, unlockAchievement, replenishStreakFreeze } = useAppStore()

  // Today's data
  const sessionsToday = useLiveQuery(
    () => db.exerciseSessions.where('date').equals(today).toArray(),
    [today]
  )

  const supplementsToday = useLiveQuery(
    () => db.supplementLogs.where('date').equals(today).filter(l => l.taken).toArray(),
    [today]
  )

  const latestROM = useLiveQuery(
    () => db.romMeasurements.orderBy('date').reverse().first()
  )

  const romToday = useLiveQuery(
    () => db.romMeasurements.where('date').equals(today).first(),
    [today]
  )

  // Sleep last 7 days
  const since7 = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })()
  const recentSleep = useLiveQuery(
    () => db.sleepLogs.where('date').between(since7, today, true, true).toArray(),
    [since7, today]
  )

  // Supplement adherence last 7 days
  const recentSupLogs = useLiveQuery(
    () => db.supplementLogs.where('date').between(since7, today, true, true).filter(l => l.taken).toArray(),
    [since7, today]
  )

  useEffect(() => {
    if (score.isLoading || sessionsToday === undefined) return

    function tryUnlock(id: string, xp: number) {
      if (!unlockedAchievements[id]) {
        unlockAchievement(id, xp)
      }
    }

    const totalSupplements = supplements.length

    // ── Streak achievements ──
    if (streak >= 3)  tryUnlock('streak_3', 30)
    if (streak >= 7)  tryUnlock('streak_7', 70)
    if (streak >= 14) tryUnlock('streak_14', 150)
    if (streak >= 30) tryUnlock('streak_30', 300)

    // ── Session achievements ──
    if (totalSessions >= 1)  tryUnlock('first_session', 20)
    if (totalSessions >= 50) tryUnlock('sessions_50', 200)

    const todaySlots = new Set(sessionsToday?.map(s => s.sessionSlot) ?? [])
    if (todaySlots.size >= 5) tryUnlock('all_5_today', 100)

    // ── Supplement achievements ──
    const takenToday = supplementsToday?.length ?? 0
    if (takenToday >= totalSupplements) tryUnlock('sups_perfect_day', 50)

    // 7 days all supplements — check if each of last 7 days has all supplements taken
    if (recentSupLogs && recentSleep) {
      const supsByDate = new Map<string, number>()
      for (const log of recentSupLogs) {
        supsByDate.set(log.date, (supsByDate.get(log.date) ?? 0) + 1)
      }
      let perfectDays = 0
      for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        if ((supsByDate.get(dateStr) ?? 0) >= totalSupplements) perfectDays++
      }
      if (perfectDays >= 7) tryUnlock('sups_7_days', 150)
    }

    // ── ROM achievements ──
    if (romToday) tryUnlock('rom_first', 20)
    if (latestROM && latestROM.flexion >= 90)  tryUnlock('rom_90', 250)
    if (latestROM && latestROM.flexion >= 120) tryUnlock('rom_120', 500)

    // ── Sleep achievements ──
    if (recentSleep && recentSleep.length >= 7) {
      const allGoodSleep = recentSleep.every(s => s.totalHours >= 7)
      if (allGoodSleep) tryUnlock('sleep_7h_week', 100)
    }

    // ── Score achievements ──
    if (score.total >= 80)  tryUnlock('score_80', 80)
    if (score.total >= 100) tryUnlock('score_100', 300)

    // ── Streak freeze replenishment ──
    if (streak > 0 && streak % 7 === 0) {
      replenishStreakFreeze()
    }
  }, [
    streak, totalSessions, sessionsToday, supplementsToday,
    latestROM, romToday, recentSleep, recentSupLogs,
    score, unlockedAchievements, unlockAchievement, replenishStreakFreeze,
  ])
}
```

**Step 2: Wire into dashboard layout**

In `src/app/(app)/page.tsx`, add at top level (call inside a client wrapper or directly in a client component). Since `page.tsx` is a Server Component, we need a thin client wrapper.

Create `src/components/dashboard/achievement-watcher.tsx`:

```typescript
// src/components/dashboard/achievement-watcher.tsx
'use client'

import { useAchievementChecker } from '@/hooks/use-achievement-checker'

export function AchievementWatcher() {
  useAchievementChecker()
  return null
}
```

In `src/app/(app)/page.tsx`, add:

```typescript
import { AchievementWatcher } from '@/components/dashboard/achievement-watcher'

// Inside return, before <RecoveryScoreCard />:
<AchievementWatcher />
```

**Step 3: Verify TypeScript**

Run: `cd /Users/clawdbot/projects/elbow-recovery && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/hooks/use-achievement-checker.ts src/components/dashboard/achievement-watcher.tsx src/app/\(app\)/page.tsx
git commit -m "feat: achievement checker hook — auto-unlocks badges on dashboard render"
```

---

## Task 5: Achievements page

**Files:**
- Create: `src/app/(app)/settings/achievements/page.tsx`

**What it does:** Full-page grid of all 15 achievements. Unlocked ones are highlighted with timestamp. Locked ones are greyed with lock icon. Shows total XP and level at the top.

**Level formula:** `level = Math.floor(totalXP / 200) + 1` — Level 1 starts at 0 XP, level up every 200 XP.

**Step 1: Create the page**

```typescript
// src/app/(app)/settings/achievements/page.tsx
'use client'

import { achievements, type AchievementDef } from '@/data/achievements'
import { useAppStore } from '@/stores/app-store'
import {
  Trophy, Fire, Play, CheckCircle, Barbell, Pill, Ruler,
  TrendUp, Star, Moon, Target, Crown, Lock,
} from '@phosphor-icons/react'

const iconMap: Record<string, React.ComponentType<{ size: number; weight: string; style?: React.CSSProperties }>> = {
  Fire, Trophy, Play, CheckCircle, Barbell, Pill, Ruler, TrendUp, Star, Moon, Target, Crown,
}

function getLevel(xp: number): { level: number; currentXP: number; nextLevelXP: number } {
  const level = Math.floor(xp / 200) + 1
  const currentXP = xp % 200
  return { level, currentXP, nextLevelXP: 200 }
}

function AchievementCard({ def, unlocked }: { def: AchievementDef; unlocked: number | null }) {
  const isUnlocked = unlocked !== null
  const Icon = iconMap[def.icon] || Trophy

  return (
    <div style={{
      padding: 16,
      borderRadius: 'var(--radius-lg)',
      backgroundColor: isUnlocked ? 'var(--color-surface)' : 'var(--color-surface-alt)',
      border: `1px solid ${isUnlocked ? 'var(--color-primary)' : 'var(--color-border)'}`,
      opacity: isUnlocked ? 1 : 0.6,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 8,
      position: 'relative',
    }}>
      {!isUnlocked && (
        <Lock size={14} weight="bold" style={{
          position: 'absolute', top: 8, right: 8,
          color: 'var(--color-text-muted)',
        }} />
      )}
      <div style={{
        width: 48, height: 48,
        borderRadius: 'var(--radius-full)',
        backgroundColor: isUnlocked ? 'var(--color-primary-light)' : 'var(--color-surface-alt)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon
          size={24}
          weight="duotone"
          style={{ color: isUnlocked ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
        />
      </div>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        color: isUnlocked ? 'var(--color-text)' : 'var(--color-text-muted)',
      }}>
        {def.name}
      </span>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
        {def.description}
      </span>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: isUnlocked ? 'var(--color-accent)' : 'var(--color-text-muted)',
      }}>
        +{def.xp} XP
      </span>
      {isUnlocked && (
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          {new Date(unlocked).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
        </span>
      )}
    </div>
  )
}

export default function AchievementsPage() {
  const { unlockedAchievements, totalXP } = useAppStore()
  const { level, currentXP, nextLevelXP } = getLevel(totalXP)
  const unlockedCount = Object.keys(unlockedAchievements).length

  return (
    <div className="py-6" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Trophy size={28} weight="duotone" style={{ color: 'var(--color-accent)' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 600 }}>
            Достижения
          </h1>
        </div>
        <p className="mt-2" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          {unlockedCount} из {achievements.length} открыто
        </p>
      </div>

      {/* Level + XP bar */}
      <div style={{
        padding: 20,
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--color-accent)',
            }}>
              Ур. {level}
            </span>
          </div>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {totalXP} XP
          </span>
        </div>
        {/* Progress bar */}
        <div style={{
          height: 8, borderRadius: 4,
          backgroundColor: 'var(--color-surface-alt)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(currentXP / nextLevelXP) * 100}%`,
            borderRadius: 4,
            backgroundColor: 'var(--color-accent)',
            transition: 'width 0.6s ease',
          }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          {currentXP} / {nextLevelXP} XP до уровня {level + 1}
        </span>
      </div>

      {/* Badge grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12,
      }}>
        {achievements.map((def) => (
          <AchievementCard
            key={def.id}
            def={def}
            unlocked={unlockedAchievements[def.id] ?? null}
          />
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Add link from Settings page**

In `src/app/(app)/settings/page.tsx`, add a link card after Patient info block and before Theme section:

```typescript
// Add import at top:
import { Trophy, ArrowRight } from '@phosphor-icons/react'
import Link from 'next/link'

// Add after patient info block, before <SectionCard title="Тема">:
      {/* Achievements link */}
      <Link
        href="/settings/achievements"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-accent-light)',
          border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <Trophy size={24} weight="duotone" style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', display: 'block' }}>
            Достижения
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            Бейджи, XP, уровень
          </span>
        </div>
        <ArrowRight size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
      </Link>
```

**Step 3: Verify TypeScript + build**

Run: `cd /Users/clawdbot/projects/elbow-recovery && npx tsc --noEmit 2>&1 | head -20`
Run: `cd /Users/clawdbot/projects/elbow-recovery && npm run build 2>&1 | tail -20`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/app/\(app\)/settings/achievements/page.tsx src/app/\(app\)/settings/page.tsx
git commit -m "feat: achievements page — badge grid, XP/level bar, link from settings"
```

---

## Task 6: Streak Freeze in DayCounter + useStreak

**Files:**
- Modify: `src/hooks/use-streak.ts`
- Modify: `src/components/dashboard/day-counter.tsx`

**What it does:** When streak would break (yesterday had no sessions, today has none yet), check if user has a streak freeze available. If yes, show "Стрик заморожен" indicator instead of 0. The freeze is auto-consumed on first dashboard visit of the broken day.

**Step 1: Modify useStreak**

Add `frozenYesterday` return value:

```typescript
// In use-streak.ts, modify the useMemo return to include frozenYesterday

// After computing streak, add:
// Check if streak would have broken yesterday (no session) but today hasn't started yet
const yesterday = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
})()
const hadYesterday = activeDates.has(yesterday)
const hadToday = activeDates.has(today)
const frozenYesterday = !hadYesterday && !hadToday && streak === 0

return { streak, totalSessions, activeDays, frozenYesterday }
```

**Step 2: Modify DayCounter**

In `day-counter.tsx`, add streak freeze logic:

```typescript
// Add import:
import { useAppStore } from '@/stores/app-store'
import { Snowflake } from '@phosphor-icons/react'

// Inside DayCounter component, add:
const { streakFreezes, useStreakFreeze } = useAppStore()
const { streak, totalSessions, frozenYesterday } = useStreak()

// After useStreak call, add auto-freeze effect:
import { useEffect, useRef } from 'react'

const freezeUsed = useRef(false)
useEffect(() => {
  if (frozenYesterday && streakFreezes > 0 && !freezeUsed.current) {
    freezeUsed.current = true
    useStreakFreeze()
  }
}, [frozenYesterday, streakFreezes, useStreakFreeze])

const isFrozen = frozenYesterday && freezeUsed.current
const displayStreak = isFrozen ? streak + 1 : streak  // restore the visual streak
```

In the JSX where the streak icon is rendered, show Snowflake icon when frozen:

```typescript
{isFrozen ? (
  <Snowflake size={18} weight="fill" style={{ color: 'var(--color-info)' }} />
) : (
  <Fire size={18} weight="fill"
    style={{ color: streak > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}
  />
)}
```

And below the streak number, if frozen:
```typescript
{isFrozen && (
  <span style={{ fontSize: 9, color: 'var(--color-info)', fontWeight: 500 }}>
    заморожен
  </span>
)}
```

And show freeze availability indicator:
```typescript
{!isFrozen && streakFreezes > 0 && (
  <span style={{ fontSize: 9, color: 'var(--color-info)' }}>
    <Snowflake size={10} weight="fill" style={{ display: 'inline', verticalAlign: 'middle' }} /> ×{streakFreezes}
  </span>
)}
```

**Step 3: Verify TypeScript**

Run: `cd /Users/clawdbot/projects/elbow-recovery && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/hooks/use-streak.ts src/components/dashboard/day-counter.tsx
git commit -m "feat: streak freeze — auto-consume on broken day, snowflake indicator"
```

---

## Task 7: Achievement toast notification

**Files:**
- Create: `src/components/dashboard/achievement-toast.tsx`
- Modify: `src/app/(app)/page.tsx`

**What it does:** When a new achievement is unlocked, show a celebratory toast at the top of the screen with confetti-style animation. Auto-dismiss after 4 seconds.

**Step 1: Create the toast component**

```typescript
// src/components/dashboard/achievement-toast.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/stores/app-store'
import { getAchievementById } from '@/data/achievements'
import { Confetti } from '@phosphor-icons/react'
import { haptic } from '@/lib/haptic'

export function AchievementToast() {
  const { unlockedAchievements } = useAppStore()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<{ name: string; xp: number } | null>(null)
  const prevCountRef = useRef(Object.keys(unlockedAchievements).length)

  useEffect(() => {
    const keys = Object.keys(unlockedAchievements)
    const currentCount = keys.length

    if (currentCount > prevCountRef.current) {
      // Find the newest achievement (highest timestamp)
      let newestId = ''
      let newestTime = 0
      for (const [id, ts] of Object.entries(unlockedAchievements)) {
        if (ts > newestTime) { newestTime = ts; newestId = id }
      }

      const def = getAchievementById(newestId)
      if (def) {
        setCurrent({ name: def.name, xp: def.xp })
        setVisible(true)
        haptic('heavy')

        const timer = setTimeout(() => setVisible(false), 4000)
        prevCountRef.current = currentCount
        return () => clearTimeout(timer)
      }
    }

    prevCountRef.current = currentCount
  }, [unlockedAchievements])

  if (!visible || !current) return null

  return (
    <div style={{
      position: 'fixed',
      top: 'calc(12px + env(safe-area-inset-top, 0px))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 300,
      animation: 'slide-up 0.4s ease-out',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 20px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-accent)',
        color: '#fff',
        boxShadow: 'var(--shadow-lg)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        <Confetti size={20} weight="fill" />
        <span>{current.name}</span>
        <span style={{ opacity: 0.8, fontWeight: 400 }}>+{current.xp} XP</span>
      </div>
    </div>
  )
}
```

**Step 2: Wire into dashboard**

In `src/app/(app)/page.tsx`, add:

```typescript
import { AchievementToast } from '@/components/dashboard/achievement-toast'

// Inside return, after <AchievementWatcher />:
<AchievementToast />
```

**Step 3: Verify TypeScript + Build**

Run: `cd /Users/clawdbot/projects/elbow-recovery && npx tsc --noEmit && npm run build 2>&1 | tail -10`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/dashboard/achievement-toast.tsx src/app/\(app\)/page.tsx
git commit -m "feat: achievement toast — confetti notification on badge unlock"
```

---

## Task 8: Final build, push, verify

**Step 1: Full build**

```bash
cd /Users/clawdbot/projects/elbow-recovery
npm run build 2>&1 | tail -20
```
Expected: All routes build successfully.

**Step 2: Push to Vercel**

```bash
git push origin main
```

**Step 3: Verify deployment**

Wait 2-3 minutes for Vercel auto-deploy. Open `elbow-recovery.vercel.app` — verify:
- Recovery Score card appears at top of dashboard
- Streak freeze indicator shows
- Achievement toast fires on unlocking
- `/settings/achievements` page loads with badge grid

---

## Summary of deliverables

| # | File | Type | Description |
|---|---|---|---|
| 1 | `src/hooks/use-recovery-score.ts` | Create | 0-100 daily score hook |
| 2 | `src/components/dashboard/recovery-score.tsx` | Create | Circular progress ring + breakdown |
| 3 | `src/data/achievements.ts` | Create | 15 badge definitions |
| 4 | `src/stores/app-store.ts` | Modify | +achievements +streakFreeze +XP state |
| 5 | `src/hooks/use-achievement-checker.ts` | Create | Auto-unlock logic |
| 6 | `src/components/dashboard/achievement-watcher.tsx` | Create | Thin client wrapper |
| 7 | `src/components/dashboard/achievement-toast.tsx` | Create | Confetti toast on unlock |
| 8 | `src/app/(app)/settings/achievements/page.tsx` | Create | Full badge grid page |
| 9 | `src/app/(app)/settings/page.tsx` | Modify | +achievements link |
| 10 | `src/app/(app)/page.tsx` | Modify | +RecoveryScore +Watcher +Toast |
| 11 | `src/hooks/use-streak.ts` | Modify | +frozenYesterday |
| 12 | `src/components/dashboard/day-counter.tsx` | Modify | +streak freeze UI |
