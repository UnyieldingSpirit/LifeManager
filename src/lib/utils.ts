// src/lib/utils.ts
// Утилиты для LifeLedger

// import { BalanceState } from '@/types/index';
import { CURRENCIES } from './constants';

// ============================================================================
// ФОРМАТИРОВАНИЕ ДЕНЕГ
// ============================================================================
type BalanceState = 'normal' | 'warning' | 'danger' | 'negative';
export const formatMoney = (
  amount: number,
  currency: string = 'UZS',
  options?: {
    compact?: boolean;
    showSign?: boolean;
    showCurrency?: boolean;
  }
): string => {
  const currencyData = CURRENCIES.find((c) => c.code === currency);
  const locale = currencyData?.locale || 'ru-RU';
  const symbol = currencyData?.symbol || currency;
  
  const { compact = false, showSign = false, showCurrency = true } = options || {};
  
  let formatted: string;
  
  if (compact && Math.abs(amount) >= 1000000) {
    // Миллионы
    formatted = (amount / 1000000).toFixed(1).replace('.0', '') + 'M';
  } else if (compact && Math.abs(amount) >= 1000) {
    // Тысячи
    formatted = (amount / 1000).toFixed(1).replace('.0', '') + 'K';
  } else {
    formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  // Добавляем знак
  if (showSign && amount > 0) {
    formatted = '+' + formatted;
  }
  
  // Добавляем символ валюты
  if (showCurrency) {
    // Разное размещение символа для разных валют
    if (['USD', 'EUR', 'GBP'].includes(currency)) {
      formatted = symbol + formatted;
    } else {
      formatted = formatted + ' ' + symbol;
    }
  }
  
  return formatted;
};

// Короткий формат для компактного отображения
export const formatMoneyShort = (amount: number, currency: string = 'UZS'): string => {
  return formatMoney(amount, currency, { compact: true });
};

// Форматирование с знаком (для транзакций)
export const formatMoneyWithSign = (
  amount: number,
  type: 'income' | 'expense',
  currency: string = 'UZS'
): string => {
  const sign = type === 'income' ? '+' : '-';
  const formatted = formatMoney(Math.abs(amount), currency, { showCurrency: true });
  return sign + formatted;
};

// ============================================================================
// ФОРМАТИРОВАНИЕ ДАТ
// ============================================================================

export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'relative' | 'time' = 'short',
  locale: string = 'ru'
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
      });
    
    case 'long':
      return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    
    case 'time':
      return d.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      });
    
    case 'relative':
      return getRelativeTime(d, locale);
    
    default:
      return d.toLocaleDateString(locale);
  }
};

// Относительное время (сегодня, вчера, N дней назад)
export const getRelativeTime = (date: Date, locale: string = 'ru'): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  const labels: Record<string, Record<string, string>> = {
    ru: { today: 'Сегодня', yesterday: 'Вчера', daysAgo: 'дней назад' },
    en: { today: 'Today', yesterday: 'Yesterday', daysAgo: 'days ago' },
    uz: { today: 'Bugun', yesterday: 'Kecha', daysAgo: 'kun oldin' },
  };
  
  const l = labels[locale] || labels.ru;
  
  if (days === 0) return l.today;
  if (days === 1) return l.yesterday;
  if (days < 7) return `${days} ${l.daysAgo}`;
  
  return formatDate(date, 'short', locale);
};

// Группировка по дням
export const groupByDate = <T extends { date: string }>(items: T[]): Map<string, T[]> => {
  const groups = new Map<string, T[]>();
  
  items.forEach((item) => {
    const dateKey = new Date(item.date).toDateString();
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, item]);
  });
  
  return groups;
};

// ============================================================================
// РАСЧЁТ СОСТОЯНИЯ БАЛАНСА
// ============================================================================

export const getBalanceState = (
  spent: number,
  budget: number,
  balance: number
) => {
  if (balance < 0) return 'negative';
  
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  
  if (percentage > 100) return 'danger';
  if (percentage > 80) return 'warning';
  return 'normal';
};

// Цвета для состояний баланса
export const balanceStateColors: Record<BalanceState, {
  text: string;
  bg: string;
  glow: string;
}> = {
  normal: {
    text: 'var(--text-primary)',
    bg: 'var(--primary-subtle)',
    glow: 'none',
  },
  warning: {
    text: 'var(--warning)',
    bg: 'var(--warning-subtle)',
    glow: '0 0 60px rgba(251, 191, 36, 0.2)',
  },
  danger: {
    text: 'var(--error)',
    bg: 'var(--error-subtle)',
    glow: '0 0 60px rgba(248, 113, 113, 0.2)',
  },
  negative: {
    text: 'var(--error)',
    bg: 'var(--error-subtle)',
    glow: '0 0 80px rgba(248, 113, 113, 0.3)',
  },
};

// ============================================================================
// РАСЧЁТ ДНЕЙ ДО ЗАРПЛАТЫ
// ============================================================================

export const getDaysUntilSalary = (salaryDay: number): number => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let nextSalaryDate: Date;
  
  if (currentDay < salaryDay) {
    // В этом месяце ещё будет зарплата
    nextSalaryDate = new Date(currentYear, currentMonth, salaryDay);
  } else {
    // Зарплата в следующем месяце
    nextSalaryDate = new Date(currentYear, currentMonth + 1, salaryDay);
  }
  
  const diff = nextSalaryDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ============================================================================
// РАСЧЁТ ДНЕВНОГО БЮДЖЕТА
// ============================================================================

export const getDailyBudget = (
  remainingBudget: number,
  daysUntilSalary: number
): number => {
  if (daysUntilSalary <= 0) return remainingBudget;
  return Math.floor(remainingBudget / daysUntilSalary);
};

// ============================================================================
// ПРОЦЕНТНЫЕ РАСЧЁТЫ
// ============================================================================

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const formatPercentage = (value: number, showSign: boolean = false): string => {
  const formatted = Math.round(value) + '%';
  if (showSign && value > 0) return '+' + formatted;
  return formatted;
};

// ============================================================================
// ВАЛИДАЦИЯ
// ============================================================================

export const isValidAmount = (value: string | number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0 && isFinite(num);
};

export const parseAmount = (value: string): number => {
  // Удаляем все символы кроме цифр и точки
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// ============================================================================
// ГЕНЕРАЦИЯ ID
// ============================================================================

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================================================
// CLASSNAMES HELPER
// ============================================================================

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// ============================================================================
// DEBOUNCE
// ============================================================================

export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// ============================================================================
// HAPTIC FEEDBACK (Telegram)
// ============================================================================

export const haptic = (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' = 'light'
) => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
    const hf = window.Telegram.WebApp.HapticFeedback;
    
    switch (type) {
      case 'light':
      case 'medium':
      case 'heavy':
        hf.impactOccurred(type);
        break;
      case 'success':
      case 'warning':
      case 'error':
        hf.notificationOccurred(type);
        break;
      case 'selection':
        hf.selectionChanged();
        break;
    }
  }
};

// ============================================================================
// АЛИАСЫ ДЛЯ СОВМЕСТИМОСТИ
// ============================================================================

// formatCurrency - алиас для formatMoney с упрощённым API
export const formatCurrency = (
  amount: number, 
  currency: string = 'UZS',
  compact: boolean = false
): string => {
  return formatMoney(amount, currency, { compact, showCurrency: true });
};