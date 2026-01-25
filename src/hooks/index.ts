// src/hooks/index.ts
// ============================================================================
// LIFELEDGER - ХУКИ
// ============================================================================

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useStore } from '@/store';
import type { TelegramWebApp, TelegramUser, Locale } from '@/types';

// Импорт системы локализации
import {
  translations,
  getTranslation,
  formatNumber as formatLocaleNumber,
  formatCurrency as formatLocaleCurrency,
  formatDate as formatLocaleDate,
  getMonthName,
  getDayName,
  getRelativeTime,
  getGreeting,
  pluralize,
  localeInfoMap,
  type TranslationSchema,
  type LocaleInfo,
} from '@/locales';

// ============================================================================
// TELEGRAM
// ============================================================================

type HapticStyle = 'light' | 'medium' | 'heavy';
type HapticNotification = 'success' | 'warning' | 'error';

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setWebApp(tg);
      tg.ready();
      tg.expand();
      setIsReady(true);
    }
  }, []);

  const user = webApp?.initDataUnsafe?.user || null;
  const isTelegram = !!webApp;

  const hapticFeedback = useCallback((
    type: HapticStyle | 'selection' | 'notification',
    notification?: HapticNotification
  ) => {
    if (!webApp?.HapticFeedback) return;
    
    try {
      if (type === 'selection') {
        webApp.HapticFeedback.selectionChanged();
      } else if (type === 'notification' && notification) {
        webApp.HapticFeedback.notificationOccurred(notification);
      } else if (type !== 'notification') {
        webApp.HapticFeedback.impactOccurred(type as HapticStyle);
      }
    } catch (e) {
      // Игнорируем ошибки haptic на неподдерживаемых устройствах
    }
  }, [webApp]);

  return {
    webApp,
    user,
    isReady,
    isTelegram,
    colorScheme: webApp?.colorScheme || 'dark',
    viewportHeight: webApp?.viewportHeight || (typeof window !== 'undefined' ? window.innerHeight : 0),
    hapticFeedback,
    expand: () => webApp?.expand(),
    close: () => webApp?.close(),
  };
}

// ============================================================================
// TRANSLATION (Полная версия)
// ============================================================================

interface UseTranslationReturn {
  /** Функция перевода по ключу: t('nav.home') */
  t: (path: string, fallback?: string) => string;
  
  /** Текущая локаль */
  locale: Locale;
  
  /** Полный объект переводов текущей локали */
  translations: TranslationSchema;
  
  /** Информация о локали (флаг, название, форматы) */
  localeInfo: LocaleInfo;
  
  /** Сменить язык */
  setLocale: (locale: Locale) => void;
  
  /** Форматировать число: 1234567 → "1 234 567" */
  formatNumber: (value: number) => string;
  
  /** Форматировать валюту: formatCurrency(50000, 'UZS') → "50 000 so'm" */
  formatCurrency: (value: number, currency?: string) => string;
  
  /** Форматировать дату по локали */
  formatDate: (date: Date | string) => string;
  
  /** Получить название месяца */
  getMonthName: (index: number, short?: boolean) => string;
  
  /** Получить название дня недели */
  getDayName: (index: number, short?: boolean) => string;
  
  /** Относительное время: "2 часа назад" */
  getRelativeTime: (date: Date | string) => string;
  
  /** Приветствие по времени суток */
  getGreeting: () => string;
  
  /** Плюрализация: pluralize(5, { one: 'задача', few: 'задачи', many: 'задач' }) */
  pluralize: (count: number, forms: { one: string; few: string; many: string }) => string;
}

