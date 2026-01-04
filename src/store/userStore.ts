// src/store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserSettings, UserStats, Locale } from '@/types';

interface UserState {
  profile: UserProfile | null;
  isOnboarded: boolean;
  
  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: Locale) => void;
  setWeekStartsOn: (day: 0 | 1) => void;
  toggleNotifications: () => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  
  // Profile actions
  updateProfile: (profile: Partial<UserProfile>) => void;
  setOnboarded: (value: boolean) => void;
  
  // Stats actions
  updateStats: (stats: Partial<UserStats>) => void;
  incrementCompletedTasks: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'ru',
  notifications: true,
  soundEnabled: true,
  hapticEnabled: true,
  defaultPriority: 'medium',
  defaultCategory: 'personal',
  weekStartsOn: 1, // Monday
};

const defaultStats: UserStats = {
  totalTasks: 0,
  completedTasks: 0,
  streak: 0,
  longestStreak: 0,
  tasksCompletedToday: 0,
  tasksCompletedThisWeek: 0,
  tasksCompletedThisMonth: 0,
};

const defaultProfile: UserProfile = {
  id: '',
  name: 'Пользователь',
  createdAt: new Date().toISOString(),
  settings: defaultSettings,
  stats: defaultStats,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      isOnboarded: false,
      
      updateSettings: (newSettings) => {
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                settings: { ...state.profile.settings, ...newSettings },
              }
            : null,
        }));
      },
      
      setTheme: (theme) => {
        const { updateSettings } = get();
        updateSettings({ theme });
        
        // Apply theme to DOM
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          root.classList.remove('light', 'dark');
          
          if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.add(prefersDark ? 'dark' : 'light');
          } else {
            root.classList.add(theme);
          }
        }
      },
      
      setLanguage: (language) => {
        get().updateSettings({ language });
      },
      
      setWeekStartsOn: (day) => {
        get().updateSettings({ weekStartsOn: day });
      },
      
      toggleNotifications: () => {
        const current = get().profile?.settings.notifications ?? true;
        get().updateSettings({ notifications: !current });
      },
      
      toggleSound: () => {
        const current = get().profile?.settings.soundEnabled ?? true;
        get().updateSettings({ soundEnabled: !current });
      },
      
      toggleHaptic: () => {
        const current = get().profile?.settings.hapticEnabled ?? true;
        get().updateSettings({ hapticEnabled: !current });
      },
      
      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
      },
      
      setOnboarded: (value) => {
        set({ isOnboarded: value });
      },
      
      updateStats: (newStats) => {
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                stats: { ...state.profile.stats, ...newStats },
              }
            : null,
        }));
      },
      
      incrementCompletedTasks: () => {
        set((state) => {
          if (!state.profile) return state;
          
          const stats = state.profile.stats;
          const newStreak = stats.streak + 1;
          
          return {
            profile: {
              ...state.profile,
              stats: {
                ...stats,
                completedTasks: stats.completedTasks + 1,
                tasksCompletedToday: stats.tasksCompletedToday + 1,
                tasksCompletedThisWeek: stats.tasksCompletedThisWeek + 1,
                tasksCompletedThisMonth: stats.tasksCompletedThisMonth + 1,
                streak: newStreak,
                longestStreak: Math.max(stats.longestStreak, newStreak),
              },
            },
          };
        });
      },
    }),
    {
      name: 'taskflow-user',
    }
  )
);

// Initialize theme on client
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('taskflow-user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const theme = parsed?.state?.profile?.settings?.theme || 'system';
      const root = document.documentElement;
      
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(prefersDark ? 'dark' : 'light');
      } else {
        root.classList.add(theme);
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
    }
  }
}