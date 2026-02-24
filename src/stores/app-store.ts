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
  setTheme: (theme: AppState['theme']) => void
  setOnboardingDone: () => void
  setSurgeryDate: (date: string) => void
  setNotificationsEnabled: (enabled: boolean) => void
  toggleNotificationCategory: (cat: keyof AppState['notificationCategories']) => void
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
