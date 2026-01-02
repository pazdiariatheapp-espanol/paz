import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      
      // Language
      language: 'en',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set((state) => ({ 
        language: state.language === 'en' ? 'es' : 'en' 
      })),
      
      // Subscription
      subscription: 'free', // 'free', 'premium', 'premium_plus'
      setSubscription: (subscription) => set({ subscription }),
      showAds: () => get().subscription !== 'premium_plus',
      
      // Mood entries (local cache)
      moodEntries: [],
      setMoodEntries: (entries) => set({ moodEntries: entries }),
      addMoodEntry: (entry) => set((state) => ({
        moodEntries: [entry, ...state.moodEntries]
      })),
      
      // Journal entries (local cache)
      journalEntries: [],
      setJournalEntries: (entries) => set({ journalEntries: entries }),
      addJournalEntry: (entry) => set((state) => ({
        journalEntries: [entry, ...state.journalEntries]
      })),
      
      // UI state
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      
      // Notifications
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      
      // Sound
      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      
      // Theme
      theme: 'dark', // 'dark', 'light', 'ocean', 'sunset', 'forest'
      setTheme: (theme) => set({ theme }),
      
      // Streak
      streak: 0,
      setStreak: (streak) => set({ streak }),
      
      // Onboarding
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),
      
      // Today's mood
      todayMood: null,
      setTodayMood: (mood) => set({ todayMood: mood }),
    }),
    {
      name: 'paz-storage',
      partialize: (state) => ({
        language: state.language,
        subscription: state.subscription,
        notificationsEnabled: state.notificationsEnabled,
        soundEnabled: state.soundEnabled,
        theme: state.theme,
        streak: state.streak,
        hasSeenOnboarding: state.hasSeenOnboarding,
      })
    }
  )
)
