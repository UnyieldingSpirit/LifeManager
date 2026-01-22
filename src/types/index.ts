// src/types/index.ts
// ============================================================================
// LIFELEDGER - ЕДИНЫЙ ФАЙЛ ТИПОВ
// ============================================================================

// ============================================================================
// БАЗОВЫЕ ТИПЫ
// ============================================================================

export type Locale = 'ru' | 'en' | 'uz';
export type ThemeMode = 'light' | 'dark' | 'system';
export type CurrencyCode = 'UZS' | 'RUB' | 'USD' | 'EUR' | 'KZT';
export type EnabledModule = 'finance' | 'tasks' | 'events' | 'habits' | 'notes' | 'contacts';
export type TransactionType = 'income' | 'expense';
export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

// ============================================================================
// ФИНАНСЫ
// ============================================================================

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  time?: string;
  linkedEventId?: string;
  linkedTaskId?: string;
  linkedContactId?: string;
  linkedHabitId?: string;
  isRecurring: boolean;
  recurringRule?: RecurringRule;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  icon: string;
  color: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  priority: Priority;
  linkedTransactions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  name: string;
  type: 'credit' | 'loan' | 'mortgage' | 'lent' | 'borrowed';
  direction: 'i_owe' | 'owe_me';
  totalAmount: number;
  remainingAmount: number;
  currency: CurrencyCode;
  interestRate?: number;
  monthlyPayment?: number;
  contactId?: string;
  contactName?: string;
  startDate: string;
  dueDate?: string;
  nextPaymentDate?: string;
  notes?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly';
  color: string;
}

// ============================================================================
// ЗАДАЧИ
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  dueTime?: string;
  projectId?: string;
  checklist?: ChecklistItem[];
  tags?: string[];
  linkedEventId?: string;
  linkedTransactionId?: string;
  linkedContactId?: string;
  expectedCost?: number;
  isRecurring: boolean;
  recurringRule?: RecurringRule;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  deadline?: string;
  budget?: number;
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// ============================================================================
// СОБЫТИЯ
// ============================================================================

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  type: 'meeting' | 'birthday' | 'reminder' | 'deadline' | 'trip' | 'other';
  color: string;
  icon?: string;
  location?: string;
  linkedContactId?: string;
  linkedTaskId?: string;
  linkedTransactionId?: string;
  expectedCost?: number;
  reminders?: number[];
  isRecurring: boolean;
  recurringRule?: RecurringRule;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ПРИВЫЧКИ
// ============================================================================

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  goalType: 'binary' | 'count' | 'duration' | 'quantity';
  goalValue: number;
  goalUnit?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  daysOfWeek?: number[];
  reminderTime?: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  linkedTransactionCategory?: string;
  costPerUnit?: number;
  habitType: 'build' | 'break';
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  value: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

// ============================================================================
// ЗАМЕТКИ
// ============================================================================

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'checklist' | 'voice';
  folderId?: string;
  isPinned: boolean;
  color?: string;
  tags?: string[];
  checklist?: ChecklistItem[];
  linkedEventId?: string;
  linkedTaskId?: string;
  linkedContactId?: string;
  linkedProjectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentId?: string;
  noteIds: string[];
  createdAt: string;
}

// ============================================================================
// КОНТАКТЫ
// ============================================================================

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  group: 'family' | 'friends' | 'work' | 'business' | 'other';
  isFavorite: boolean;
  birthday?: string;
  birthdayReminders?: number[];
  linkedEventIds: string[];
  linkedTransactionIds: string[];
  linkedNoteIds: string[];
  owesMe: number;
  iOwe: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ОБЩИЕ ТИПЫ
// ============================================================================

export interface RecurringRule {
  type: RepeatType;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  endDate?: string;
  occurrences?: number;
}

// ============================================================================
// НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ
// ============================================================================

export interface UserSettings {
  theme: ThemeMode;
  language: Locale;
  notifications: boolean;
  notificationFrequency: 'all' | 'important' | 'minimal' | 'off';
  soundEnabled: boolean;
  hapticEnabled: boolean;
  weekStartsOn: 0 | 1;
  enabledModules: EnabledModule[];
}

export interface UserFinance {
  currency: string;
  initialBalance: number;
  monthlyBudget: number;
  salaryDay: number;
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
  totalExpenses: number;
  totalIncome: number;
  currentBalance: number;
}

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  birthday?: string;
  avatar?: string;
  telegramId?: number;
  lifestyle: 'single' | 'couple' | 'family' | 'roommates' | '';
  createdAt: string;
  settings: UserSettings;
  finance: UserFinance;
  stats: UserStats;
}

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
  notifications: 'all' | 'important' | 'minimal' | 'off';
  enabledModules: EnabledModule[];
}

// ============================================================================
// UI ТИПЫ
// ============================================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface BottomSheetState {
  isOpen: boolean;
  content: 'add-transaction' | 'add-task' | 'add-event' | 'add-habit' | 'add-note' | 'add-contact' | 'quick-add' | null;
}

// ============================================================================
// ФИЛЬТРЫ
// ============================================================================

export interface TransactionFilters {
  type: TransactionType | 'all';
  category: string;
  dateRange?: { start: string; end: string };
  searchQuery: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TaskFilters {
  status: 'all' | 'active' | 'completed' | 'overdue';
  priority: Priority | 'all';
  projectId: string | 'all';
  dateRange?: { start: string; end: string };
  searchQuery: string;
}

// ============================================================================
// TELEGRAM TYPES
// ============================================================================

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    chat?: unknown;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}