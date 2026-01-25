import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      language: 'en',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set((state) => ({ 
        language: state.language === 'en' ? 'es' : 'en' 
      })),
      subscription: 'free',
      setSubscription: (subscription) => set({ subscription }),
      showAds: () => get().subscription !== 'premium_plus',
      trialStartDate: null,
      setTrialStartDate: (date) => set({ trialStartDate: date }),
      aiChatConversationCount: 0,
      setAIChatConversationCount: (count) => set({ aiChatConversationCount: count }),
      incrementAIChatConversationCount: () => set((state) => ({
        aiChatConversationCount: state.aiChatConversationCount + 1
      })),
      isTrialExpired: () => {
        const { trialStartDate } = get()
        if (!trialStartDate) {
          set({ trialStartDate: new Date().getTime() })
          return false
        }
        const now = new Date().getTime()
        const threeDAysMs = 3 * 24 * 60 * 60 * 1000
        return (now - trialStartDate) > threeDAysMs
      },
      isFreeChatLimitExceeded: () => {
        const { subscription, aiChatConversationCount, isTrialExpired } = get()
        if (subscription !== 'free') return false
        if (isTrialExpired()) return true
        return aiChatConversationCount >= 2
      },
      shouldShowPremiumModal: () => {
        const { subscription, isFreeChatLimitExceeded } = get()
        return subscription === 'free' && isFreeChatLimitExceeded()
      },
      aiChatMessages: [],
      setAIChatMessages: (messages) => set({ aiChatMessages: messages }),
      addAIChatMessage: (message) => set((state) => ({
        aiChatMessages: [...state.aiChatMessages, message]
      })),
      clearAIChatMessages: () => set({ aiChatMessages: [] }),
      moodEntries: [],
      setMoodEntries: (entries) => set({ moodEntries: entries }),
      addMoodEntry: (entry) => set((state) => ({
        moodEntries: [entry, ...state.moodEntries]
      })),
      journalEntries: [],
      setJournalEntries: (entries) => set({ journalEntries: entries }),
      addJournalEntry: (entry) => set((state) => ({
        journalEntries: [entry, ...state.journalEntries]
      })),
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      streak: 0,
      setStreak: (streak) => set({ streak }),
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),
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
        trialStartDate: state.trialStartDate,
        aiChatConversationCount: state.aiChatConversationCount,
        aiChatMessages: state.aiChatMessages,
      })
    }
  )
)