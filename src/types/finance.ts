// src/types/finance.ts
// Типы для финансовой части LifeLedger

// ============================================================================
// ТРАНЗАКЦИИ
// ============================================================================

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string
  isRecurring: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  attachments?: string[]; // Фото чеков
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date?: string;
  isRecurring?: boolean;
}

// ============================================================================
// КАТЕГОРИИ
// ============================================================================

export interface Category {
  id: string;
  name: Record<'ru' | 'en' | 'uz', string>;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  budgetSuggestion?: number; // Рекомендуемый % от бюджета
}

export interface CategoryStat {
  categoryId: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// ЦЕЛИ НАКОПЛЕНИЙ
// ============================================================================

export type GoalPriority = 'high' | 'medium' | 'low';
export type GoalStatus = 'active' | 'almost' | 'completed' | 'overdue';

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO date
  icon: string;
  color: string;
  priority: GoalPriority;
  createdAt: string;
  updatedAt: string;
  contributions: GoalContribution[];
}

export interface GoalContribution {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface GoalInput {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  icon?: string;
  color?: string;
  priority?: GoalPriority;
}

// ============================================================================
// ДОЛГИ И КРЕДИТЫ
// ============================================================================

export type DebtType = 'credit' | 'loan' | 'mortgage' | 'debt_to_person' | 'debt_from_person';

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate?: number; // %
  nextPaymentDate?: string;
  startDate: string;
  endDate?: string;
  lenderName?: string; // Кому должен / кто должен
  createdAt: string;
  updatedAt: string;
  payments: DebtPayment[];
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  principal: number; // Основной долг
  interest: number; // Проценты
  note?: string;
}

export interface DebtInput {
  name: string;
  type: DebtType;
  totalAmount: number;
  remainingAmount?: number;
  monthlyPayment: number;
  interestRate?: number;
  nextPaymentDate?: string;
  lenderName?: string;
}

// ============================================================================
// НАПОМИНАНИЯ
// ============================================================================

export type ReminderType = 'payment' | 'budget_warning' | 'goal_milestone' | 'custom';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  description?: string;
  date: string;
  time?: string;
  isRead: boolean;
  relatedId?: string; // ID связанной транзакции/цели/долга
  createdAt: string;
}

// ============================================================================
// БЮДЖЕТ ПО КАТЕГОРИЯМ
// ============================================================================

export interface CategoryBudget {
  categoryId: string;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly';
}

export type BudgetStatus = 'safe' | 'moderate' | 'warning' | 'exceeded';

// ============================================================================
// АНАЛИТИКА
// ============================================================================

export interface AnalyticsPeriod {
  start: string;
  end: string;
  type: 'day' | 'week' | 'month' | 'year';
}

export interface AnalyticsData {
  period: AnalyticsPeriod;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  averageDaily: number;
  topCategories: CategoryStat[];
  trend: 'up' | 'down' | 'stable';
  comparedToPrevious: number; // % изменение
}

export interface Prediction {
  type: 'budget_exceeded' | 'goal_achievable' | 'spending_trend';
  message: string;
  confidence: number; // 0-1
  data?: Record<string, unknown>;
}

// ============================================================================
// UI СОСТОЯНИЯ
// ============================================================================

export type BalanceState = 'normal' | 'warning' | 'danger' | 'negative';

export interface TransactionFilters {
  type?: TransactionType | 'all';
  category?: string | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

// ============================================================================
// ВАЛЮТЫ
// ============================================================================

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  locale?: string;
}

// ============================================================================
// ФОРМАТИРОВАНИЕ
// ============================================================================

export interface FormatOptions {
  currency: string;
  locale: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
}