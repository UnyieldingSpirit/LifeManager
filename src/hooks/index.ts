// src/hooks/index.ts
// ============================================================================
// LIFELEDGER - ХУКИ
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { useStore } from '@/store';
import { translations } from '@/lib';
import type { TelegramWebApp, TelegramUser, Locale } from '@/types';

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

  const hapticFeedback = useCallback((type: HapticStyle | 'selection' | 'notification', notification?: HapticNotification) => {
    if (!webApp?.HapticFeedback) return;
    if (type === 'selection') {
      webApp.HapticFeedback.selectionChanged();
    } else if (type === 'notification' && notification) {
      webApp.HapticFeedback.notificationOccurred(notification);
    } else if (type !== 'notification') {
      webApp.HapticFeedback.impactOccurred(type as HapticStyle);
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
// TRANSLATION
// ============================================================================

export function useTranslation() {
  const locale = useStore((s) => s.profile?.settings.language || 'ru');
  const setLanguage = useStore((s) => s.setLanguage);

  const t = useCallback((key: string): string => {
    const lang = translations[locale as keyof typeof translations] || translations.ru;
    return lang[key as keyof typeof lang] || key;
  }, [locale]);

  return { t, locale, setLocale: setLanguage };
}

// ============================================================================
// FORMATTERS
// ============================================================================

import { formatCurrency, formatCompactCurrency, formatRelativeDate } from '@/lib';

export function useFormatters() {
  const currency = useStore((s) => s.profile?.finance.currency || 'UZS');
  const locale = useStore((s) => s.profile?.settings.language || 'ru');

  return {
    formatMoney: useCallback((amount: number) => formatCurrency(amount, currency), [currency]),
    formatCompactMoney: useCallback((amount: number) => formatCompactCurrency(amount, currency), [currency]),
    formatRelative: useCallback((date: string) => formatRelativeDate(date), []),
    formatDate: useCallback((date: string | Date) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      const localeMap = { ru: 'ru-RU', en: 'en-US', uz: 'uz-UZ' };
      return d.toLocaleDateString(localeMap[locale as keyof typeof localeMap] || 'ru-RU', { day: 'numeric', month: 'short' });
    }, [locale]),
  };
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
      return () => { document.body.style.overflow = original; };
    }
  }, [lock]);
}