export function useTranslation(): UseTranslationReturn {
  const locale = useStore((s) => s.profile?.settings.language || 'ru') as Locale;
  const currency = useStore((s) => s.profile?.finance.currency || 'UZS');
  const setLanguage = useStore((s) => s.setLanguage);

  // Мемоизированная функция перевода
  const t = useCallback(
    (path: string, fallback?: string): string => {
      return getTranslation(locale, path, fallback);
    },
    [locale]
  );

  // Мемоизированные утилиты форматирования
  const utils = useMemo(() => ({
    formatNumber: (value: number) => formatLocaleNumber(value, locale),
    
    formatCurrency: (value: number, cur?: string) => 
      formatLocaleCurrency(value, cur || currency, locale),
    
    formatDate: (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return formatLocaleDate(d, locale);
    },
    
    getMonthName: (index: number, short?: boolean) => 
      getMonthName(index, locale, short),
    
    getDayName: (index: number, short?: boolean) => 
      getDayName(index, locale, short),
    
    getRelativeTime: (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return getRelativeTime(d, locale);
    },
    
    getGreeting: () => getGreeting(locale),
    
    pluralize: (count: number, forms: { one: string; few: string; many: string }) =>
      pluralize(count, forms, locale),
  }), [locale, currency]);

  return {
    t,
    locale,
    translations: translations[locale],
    localeInfo: localeInfoMap[locale],
    setLocale: setLanguage,
    ...utils,
  };
}

/**
 * Легковесный хук - только функция перевода
 */
export function useT() {
  const locale = useStore((s) => s.profile?.settings.language || 'ru') as Locale;
  
  return useCallback(
    (path: string, fallback?: string) => getTranslation(locale, path, fallback),
    [locale]
  );
}

/**
 * Хук для получения текущей локали
 */
export function useLocale(): Locale {
  return useStore((s) => s.profile?.settings.language || 'ru') as Locale;
}

// ============================================================================
// FORMATTERS (Расширенная версия)
// ============================================================================

export function useFormatters() {
  const currency = useStore((s) => s.profile?.finance.currency || 'UZS');
  const locale = useStore((s) => s.profile?.settings.language || 'ru') as Locale;

  return useMemo(() => ({
    /** Форматировать сумму с валютой */
    formatMoney: (amount: number) => formatLocaleCurrency(amount, currency, locale),
    
    /** Компактное форматирование (1.5M, 500K) с символом валюты */
    formatCompactMoney: (amount: number) => {
      const currencySymbols: Record<string, string> = {
        UZS: '', // Для UZS не добавляем, слишком длинно
        USD: '$',
        EUR: '€',
        RUB: '₽',
        KZT: '₸',
        KGS: '',
        TJS: '',
        TRY: '₺',
      };
      
      const symbol = currencySymbols[currency] || '';
      let formatted: string;
      
      if (amount >= 1_000_000_000) {
        formatted = `${(amount / 1_000_000_000).toFixed(1)}B`;
      } else if (amount >= 1_000_000) {
        formatted = `${(amount / 1_000_000).toFixed(1)}M`;
      } else if (amount >= 10_000) {
        formatted = `${(amount / 1_000).toFixed(0)}K`;
      } else if (amount >= 1_000) {
        formatted = `${(amount / 1_000).toFixed(1)}K`;
      } else {
        formatted = String(Math.round(amount));
      }
      
      // Убираем .0 в конце
      formatted = formatted.replace('.0', '');
      
      return symbol ? `${symbol}${formatted}` : formatted;
    },
    
    /** Относительная дата */
    formatRelative: (date: string | Date) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return getRelativeTime(d, locale);
    },
    
    /** Короткая дата (25 янв) */
    formatDate: (date: string | Date) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      const day = d.getDate();
      const month = getMonthName(d.getMonth(), locale, true);
      return `${day} ${month}`;
    },
    
    /** Полная дата */
    formatFullDate: (date: string | Date) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return formatLocaleDate(d, locale);
    },
    
    /** Число с разделителями */
    formatNumber: (value: number) => formatLocaleNumber(value, locale),
    
  }), [currency, locale]);
}

// ============================================================================
// UTILITIES
// ============================================================================

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useScrollLock(lock: boolean): void {
  useEffect(() => {
    if (lock) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [lock]);
}

/**
 * Хук для закрытия при клике вне элемента
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;
    
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}

/**
 * Хук для работы с keyboard
 */
export function useKeyboard(
  key: string,
  handler: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;
    
    const listener = (event: KeyboardEvent) => {
      if (event.key === key) {
        handler();
      }
    };
    
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [key, handler, enabled]);
}