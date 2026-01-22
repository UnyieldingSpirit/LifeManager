// src/store/index.ts
// ============================================================================
// LIFELEDGER - ЕДИНЫЙ СТОР (Zustand)
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  UserProfile,
  UserSettings,
  UserFinance,
  UserStats,
  OnboardingFormData,
  Transaction,
  TransactionFilters,
  TransactionType,
  Task,
  Project,
  Event,
  Habit,
  HabitLog,
  Note,
  NoteFolder,
  Contact,
  SavingGoal,
  Debt,
  Toast,
  BottomSheetState,
  EnabledModule,
  ThemeMode,
  Locale,
} from '@/types';
import { generateId, getStartOfMonth, getEndOfMonth, isWithinPeriod } from '@/lib';

// ============================================================================
// ТИПЫ СТОРА
// ============================================================================

interface AppState {
  // ========== USER ==========
  profile: UserProfile | null;
  isOnboarded: boolean;
  
  // User Actions
  updateSettings: (settings: Partial<UserSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Locale) => void;
  setWeekStartsOn: (day: 0 | 1) => void;
  toggleNotifications: () => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  updateFinance: (finance: Partial<UserFinance>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  updateBalance: (amount: number, type: 'income' | 'expense') => void;
  saveOnboardingData: (data: OnboardingFormData) => void;
  setOnboarded: (value: boolean) => void;
  
  // ========== TRANSACTIONS ==========
  transactions: Transaction[];
  transactionFilters: TransactionFilters;
  
  // Transaction Actions
  addTransaction: (input: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setTransactionFilters: (filters: Partial<TransactionFilters>) => void;
  clearTransactionFilters: () => void;
  
  // Transaction Getters
  getFilteredTransactions: () => Transaction[];
  getSpentThisMonth: () => number;
  getIncomeThisMonth: () => number;
  
  // ========== GOALS ==========
  goals: SavingGoal[];
  
  addGoal: (input: Omit<SavingGoal, 'id' | 'createdAt' | 'updatedAt'>) => SavingGoal;
  updateGoal: (id: string, updates: Partial<SavingGoal>) => void;
  deleteGoal: (id: string) => void;
  addToGoal: (id: string, amount: number) => void;
  
  // ========== DEBTS ==========
  debts: Debt[];
  
  addDebt: (input: Omit<Debt, 'id'>) => Debt;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  
  // ========== TASKS ==========
  tasks: Task[];
  projects: Project[];
  
  addTask: (input: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  
  addProject: (input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // ========== EVENTS ==========
  events: Event[];
  
  addEvent: (input: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Event;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventsByDate: (date: string) => Event[];
  
  // ========== HABITS ==========
  habits: Habit[];
  habitLogs: HabitLog[];
  
  addHabit: (input: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'currentStreak' | 'longestStreak' | 'totalCompletions'>) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  logHabit: (habitId: string, value: number, date?: string) => void;
  getHabitLogsForDate: (habitId: string, date: string) => HabitLog[];
  
  // ========== NOTES ==========
  notes: Note[];
  noteFolders: NoteFolder[];
  
  addNote: (input: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  addNoteFolder: (input: Omit<NoteFolder, 'id' | 'createdAt'>) => NoteFolder;
  updateNoteFolder: (id: string, updates: Partial<NoteFolder>) => void;
  deleteNoteFolder: (id: string) => void;
  
  // ========== CONTACTS ==========
  contacts: Contact[];
  
  addContact: (input: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  
  // ========== UI ==========
  toasts: Toast[];
  bottomSheet: BottomSheetState;
  isLoading: boolean;
  
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  openBottomSheet: (content: BottomSheetState['content']) => void;
  closeBottomSheet: () => void;
  setLoading: (loading: boolean) => void;
  
  // ========== RESET ==========
  resetStore: () => void;
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
  enabledModules: ['finance'],
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

const defaultTransactionFilters: TransactionFilters = {
  type: 'all',
  category: 'all',
  dateRange: undefined,
  searchQuery: '',
};

// ============================================================================
// СТОР
// ============================================================================

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ========== USER STATE ==========
      profile: defaultProfile,
      isOnboarded: false,
      
      updateSettings: (newSettings) => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, settings: { ...state.profile.settings, ...newSettings } }
            : null,
        }));
      },
      
      setTheme: (theme) => {
        get().updateSettings({ theme });
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
      
      updateFinance: (newFinance) => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, finance: { ...state.profile.finance, ...newFinance } }
            : null,
        }));
      },
      
      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
      },
      
      updateStats: (newStats) => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, stats: { ...state.profile.stats, ...newStats } }
            : null,
        }));
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
      
      setOnboarded: (value) => {
        set({ isOnboarded: value });
      },
      
      saveOnboardingData: (data) => {
        const {
          name, phone, birthday, language, theme, currency,
          initialBalance, monthlyBudget, salaryDay,
          expenseCategories, incomeCategories, goals,
          lifestyle, notifications, enabledModules
        } = data;
        
        set((state) => ({
          profile: {
            ...defaultProfile,
            ...state.profile,
            id: state.profile?.id || generateId('user'),
            name,
            phone,
            birthday,
            lifestyle,
            createdAt: state.profile?.createdAt || new Date().toISOString(),
            settings: {
              ...defaultSettings,
              language,
              theme,
              notificationFrequency: notifications,
              notifications: notifications !== 'off',
              enabledModules: enabledModules.length > 0 ? enabledModules : ['finance'],
            },
            finance: {
              ...defaultFinance,
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
              currentBalance: initialBalance,
            },
          },
          isOnboarded: true,
        }));
        
        get().setTheme(theme);
      },
      
      // ========== TRANSACTIONS ==========
      transactions: [],
      transactionFilters: defaultTransactionFilters,
      
      addTransaction: (input) => {
        const now = new Date().toISOString();
        const newTransaction: Transaction = {
          ...input,
          id: generateId('txn'),
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
        
        // Обновляем баланс
        const { profile } = get();
        if (profile) {
          const stats = profile.stats;
          const newBalance = input.type === 'income'
            ? stats.currentBalance + input.amount
            : stats.currentBalance - input.amount;
          
          get().updateStats({
            currentBalance: newBalance,
            totalIncome: input.type === 'income' ? stats.totalIncome + input.amount : stats.totalIncome,
            totalExpenses: input.type === 'expense' ? stats.totalExpenses + input.amount : stats.totalExpenses,
          });
        }
        
        return newTransaction;
      },
      
      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },
      
      deleteTransaction: (id) => {
        const transaction = get().transactions.find(t => t.id === id);
        if (transaction) {
          const { profile } = get();
          if (profile) {
            const stats = profile.stats;
            const newBalance = transaction.type === 'income'
              ? stats.currentBalance - transaction.amount
              : stats.currentBalance + transaction.amount;
            
            get().updateStats({
              currentBalance: newBalance,
              totalIncome: transaction.type === 'income' ? stats.totalIncome - transaction.amount : stats.totalIncome,
              totalExpenses: transaction.type === 'expense' ? stats.totalExpenses - transaction.amount : stats.totalExpenses,
            });
          }
        }
        
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },
      
      setTransactionFilters: (filters) => {
        set((state) => ({
          transactionFilters: { ...state.transactionFilters, ...filters },
        }));
      },
      
      clearTransactionFilters: () => {
        set({ transactionFilters: defaultTransactionFilters });
      },
      
      getFilteredTransactions: () => {
        const { transactions, transactionFilters } = get();
        return transactions.filter((t) => {
          if (transactionFilters.type !== 'all' && t.type !== transactionFilters.type) return false;
          if (transactionFilters.category !== 'all' && t.category !== transactionFilters.category) return false;
          if (transactionFilters.dateRange) {
            if (!isWithinPeriod(t.date, transactionFilters.dateRange.start, transactionFilters.dateRange.end)) return false;
          }
          if (transactionFilters.searchQuery) {
            const query = transactionFilters.searchQuery.toLowerCase();
            if (!t.description.toLowerCase().includes(query) && !t.category.toLowerCase().includes(query)) return false;
          }
          return true;
        });
      },
      
      getSpentThisMonth: () => {
        const { transactions } = get();
        const start = getStartOfMonth();
        const end = getEndOfMonth();
        return transactions
          .filter((t) => t.type === 'expense' && isWithinPeriod(t.date, start, end))
          .reduce((sum, t) => sum + t.amount, 0);
      },
      
      getIncomeThisMonth: () => {
        const { transactions } = get();
        const start = getStartOfMonth();
        const end = getEndOfMonth();
        return transactions
          .filter((t) => t.type === 'income' && isWithinPeriod(t.date, start, end))
          .reduce((sum, t) => sum + t.amount, 0);
      },
      
      // ========== GOALS ==========
      goals: [],
      
      addGoal: (input) => {
        const now = new Date().toISOString();
        const newGoal: SavingGoal = {
          ...input,
          id: generateId('goal'),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
        return newGoal;
      },
      
      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
          ),
        }));
      },
      
      deleteGoal: (id) => {
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
      },
      
      addToGoal: (id, amount) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, currentAmount: g.currentAmount + amount, updatedAt: new Date().toISOString() } : g
          ),
        }));
      },
      
      // ========== DEBTS ==========
      debts: [],
      
      addDebt: (input) => {
        const newDebt: Debt = { ...input, id: generateId('debt') };
        set((state) => ({ debts: [...state.debts, newDebt] }));
        return newDebt;
      },
      
      updateDebt: (id, updates) => {
        set((state) => ({
          debts: state.debts.map((d) => d.id === id ? { ...d, ...updates } : d),
        }));
      },
      
      deleteDebt: (id) => {
        set((state) => ({ debts: state.debts.filter((d) => d.id !== id) }));
      },
      
      // ========== TASKS ==========
      tasks: [],
      projects: [],
      
      addTask: (input) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          ...input,
          id: generateId('task'),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
        get().updateStats({ totalTasks: (get().profile?.stats.totalTasks || 0) + 1 });
        return newTask;
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },
      
      toggleTaskComplete: (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (task) {
          const completed = !task.completed;
          get().updateTask(id, {
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          });
          
          if (completed) {
            const stats = get().profile?.stats;
            if (stats) {
              get().updateStats({
                completedTasks: stats.completedTasks + 1,
                tasksCompletedToday: stats.tasksCompletedToday + 1,
              });
            }
          }
        }
      },
      
      addProject: (input) => {
        const now = new Date().toISOString();
        const newProject: Project = {
          ...input,
          id: generateId('proj'),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        return newProject;
      },
      
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      
      deleteProject: (id) => {
        set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
      },
      
      // ========== EVENTS ==========
      events: [],
      
      addEvent: (input) => {
        const now = new Date().toISOString();
        const newEvent: Event = {
          ...input,
          id: generateId('evt'),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ events: [...state.events, newEvent] }));
        return newEvent;
      },
      
      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        }));
      },
      
      deleteEvent: (id) => {
        set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
      },
      
      getEventsByDate: (date) => {
        const { events } = get();
        const targetDate = new Date(date).toDateString();
        return events.filter((e) => new Date(e.date).toDateString() === targetDate);
      },
      
      // ========== HABITS ==========
      habits: [],
      habitLogs: [],
      
      addHabit: (input) => {
        const now = new Date().toISOString();
        const newHabit: Habit = {
          ...input,
          id: generateId('habit'),
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
        return newHabit;
      },
      
      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h
          ),
        }));
      },
      
      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          habitLogs: state.habitLogs.filter((l) => l.habitId !== id),
        }));
      },
      
      logHabit: (habitId, value, date) => {
        const logDate = date || new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();
        
        const existingLog = get().habitLogs.find(
          (l) => l.habitId === habitId && l.date === logDate
        );
        
        if (existingLog) {
          set((state) => ({
            habitLogs: state.habitLogs.map((l) =>
              l.id === existingLog.id ? { ...l, value, completed: true } : l
            ),
          }));
        } else {
          const newLog: HabitLog = {
            id: generateId('hlog'),
            habitId,
            date: logDate,
            value,
            completed: true,
            createdAt: now,
          };
          set((state) => ({ habitLogs: [...state.habitLogs, newLog] }));
        }
        
        // Обновляем streak
        const habit = get().habits.find((h) => h.id === habitId);
        if (habit) {
          const newStreak = habit.currentStreak + 1;
          get().updateHabit(habitId, {
            currentStreak: newStreak,
            longestStreak: Math.max(habit.longestStreak, newStreak),
            totalCompletions: habit.totalCompletions + 1,
          });
        }
      },
      
      getHabitLogsForDate: (habitId, date) => {
        return get().habitLogs.filter((l) => l.habitId === habitId && l.date === date);
      },
      
      // ========== NOTES ==========
      notes: [],
      noteFolders: [],
      
      addNote: (input) => {
        const now = new Date().toISOString();
        const newNote: Note = {
          ...input,
          id: generateId('note'),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
        return newNote;
      },
      
      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        }));
      },
      
      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
      },
      
      addNoteFolder: (input) => {
        const newFolder: NoteFolder = {
          ...input,
          id: generateId('folder'),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ noteFolders: [...state.noteFolders, newFolder] }));
        return newFolder;
      },
      
      updateNoteFolder: (id, updates) => {
        set((state) => ({
          noteFolders: state.noteFolders.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        }));
      },
      
      deleteNoteFolder: (id) => {
        set((state) => ({ noteFolders: state.noteFolders.filter((f) => f.id !== id) }));
      },
      
      // ========== CONTACTS ==========
      contacts: [],
      
      addContact: (input) => {
        const now = new Date().toISOString();
        const newContact: Contact = {
          ...input,
          id: generateId('contact'),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ contacts: [...state.contacts, newContact] }));
        return newContact;
      },
      
      updateContact: (id, updates) => {
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },
      
      deleteContact: (id) => {
        set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) }));
      },
      
      // ========== UI ==========
      toasts: [],
      bottomSheet: { isOpen: false, content: null },
      isLoading: false,
      
      addToast: (toast) => {
        const newToast: Toast = { ...toast, id: generateId('toast') };
        set((state) => ({ toasts: [...state.toasts, newToast] }));
        
        // Автоудаление
        setTimeout(() => {
          get().removeToast(newToast.id);
        }, toast.duration || 3000);
      },
      
      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },
      
      openBottomSheet: (content) => {
        set({ bottomSheet: { isOpen: true, content } });
      },
      
      closeBottomSheet: () => {
        set({ bottomSheet: { isOpen: false, content: null } });
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      // ========== RESET ==========
      resetStore: () => {
        set({
          profile: null,
          isOnboarded: false,
          transactions: [],
          transactionFilters: defaultTransactionFilters,
          goals: [],
          debts: [],
          tasks: [],
          projects: [],
          events: [],
          habits: [],
          habitLogs: [],
          notes: [],
          noteFolders: [],
          contacts: [],
          toasts: [],
          bottomSheet: { isOpen: false, content: null },
          isLoading: false,
        });
        // Очищаем localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('lifeledger-store');
        }
      },
    }),
    {
      name: 'lifeledger-store',
      partialize: (state) => ({
        // Сохраняем только нужные данные
        profile: state.profile,
        isOnboarded: state.isOnboarded,
        transactions: state.transactions,
        goals: state.goals,
        debts: state.debts,
        tasks: state.tasks,
        projects: state.projects,
        events: state.events,
        habits: state.habits,
        habitLogs: state.habitLogs,
        notes: state.notes,
        noteFolders: state.noteFolders,
        contacts: state.contacts,
      }),
    }
  )
);

