import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AppState {
  theme: 'light' | 'dark' | 'system'
  onboardingDone: boolean
  surgeryDate: string | null  // null = use default from patient.ts
  notificationsEnabled: boolean
  notificationCategories: {
    sessions: boolean
    supplements: boolean
    sleep: boolean
    rom: boolean
  }
  // Gamification
  unlockedAchievements: Record<string, number>  // { achievementId: unlockedTimestamp }
  streakFreezes: number                         // available freezes (max 1)
  totalXP: number
  setTheme: (theme: AppState['theme']) => void
  setOnboardingDone: () => void
  setSurgeryDate: (date: string) => void
  setNotificationsEnabled: (enabled: boolean) => void
  toggleNotificationCategory: (cat: keyof AppState['notificationCategories']) => void
  unlockAchievement: (id: string, xp: number) => void
  useStreakFreeze: () => boolean
  replenishStreakFreeze: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      onboardingDone: false,
      surgeryDate: null,
      notificationsEnabled: false,
      notificationCategories: {
        sessions: true,
        supplements: true,
        sleep: true,
        rom: true,
      },
      // Gamification
      unlockedAchievements: {},
      streakFreezes: 0,
      totalXP: 0,
      setTheme: (theme) => set({ theme }),
      setOnboardingDone: () => set({ onboardingDone: true }),
      setSurgeryDate: (date) => set({ surgeryDate: date }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      toggleNotificationCategory: (cat) =>
        set((state) => ({
          notificationCategories: {
            ...state.notificationCategories,
            [cat]: !state.notificationCategories[cat],
          },
        })),
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
    }),
    {
      name: 'elbow-recovery-settings',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
    }
  )
)
