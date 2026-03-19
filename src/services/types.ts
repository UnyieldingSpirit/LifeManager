// src/services/types.ts
// ============================================================================
// LIFELEDGER — API DTO ТИПЫ (точно по документации бэкенда)
// ============================================================================

// ─── Meta ────────────────────────────────────────────────────────────────────

export interface LocalizedMetaItem {
  id?: string;
  code?: string;
  icon?: string;
  color?: string;
  flag?: string;
  symbol?: string;
  label?: string;
  name?: string;
  labelI18n?: Record<string, string>;
  nameI18n?: Record<string, string>;
}

export interface BootstrapData {
  lang: 'ru' | 'uz';
  languages: Array<{ code: string; name: string; nativeName: string; flag: string }>;
  currencies: LocalizedMetaItem[];
  categories: {
    expense: LocalizedMetaItem[];
    income: LocalizedMetaItem[];
  };
  financialGoals: LocalizedMetaItem[];
  lifestyleOptions: LocalizedMetaItem[];
  notificationOptions: LocalizedMetaItem[];
}

// ─── User ────────────────────────────────────────────────────────────────────

export type Lifestyle = 'single' | 'couple' | 'family' | 'roommates' | '';
export type Theme = 'light' | 'dark' | 'system';
export type Lang = 'ru' | 'uz';
export type EnabledModule = 'finance' | 'tasks' | 'events' | 'habits' | 'notes' | 'contacts';
export type NotificationFrequency = 'all' | 'important' | 'minimal' | 'off';

export interface UserDto {
  id: string;
  telegramId: number;
  username: string;
  firstName: string;
  lastName: string;
  isOnboarded: boolean;
  profile: {
    name: string;
    phone: string;
    birthday: string;
    avatar: string;
    lifestyle: Lifestyle;
  };
  settings: {
    theme: Theme;
    language: Lang;
    notifications: boolean;
    notificationFrequency: NotificationFrequency;
    soundEnabled: boolean;
    hapticEnabled: boolean;
    weekStartsOn: 0 | 1;
    enabledModules: EnabledModule[];
  };
  finance: {
    currency: string;
    initialBalance: number;
    monthlyBudget: number;
    salaryDay: number;
    expenseCategories: string[];
    incomeCategories: string[];
    goals: string[];
  };
  stats: {
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
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResult {
  token: string;
  user: UserDto;
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export interface OnboardingStatus {
  isOnboarded: boolean;
  enabledModules: string[];
  profile: UserDto['profile'];
  settings: UserDto['settings'];
  finance: UserDto['finance'];
}

export interface OnboardingPayload {
  profile?: Partial<UserDto['profile']>;
  settings?: Partial<UserDto['settings']>;
  finance?: Partial<UserDto['finance']>;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export interface TransactionDto {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  isRecurring: boolean;
  recurringRule?: unknown;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionListResult {
  items: TransactionDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: {
    income: number;
    expenses: number;
    balance: number;
  };
}

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
  isRecurring?: boolean;
  recurringRule?: unknown;
  tags?: string[];
  notes?: string;
}

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

// ─── Goals ───────────────────────────────────────────────────────────────────

export type GoalPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface GoalDto {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: GoalPriority;
  linkedTransactions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalPayload {
  name: string;
  icon?: string;
  color?: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  priority?: GoalPriority;
  linkedTransactions?: string[];
}

export type UpdateGoalPayload = Partial<CreateGoalPayload>;