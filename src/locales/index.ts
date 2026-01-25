// src/locales/index.ts
// Главный файл системы интернационализации LifeLedger

import { ru } from './ru';
import { en } from './en';
import { uz } from './uz';
import { kz } from './kz';
import { kg } from './kg';
import { tj } from './tj';
import { tr } from './tr';
import type { Locale, TranslationSchema, LocaleInfo } from './types';
import { localeInfoMap, supportedLocales, defaultLocale } from './types';

// Экспорт всех переводов
export const translations: Record<Locale, TranslationSchema> = {
  ru,
  en,
  uz,
  kz,
  kg,
  tj,
  tr,
};

// Реэкспорт типов
export type { Locale, TranslationSchema, LocaleInfo } from './types';
export { localeInfoMap, supportedLocales, defaultLocale } from './types';

// ============================================================================
// УТИЛИТАРНЫЕ ФУНКЦИИ
// ============================================================================

/**
 * Получить информацию о локали
 */
export function getLocaleInfo(locale: Locale): LocaleInfo {
  return localeInfoMap[locale];
}

/**
 * Получить список всех доступных языков для селектора
 */
export function getAvailableLanguages(): Array<{
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
}> {
  return supportedLocales.map((code) => ({
    code,
    name: localeInfoMap[code].name,
    nativeName: localeInfoMap[code].nativeName,
    flag: localeInfoMap[code].flag,
  }));
}

/**
 * Проверить, поддерживается ли локаль
 */
export function isLocaleSupported(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}

/**
 * Получить перевод по ключу с поддержкой вложенных путей
 * Пример: t('nav.today') или t('messages.taskCompleted')
 */
export function getTranslation(
  locale: Locale,
  path: string,
  fallback?: string
): string {
  const keys = path.split('.');
  let result: any = translations[locale];

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      // Если не найден, попробовать дефолтную локаль
      result = undefined;
      let fallbackResult: any = translations[defaultLocale];
      for (const k of keys) {
        if (fallbackResult && typeof fallbackResult === 'object' && k in fallbackResult) {
          fallbackResult = fallbackResult[k];
        } else {
          fallbackResult = undefined;
          break;
        }
      }
      if (fallbackResult !== undefined) {
        return String(fallbackResult);
      }
      break;
    }
  }

  if (result !== undefined && typeof result !== 'object') {
    return String(result);
  }

  return fallback ?? path;
}

/**
 * Создать функцию перевода для конкретной локали
 */
export function createTranslator(locale: Locale) {
  return (path: string, fallback?: string) => getTranslation(locale, path, fallback);
}

/**
 * Форматировать число согласно локали
 */
export function formatNumber(value: number, locale: Locale): string {
  const { numberFormat } = localeInfoMap[locale];
  const parts = value.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, numberFormat.thousand);
  const decPart = parts[1] === '00' ? '' : numberFormat.decimal + parts[1];
  return intPart + decPart;
}

/**
 * Форматировать валюту
 */
export function formatCurrency(
  value: number,
  currency: string,
  locale: Locale = 'ru'
): string {
  const formattedValue = formatNumber(value, locale);
  
  const currencySymbols: Record<string, string> = {
    UZS: "so'm",
    USD: '$',
    EUR: '€',
    RUB: '₽',
    KZT: '₸',
    KGS: 'сом',
    TJS: 'с.',
    TRY: '₺',
  };

  const symbol = currencySymbols[currency] || currency;
  
  // Позиция символа валюты зависит от локали
  if (locale === 'en' && (currency === 'USD' || currency === 'EUR')) {
    return `${symbol}${formattedValue}`;
  }
  
  return `${formattedValue} ${symbol}`;
}

/**
 * Получить название месяца
 */
export function getMonthName(monthIndex: number, locale: Locale, short = false): string {
  const t = translations[locale];
  const names = short ? t.calendar.monthNamesShort : t.calendar.monthNames;
  return names[monthIndex] || '';
}

/**
 * Получить название дня недели
 */
export function getDayName(dayIndex: number, locale: Locale, short = true): string {
  const t = translations[locale];
  const names = short ? t.calendar.dayNamesShort : t.calendar.dayNames;
  return names[dayIndex] || '';
}

/**
 * Форматировать дату согласно локали
 */
export function formatDate(date: Date, locale: Locale): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const format = localeInfoMap[locale].dateFormat;
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', String(year));
}

/**
 * Получить относительное время (например, "2 часа назад")
 */
export function getRelativeTime(date: Date, locale: Locale): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const t = translations[locale].time;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  const months = Math.floor(diff / 2592000000);
  const years = Math.floor(diff / 31536000000);

  if (minutes < 1) return t.now;
  if (minutes < 60) return `${minutes} ${t.minutes} ${t.ago}`;
  if (hours < 24) return `${hours} ${t.hours} ${t.ago}`;
  if (days === 1) return t.yesterday;
  if (days < 7) return `${days} ${t.days} ${t.ago}`;
  if (weeks < 4) return `${weeks} ${t.weeks} ${t.ago}`;
  if (months < 12) return `${months} ${t.months} ${t.ago}`;
  return `${years} ${t.years} ${t.ago}`;
}

/**
 * Получить приветствие в зависимости от времени суток
 */
export function getGreeting(locale: Locale): string {
  const hour = new Date().getHours();
  const t = translations[locale].greeting;

  if (hour >= 5 && hour < 12) return t.morning;
  if (hour >= 12 && hour < 17) return t.afternoon;
  if (hour >= 17 && hour < 22) return t.evening;
  return t.night;
}

/**
 * Плюрализация (простая версия для славянских языков)
 */
export function pluralize(
  count: number,
  forms: { one: string; few: string; many: string },
  locale: Locale
): string {
  // Для английского и турецкого - простая логика
  if (locale === 'en' || locale === 'tr') {
    return count === 1 ? forms.one : forms.many;
  }

  // Для славянских и тюркских языков
  const lastTwo = Math.abs(count) % 100;
  const lastOne = lastTwo % 10;

  if (lastTwo >= 11 && lastTwo <= 19) {
    return forms.many;
  }
  if (lastOne === 1) {
    return forms.one;
  }
  if (lastOne >= 2 && lastOne <= 4) {
    return forms.few;
  }
  return forms.many;
}

// ============================================================================
// REACT HOOK (для использования в компонентах)
// ============================================================================

/**
 * Простая реализация хука useTranslation
 * Полная версия должна быть в src/hooks/useTranslation.ts
 * с использованием Zustand store для состояния языка
 */
export const createUseTranslation = (getCurrentLocale: () => Locale) => {
  return () => {
    const locale = getCurrentLocale();
    
    const t = (path: string, fallback?: string) => 
      getTranslation(locale, path, fallback);
    
    return {
      t,
      locale,
      localeInfo: localeInfoMap[locale],
      formatDate: (date: Date) => formatDate(date, locale),
      formatNumber: (value: number) => formatNumber(value, locale),
      formatCurrency: (value: number, currency: string) => formatCurrency(value, currency, locale),
      getGreeting: () => getGreeting(locale),
      getRelativeTime: (date: Date) => getRelativeTime(date, locale),
      getMonthName: (index: number, short?: boolean) => getMonthName(index, locale, short),
      getDayName: (index: number, short?: boolean) => getDayName(index, locale, short),
    };
  };
};

// Экспорт отдельных локализаций для прямого доступа
export { ru, en, uz, kz, kg, tj, tr };