// ============================================================================
// СЕЛЕКТОРЫ (для оптимизации)
// ============================================================================

export const selectProfile = (state: AppState) => state.profile;
export const selectIsOnboarded = (state: AppState) => state.isOnboarded;
export const selectEnabledModules = (state: AppState) => state.profile?.settings.enabledModules || ['finance'];
export const selectCurrency = (state: AppState) => state.profile?.finance.currency || 'UZS';
export const selectLanguage = (state: AppState) => state.profile?.settings.language || 'ru';
export const selectTheme = (state: AppState) => state.profile?.settings.theme || 'dark';

export const selectTransactions = (state: AppState) => state.transactions;
export const selectRecentTransactions = (count: number) => (state: AppState) => state.transactions.slice(0, count);

export const selectTasks = (state: AppState) => state.tasks;
export const selectActiveTasks = (state: AppState) => state.tasks.filter(t => !t.completed);
export const selectCompletedTasks = (state: AppState) => state.tasks.filter(t => t.completed);
export const selectOverdueTasks = (state: AppState) => {
  const today = new Date().toISOString().split('T')[0];
  return state.tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today);
};

export const selectTodayTasks = (state: AppState) => {
  const today = new Date().toISOString().split('T')[0];
  return state.tasks.filter(t => t.dueDate === today);
};

export const selectEvents = (state: AppState) => state.events;
export const selectHabits = (state: AppState) => state.habits;
export const selectNotes = (state: AppState) => state.notes;
export const selectContacts = (state: AppState) => state.contacts;
export const selectGoals = (state: AppState) => state.goals;

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ ТЕМЫ
// ============================================================================

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('lifeledger-store');
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
      document.documentElement.classList.add('dark');
    }
  } else {
    document.documentElement.classList.add('dark');
  }
}

// ============================================================================
// ЭКСПОРТ ДЛЯ СОВМЕСТИМОСТИ
// ============================================================================

// Алиасы для совместимости со старым кодом
export const useUserStore = useStore;
export const useTransactionStore = useStore;
export const useTaskStore = useStore;
export const useGoalStore = useStore;
export const useEventStore = useStore;
export const useHabitStore = useStore;
export const useNoteStore = useStore;
export const useContactStore = useStore;
export const useUIStore = useStore;

// Экспорт типов для онбординга
export type { OnboardingFormData, EnabledModule, ThemeMode, Locale };