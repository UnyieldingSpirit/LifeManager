// src/store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Locale } from '@/types';

// ============================================================================
// ТИПЫ
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserSettings {
  theme: ThemeMode;
  language: Locale;
  notifications: boolean;
  notificationFrequency: 'daily' | 'weekly' | 'important' | 'off';
  soundEnabled: boolean;
  hapticEnabled: boolean;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

export interface UserFinance {
  currency: string;
  initialBalance: number;
  monthlyBudget: number;
  salaryDay: number; // 1-31
  expenseCategories: string[];
  incomeCategories: string[];
  goals: string[];
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  streak: number;
  longestStreak: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
  // Финансовая статистика
  totalExpenses: number;
  totalIncome: number;
  currentBalance: number;
}

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  birthday?: string; // ISO date string
  avatar?: string;
  telegramId?: number;
  lifestyle: 'single' | 'couple' | 'family' | 'roommates' | '';
  createdAt: string;
  settings: UserSettings;
  finance: UserFinance;
  stats: UserStats;
}

interface UserState {
  profile: UserProfile | null;
  isOnboarded: boolean;
  
  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Locale) => void;
  setWeekStartsOn: (day: 0 | 1) => void;
  setNotificationFrequency: (frequency: UserSettings['notificationFrequency']) => void;
  toggleNotifications: () => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  
  // Finance actions
  updateFinance: (finance: Partial<UserFinance>) => void;
  setCurrency: (currency: string) => void;
  setInitialBalance: (balance: number) => void;
  setMonthlyBudget: (budget: number) => void;
  setSalaryDay: (day: number) => void;
  setExpenseCategories: (categories: string[]) => void;
  setIncomeCategories: (categories: string[]) => void;
  setGoals: (goals: string[]) => void;
  
  // Profile actions
  updateProfile: (profile: Partial<UserProfile>) => void;
  setOnboarded: (value: boolean) => void;
  setLifestyle: (lifestyle: UserProfile['lifestyle']) => void;
  
  // Stats actions
  updateStats: (stats: Partial<UserStats>) => void;
  incrementCompletedTasks: () => void;
  updateBalance: (amount: number, type: 'income' | 'expense') => void;
  
  // Full onboarding save
  saveOnboardingData: (data: OnboardingFormData) => void;
}

// Данные формы онбординга
export interface OnboardingFormData {
  name: string;
  phone: string;
  birthday?: string;
  language: Locale;
  theme: ThemeMode;
  currency: string;
  initialBalance: number;
  monthlyBudget: number;
  salaryDay: number;
  expenseCategories: string[];
  incomeCategories: string[];
  goals: string[];
  lifestyle: UserProfile['lifestyle'];
  notifications: UserSettings['notificationFrequency'];
}

// ============================================================================
// ДЕФОЛТНЫЕ ЗНАЧЕНИЯ
// ============================================================================

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'ru',
  notifications: true,
  notificationFrequency: 'important',
  soundEnabled: true,
  hapticEnabled: true,
  weekStartsOn: 1,
};

const defaultFinance: UserFinance = {
  currency: 'UZS',
  initialBalance: 0,
  monthlyBudget: 0,
  salaryDay: 1,
  expenseCategories: [],
  incomeCategories: [],
  goals: [],
};

const defaultStats: UserStats = {
  totalTasks: 0,
  completedTasks: 0,
  streak: 0,
  longestStreak: 0,
  tasksCompletedToday: 0,
  tasksCompletedThisWeek: 0,
  tasksCompletedThisMonth: 0,
  totalExpenses: 0,
  totalIncome: 0,
  currentBalance: 0,
};

const defaultProfile: UserProfile = {
  id: '',
  name: '',
  phone: '',
  birthday: '',
  lifestyle: '',
  createdAt: new Date().toISOString(),
  settings: defaultSettings,
  finance: defaultFinance,
  stats: defaultStats,
};

// ============================================================================
// STORE
// ============================================================================

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      isOnboarded: false,
      
      // ========== SETTINGS ==========
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
      
      setNotificationFrequency: (frequency) => {
        get().updateSettings({ notificationFrequency: frequency });
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
      
      // ========== FINANCE ==========
      updateFinance: (newFinance) => {
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                finance: { ...state.profile.finance, ...newFinance },
              }
            : null,
        }));
      },
      
      setCurrency: (currency) => {
        get().updateFinance({ currency });
      },
      
      setInitialBalance: (balance) => {
        get().updateFinance({ initialBalance: balance });
        // Также обновляем текущий баланс в статистике
        get().updateStats({ currentBalance: balance });
      },
      
      setMonthlyBudget: (budget) => {
        get().updateFinance({ monthlyBudget: budget });
      },
      
      setSalaryDay: (day) => {
        get().updateFinance({ salaryDay: day });
      },
      
      setExpenseCategories: (categories) => {
        get().updateFinance({ expenseCategories: categories });
      },
      
      setIncomeCategories: (categories) => {
        get().updateFinance({ incomeCategories: categories });
      },
      
      setGoals: (goals) => {
        get().updateFinance({ goals });
      },
      
      // ========== PROFILE ==========
      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
      },
      
      setOnboarded: (value) => {
        set({ isOnboarded: value });
      },
      
      setLifestyle: (lifestyle) => {
        get().updateProfile({ lifestyle });
      },
      
      // ========== STATS ==========
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
      
      updateBalance: (amount, type) => {
        set((state) => {
          if (!state.profile) return state;
          
          const stats = state.profile.stats;
          const newBalance = type === 'income' 
            ? stats.currentBalance + amount 
            : stats.currentBalance - amount;
          
          return {
            profile: {
              ...state.profile,
              stats: {
                ...stats,
                currentBalance: newBalance,
                totalIncome: type === 'income' ? stats.totalIncome + amount : stats.totalIncome,
                totalExpenses: type === 'expense' ? stats.totalExpenses + amount : stats.totalExpenses,
              },
            },
          };
        });
      },
      
      // ========== ONBOARDING ==========
      saveOnboardingData: (data) => {
        const { 
          name, phone, birthday, language, theme, currency,
          initialBalance, monthlyBudget, salaryDay,
          expenseCategories, incomeCategories, goals,
          lifestyle, notifications 
        } = data;
        
        set((state) => ({
          profile: {
            ...defaultProfile,
            ...state.profile,
            id: state.profile?.id || crypto.randomUUID(),
            name,
            phone,
            birthday,
            lifestyle,
            createdAt: state.profile?.createdAt || new Date().toISOString(),
            settings: {
              ...defaultSettings,
              ...state.profile?.settings,
              language,
              theme,
              notificationFrequency: notifications,
              notifications: notifications !== 'off',
            },
            finance: {
              ...defaultFinance,
              ...state.profile?.finance,
              currency,
              initialBalance,
              monthlyBudget,
              salaryDay,
              expenseCategories,
              incomeCategories,
              goals,
            },
            stats: {
              ...defaultStats,
              ...state.profile?.stats,
              currentBalance: initialBalance,
            },
          },
          isOnboarded: true,
        }));
        
        // Apply theme
        get().setTheme(theme);
      },
    }),
    {
      name: 'lifeledger-user',
    }
  )
);

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ ТЕМЫ НА КЛИЕНТЕ
// ============================================================================

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('lifeledger-user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const theme = parsed?.state?.profile?.settings?.theme || 'dark';
      const root = document.documentElement;
      
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(prefersDark ? 'dark' : 'light');
      } else {
        root.classList.add(theme);
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
      document.documentElement.classList.add('dark');
    }
  } else {
    // По умолчанию тёмная тема для LifeLedger
    document.documentElement.classList.add('dark');
  }
}