// src/app/onboarding/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore, OnboardingFormData } from '@/store/userStore';
import { useTelegram } from '@/hooks/useTelegram';
import { Locale } from '@/types';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  BellAlertIcon,
  BellSlashIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// ЦВЕТОВАЯ СИСТЕМА
// ============================================================================

const colors = {
  gold: {
    primary: '#C9A962',
    light: '#E8D5A3',
    dark: '#A68B4B',
    subtle: 'rgba(201, 169, 98, 0.15)',
    muted: 'rgba(201, 169, 98, 0.10)',
    glow: 'rgba(201, 169, 98, 0.2)',
    border: 'rgba(201, 169, 98, 0.40)',
    borderLight: 'rgba(201, 169, 98, 0.2)',
  },
  bg: {
    primary: '#0A0A0A',
    secondary: '#0D0D0D',
    tertiary: '#111111',
    elevated: '#141414',
  },
  surface: {
    default: 'rgba(255, 255, 255, 0.04)',
    hover: 'rgba(255, 255, 255, 0.06)',
    active: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
  },
  text: {
    primary: '#F5F5F5',
    secondary: '#A3A3A3',
    tertiary: '#737373',
    muted: '#525252',
  },
  success: {
    primary: '#4ADE80',
    subtle: 'rgba(74, 222, 128, 0.15)',
    border: 'rgba(74, 222, 128, 0.40)',
  },
  error: {
    primary: '#F87171',
    subtle: 'rgba(248, 113, 113, 0.15)',
  },
  categories: {
    green: '#4ADE80',
    blue: '#60A5FA',
    orange: '#F97316',
    yellow: '#FBBF24',
    red: '#F87171',
    purple: '#A855F7',
    pink: '#EC4899',
    teal: '#14B8A6',
    cyan: '#06B6D4',
    indigo: '#818CF8',
    lime: '#34D399',
    amber: '#FB923C',
    rose: '#F472B6',
    violet: '#A78BFA',
    sky: '#0EA5E9',
    fuchsia: '#E879F9',
    gray: '#6B7280',
  },
};

const gradients = {
  gold: `linear-gradient(135deg, ${colors.gold.primary} 0%, ${colors.gold.light} 50%, ${colors.gold.primary} 100%)`,
  goldSubtle: `linear-gradient(135deg, ${colors.gold.subtle} 0%, ${colors.gold.muted} 100%)`,
  shimmer: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)`,
};

// Glass-стили для элементов на фото - БОЛЕЕ ПРОЗРАЧНЫЕ
const glassStyles = {
  // Карточка/кнопка по умолчанию
  card: {
    background: 'rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  // Карточка/кнопка выбранная
  cardSelected: {
    background: 'rgba(201, 169, 98, 0.2)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: `1px solid ${colors.gold.border}`,
    boxShadow: `0 0 15px ${colors.gold.primary}25`,
  },
  // Инпут
  input: {
    background: 'rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  // Инпут с фокусом/значением
  inputActive: {
    background: 'rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: `1px solid ${colors.gold.border}`,
    boxShadow: `0 0 12px ${colors.gold.primary}15`,
  },
};

// ============================================================================
// ТИПЫ
// ============================================================================

type OnboardingStep = 
  | 'intro'
  | 'registration'
  | 'language'
  | 'theme'
  | 'currency'
  | 'budget'
  | 'salary-day'
  | 'expense-categories'
  | 'income-categories'
  | 'goals'
  | 'lifestyle'
  | 'notifications'
  | 'complete';

type ThemeMode = 'light' | 'dark' | 'system';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface Goal {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface LifestyleOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface LanguageOption {
  id: Locale;
  name: string;
  native: string;
  flag: string;
}

// ============================================================================
// ДАННЫЕ
// ============================================================================

// Маппинг фоновых изображений для каждого шага
const stepBackgrounds: Record<OnboardingStep, string> = {
  'intro': '/onboarding-welcome.jpg', // Меняется динамически для intro слайдов
  'registration': '/onboarding-profile.jpg',
  'language': '/onboarding-language.jpg',
  'theme': '/onboarding-theme.jpg',
  'currency': '/onboarding-currency.jpg',
  'budget': '/onboarding-budget.jpg',
  'salary-day': '/onboarding-payday.jpg',
  'expense-categories': '/onboarding-expenses.jpg',
  'income-categories': '/onboarding-income.jpg',
  'goals': '/onboarding-goals.jpg',
  'lifestyle': '/onboarding-lifestyle.jpg',
  'notifications': '/onboarding-notifications.jpg',
  'complete': '/onboarding-complete.jpg',
};

// Прозрачность overlay для каждого шага (чем меньше - тем виднее фото)
// light = фото хорошо видно, medium = баланс, heavy = больше затемнения для читаемости
type OverlayIntensity = 'light' | 'medium' | 'heavy';

const stepOverlayIntensity: Record<OnboardingStep, OverlayIntensity> = {
  'intro': 'light',           // Красивая геометрия - показываем
  'registration': 'medium',   // Силуэт человека - баланс
  'language': 'light',        // Глобус - показываем
  'theme': 'light',           // Light/dark разделение - показываем
  'currency': 'light',        // Валюты на орбитах - показываем
  'budget': 'medium',         // Много контента - баланс
  'salary-day': 'heavy',      // Много кнопок (31 день) - затемняем
  'expense-categories': 'heavy', // Много мелких элементов - затемняем
  'income-categories': 'heavy',  // Много мелких элементов - затемняем
  'goals': 'light',           // Путь к цели - показываем
  'lifestyle': 'light',       // Уютный дом - показываем
  'notifications': 'medium',  // Баланс
  'complete': 'light',        // ПРАЗДНИК! Максимально показываем
};

const getOverlayGradient = (intensity: OverlayIntensity) => {
  switch (intensity) {
    case 'light':
      return 'linear-gradient(to bottom, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.25) 50%, rgba(10,10,10,0.5) 100%)';
    case 'medium':
      return 'linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.65) 100%)';
    case 'heavy':
      return 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.5) 50%, rgba(10,10,10,0.75) 100%)';
  }
};

const introSlides = [
  {
    id: 1,
    title: 'LifeLedger',
    subtitle: 'Ваш персональный ассистент',
    description: 'Умное приложение для управления финансами и повседневными задачами',
    background: '/onboarding-welcome.jpg',
    icon: (
      <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: colors.gold.primary,
  },
  {
    id: 2,
    title: 'Контроль финансов',
    subtitle: 'Знайте куда уходят деньги',
    description: 'Отслеживайте доходы и расходы, анализируйте траты и планируйте бюджет',
    background: '/onboarding-finance.jpg',
    icon: (
      <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: colors.success.primary,
  },
  {
    id: 3,
    title: 'Умные напоминания',
    subtitle: 'Никогда не забывайте важное',
    description: 'Напомним о счетах, платежах, встречах и любых задачах вовремя',
    background: '/onboarding-reminders.jpg',
    icon: (
      <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: colors.categories.blue,
  },
  {
    id: 4,
    title: 'Аналитика и цели',
    subtitle: 'Достигайте финансовых целей',
    description: 'Визуализация трат, прогнозы и персональные рекомендации для достижения целей',
    background: '/onboarding-analytics.jpg',
    icon: (
      <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
        <path d="M21 21H4.6c-.56 0-.84 0-1.054-.109a1 1 0 01-.437-.437C3 20.24 3 19.96 3 19.4V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 14l4-4 4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 8h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: colors.categories.pink,
  },
];

const languages: LanguageOption[] = [
  { id: 'ru', name: 'Русский', native: 'Русский', flag: '🇷🇺' },
  { id: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { id: 'uz', name: 'O\'zbek', native: 'O\'zbekcha', flag: '🇺🇿' },
];

const themes: { id: ThemeMode; name: string; description: string; icon: React.ReactNode }[] = [
  { 
    id: 'dark', 
    name: 'Тёмная', 
    description: 'Для комфорта глаз',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  { 
    id: 'light', 
    name: 'Светлая', 
    description: 'Классический вид',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  { 
    id: 'system', 
    name: 'Системная', 
    description: 'Как в устройстве',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const currencies: Currency[] = [
  { code: 'UZS', name: 'Узбекский сум', symbol: "so'm", flag: '🇺🇿' },
  { code: 'RUB', name: 'Российский рубль', symbol: '₽', flag: '🇷🇺' },
  { code: 'USD', name: 'Доллар США', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Евро', symbol: '€', flag: '🇪🇺' },
  { code: 'KZT', name: 'Казахстанский тенге', symbol: '₸', flag: '🇰🇿' },
  { code: 'GBP', name: 'Фунт стерлингов', symbol: '£', flag: '🇬🇧' },
  { code: 'TRY', name: 'Турецкая лира', symbol: '₺', flag: '🇹🇷' },
  { code: 'AED', name: 'Дирхам ОАЭ', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'CNY', name: 'Китайский юань', symbol: '¥', flag: '🇨🇳' },
  { code: 'JPY', name: 'Японская иена', symbol: '¥', flag: '🇯🇵' },
];

const expenseCategories: Category[] = [
  { id: 'food', name: 'Продукты', icon: <path d="M3 3h18v18H3V3z M7 7h4v4H7V7z M13 7h4v4h-4V7z M7 13h4v4H7v-4z" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.green },
  { id: 'transport', name: 'Транспорт', icon: <path d="M5 17h14M6 9h12M7 13h10M12 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>, color: colors.categories.blue },
  { id: 'housing', name: 'Жильё', icon: <path d="M3 12l9-9 9 9M5 10v10h14V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>, color: colors.categories.orange },
  { id: 'utilities', name: 'Коммуналка', icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>, color: colors.categories.yellow },
  { id: 'health', name: 'Здоровье', icon: <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.red },
  { id: 'entertainment', name: 'Развлечения', icon: <path d="M15 10l4.5-4.5M19.5 5.5l-4.5 4.5M4.5 19.5l4.5-4.5M9 15l-4.5 4.5M7 3l2 6-6 2 6 2-2 6 6-2 2 6 2-6 6 2-6-2 2-6-6-2-2-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>, color: colors.categories.purple },
  { id: 'shopping', name: 'Покупки', icon: <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>, color: colors.categories.pink },
  { id: 'education', name: 'Образование', icon: <path d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422A12.083 12.083 0 0121 12.017V17a9 9 0 01-9 3 9 9 0 01-9-3v-4.983c0-.94.088-1.862.26-2.757L12 14z" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.teal },
  { id: 'beauty', name: 'Красота', icon: <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.rose },
  { id: 'cafe', name: 'Кафе', icon: <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>, color: colors.categories.amber },
  { id: 'clothes', name: 'Одежда', icon: <path d="M6 2l3 4h6l3-4M6 2v20M18 2v20M6 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>, color: colors.categories.indigo },
  { id: 'gifts', name: 'Подарки', icon: <path d="M20 12v10H4V12M2 7h20v5H2V7zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.fuchsia },
  { id: 'kids', name: 'Дети', icon: <path d="M12 11a4 4 0 100-8 4 4 0 000 8zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>, color: colors.categories.lime },
  { id: 'pets', name: 'Питомцы', icon: <path d="M12 10c-2 0-4 1.5-4 4s2 5 4 5 4-1.5 4-5-2-4-4-4zM4.93 5.93a2.5 2.5 0 113.54 3.54M15.54 9.46a2.5 2.5 0 113.53-3.53M7.76 14.24a2.5 2.5 0 11-3.53 3.52M19.77 17.77a2.5 2.5 0 11-3.54-3.53" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.violet },
  { id: 'sport', name: 'Спорт', icon: <path d="M12 12m-10 0a10 10 0 1020 0 10 10 0 10-20 0M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10M2 12h20" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.cyan },
  { id: 'travel', name: 'Путешествия', icon: <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.sky },
  { id: 'subscriptions', name: 'Подписки', icon: <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>, color: colors.categories.purple },
  { id: 'internet', name: 'Связь', icon: <path d="M12 20h.01M8.5 16.5a5 5 0 017 0M5 13a10 10 0 0114 0M1.5 9.5a15 15 0 0121 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>, color: colors.categories.blue },
  { id: 'taxi', name: 'Такси', icon: <path d="M5 11l1.5-4.5h11L19 11M3 11h18v6a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM6 14.5h.01M18 14.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>, color: colors.categories.yellow },
  { id: 'other', name: 'Другое', icon: <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.gray },
];

const incomeCategories: Category[] = [
  { id: 'salary', name: 'Зарплата', icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>, color: colors.categories.green },
  { id: 'freelance', name: 'Фриланс', icon: <path d="M12 19l9 2-9-18-9 18 9-2zM12 19v-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>, color: colors.categories.blue },
  { id: 'business', name: 'Бизнес', icon: <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" stroke="currentColor" strokeWidth="1.5"/>, color: colors.gold.primary },
  { id: 'investments', name: 'Инвестиции', icon: <path d="M21 21H4.6c-.56 0-.84 0-1.054-.109a1 1 0 01-.437-.437C3 20.24 3 19.96 3 19.4V3M7 14l4-4 4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>, color: colors.categories.pink },
  { id: 'rent', name: 'Аренда', icon: <path d="M3 12l9-9 9 9M5 10v10h14V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>, color: colors.categories.orange },
  { id: 'cashback', name: 'Кэшбэк', icon: <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.lime },
  { id: 'gifts_income', name: 'Подарки', icon: <path d="M20 12v10H4V12M2 7h20v5H2V7zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.fuchsia },
  { id: 'pension', name: 'Пенсия', icon: <path d="M12 11a4 4 0 100-8 4 4 0 000 8zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>, color: colors.categories.violet },
  { id: 'social', name: 'Соц. выплаты', icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>, color: colors.categories.indigo },
  { id: 'side_job', name: 'Подработка', icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.cyan },
  { id: 'deposits', name: 'Вклады', icon: <path d="M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zM6 17v2M18 17v2M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.sky },
  { id: 'other_income', name: 'Другое', icon: <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" stroke="currentColor" strokeWidth="1.5"/>, color: colors.categories.gray },
];

const goals: Goal[] = [
  { id: 'save', name: 'Накопить на цель', icon: <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" strokeWidth="1.5"/>, description: 'Квартира, машина, отпуск...' },
  { id: 'control', name: 'Контролировать расходы', icon: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zM9 19V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6m0 0v-4a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5"/>, description: 'Понять куда уходят деньги' },
  { id: 'budget', name: 'Вести бюджет', icon: <path d="M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>, description: 'Планировать доходы и расходы' },
  { id: 'debt', name: 'Избавиться от долгов', icon: <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>, description: 'Погасить кредиты и займы' },
  { id: 'invest', name: 'Начать инвестировать', icon: <path d="M21 21H4.6c-.56 0-.84 0-1.054-.109a1 1 0 01-.437-.437C3 20.24 3 19.96 3 19.4V3M7 15l4-4 4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>, description: 'Создать пассивный доход' },
  { id: 'emergency', name: 'Создать подушку', icon: <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>, description: 'Финансовая безопасность' },
];

const lifestyleOptions: LifestyleOption[] = [
  { id: 'single', name: 'Живу один(а)', icon: <path d="M12 11a4 4 0 100-8 4 4 0 000 8zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/> },
  { id: 'couple', name: 'В паре', icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/> },
  { id: 'family', name: 'Семья с детьми', icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/> },
  { id: 'roommates', name: 'С соседями', icon: <path d="M3 12l9-9 9 9M5 10v10h14V10M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> },
];

const notificationOptions = [
  { id: 'daily', name: 'Ежедневно', description: 'Напоминания каждый день', icon: <CalendarDaysIcon className="w-6 h-6" /> },
  { id: 'weekly', name: 'Раз в неделю', description: 'Еженедельный отчёт', icon: <ChartBarIcon className="w-6 h-6" /> },
  { id: 'important', name: 'Только важное', description: 'Платежи и дедлайны', icon: <BellAlertIcon className="w-6 h-6" /> },
  { id: 'off', name: 'Отключить', description: 'Без напоминаний', icon: <BellSlashIcon className="w-6 h-6" /> },
];

const budgetPresets = [
  { amount: 500000, label: '500K' },
  { amount: 1000000, label: '1M' },
  { amount: 2000000, label: '2M' },
  { amount: 3000000, label: '3M' },
  { amount: 5000000, label: '5M' },
  { amount: 10000000, label: '10M' },
];

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export default function OnboardingPage() {
  const router = useRouter();
  const { hapticFeedback, user } = useTelegram();
  const saveOnboardingData = useUserStore((state) => state.saveOnboardingData);
  const isOnboarded = useUserStore((state) => state.isOnboarded);

  useEffect(() => {
    if (isOnboarded) {
      router.replace('/');
    }
  }, [isOnboarded, router]);

  const [step, setStep] = useState<OnboardingStep>('intro');
  const [introSlide, setIntroSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: user?.first_name || '',
    phone: '',
    birthday: '',
    language: 'ru',
    theme: 'dark',
    currency: 'UZS',
    initialBalance: 0,
    monthlyBudget: 0,
    salaryDay: 10,
    expenseCategories: [],
    incomeCategories: [],
    goals: [],
    lifestyle: '',
    notifications: 'important',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [balanceInput, setBalanceInput] = useState('');
  const [budgetInput, setBudgetInput] = useState('');

  const steps: OnboardingStep[] = [
    'intro', 'registration', 'language', 'theme', 'currency', 
    'budget', 'salary-day', 'expense-categories', 'income-categories', 
    'goals', 'lifestyle', 'notifications', 'complete'
  ];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex) / (steps.length - 1)) * 100;

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return currencies;
    return currencies.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const goNext = () => {
    hapticFeedback?.('selection');
    setDirection(1);
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const goBack = () => {
    hapticFeedback?.('selection');
    setDirection(-1);
    if (step === 'intro' && introSlide > 0) {
      setIntroSlide(prev => prev - 1);
    } else {
      const prevIndex = currentStepIndex - 1;
      if (prevIndex >= 0) {
        setStep(steps[prevIndex]);
      }
    }
  };

  const handleIntroNext = () => {
    hapticFeedback?.('selection');
    if (introSlide < introSlides.length - 1) {
      setDirection(1);
      setIntroSlide(prev => prev + 1);
    } else {
      goNext();
    }
  };

  const completeOnboarding = () => {
    hapticFeedback?.('notification', 'success');
    saveOnboardingData(formData);
    router.replace('/');
  };

  const toggleCategory = (categoryId: string, type: 'expense' | 'income') => {
    hapticFeedback?.('selection');
    const key = type === 'expense' ? 'expenseCategories' : 'incomeCategories';
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(categoryId)
        ? prev[key].filter(id => id !== categoryId)
        : [...prev[key], categoryId]
    }));
  };

  const toggleGoal = (goalId: string) => {
    hapticFeedback?.('selection');
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(id => id !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const getCurrencySymbol = () => {
    return currencies.find(c => c.code === formData.currency)?.symbol || '';
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  // ============ INTRO STEP ============
  const renderIntroStep = () => {
    const currentSlide = introSlides[introSlide];
    
    return (
      <div className="page-scrollable" style={{ background: colors.bg.primary }}>
        {/* Background Image - FIXED */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{ 
            backgroundImage: `url(${currentSlide.background})`,
            zIndex: 0,
          }}
        />
        
        {/* Gradient overlay - light для intro */}
        <div 
          className="fixed inset-0"
          style={{ 
            background: getOverlayGradient('light'),
            zIndex: 1,
          }}
        />
        
        <div className="relative min-h-full flex flex-col px-4 pb-24" style={{ zIndex: 2 }}>
          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={introSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex flex-col items-center text-center p-4 rounded-2xl"
                style={{
                  background: 'rgba(10, 10, 10, 0.4)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative mb-4"
                >
                  <div 
                    className="absolute inset-0 rounded-full blur-3xl"
                    style={{ background: `${currentSlide.accent}30`, transform: 'scale(2)' }}
                  />
                  <div 
                    className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ 
                      background: `rgba(${currentSlide.accent === colors.gold.primary ? '201, 169, 98' : currentSlide.accent === colors.success.primary ? '74, 222, 128' : currentSlide.accent === colors.categories.blue ? '96, 165, 250' : '236, 72, 153'}, 0.2)`,
                      border: `1px solid ${currentSlide.accent}50`,
                      color: currentSlide.accent,
                      boxShadow: `0 0 30px ${currentSlide.accent}30`,
                    }}
                  >
                    {currentSlide.icon}
                  </div>
                </motion.div>

                {/* Text */}
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold mb-1"
                  style={{ 
                    background: introSlide === 0 ? gradients.gold : undefined,
                    WebkitBackgroundClip: introSlide === 0 ? 'text' : undefined,
                    WebkitTextFillColor: introSlide === 0 ? 'transparent' : undefined,
                    color: introSlide === 0 ? undefined : colors.text.primary,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {currentSlide.title}
                </motion.h1>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm font-medium mb-1"
                  style={{ 
                    color: currentSlide.accent,
                    textShadow: `0 0 15px ${currentSlide.accent}40`,
                  }}
                >
                  {currentSlide.subtitle}
                </motion.p>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs leading-relaxed max-w-xs"
                  style={{ color: colors.text.secondary }}
                >
                  {currentSlide.description}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots - компактные */}
          <div 
            className="flex justify-center gap-2 mb-3 py-2 px-4 rounded-full mx-auto"
            style={{
              background: 'rgba(10, 10, 10, 0.3)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            {introSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > introSlide ? 1 : -1);
                  setIntroSlide(index);
                  hapticFeedback?.('selection');
                }}
                className="transition-all duration-300"
                style={{
                  width: index === introSlide ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: index === introSlide ? currentSlide.accent : 'rgba(255, 255, 255, 0.3)',
                  boxShadow: index === introSlide ? `0 0 8px ${currentSlide.accent}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Fixed Button - компактный */}
        <div 
          className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3"
          style={{ 
            background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.5) 60%, transparent 100%)',
            zIndex: 10,
          }}
        >
          <motion.button
            onClick={handleIntroNext}
            className="w-full h-12 rounded-xl font-semibold text-base"
            style={{ 
              background: introSlide === introSlides.length - 1 ? gradients.gold : 'rgba(255, 255, 255, 0.1)',
              border: introSlide === introSlides.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
              color: introSlide === introSlides.length - 1 ? colors.bg.primary : colors.text.primary,
              boxShadow: introSlide === introSlides.length - 1 ? '0 4px 15px rgba(201, 169, 98, 0.35)' : 'none',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {introSlide === introSlides.length - 1 ? 'Начать настройку' : 'Далее'}
          </motion.button>
        </div>
      </div>
    );
  };

  // ============ REGISTRATION STEP ============
  const renderRegistrationStep = () => (
    <StepWrapper
      title="Давайте знакомиться"
      subtitle="Как к вам обращаться?"
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!formData.name.trim()}
      progress={progress}
      backgroundImage={stepBackgrounds['registration']}
      overlayIntensity={stepOverlayIntensity['registration']}
    >
      <div className="space-y-3">
        <div>
          <label 
            className="block text-sm font-medium mb-2" 
            style={{ 
              color: colors.text.primary,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            Ваше имя *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Введите имя"
            className="w-full h-12 px-4 rounded-xl text-base outline-none transition-all"
            style={{

              ...(formData.name ? glassStyles.inputActive : glassStyles.input),
              color: colors.text.primary,
            }}
          />
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2" 
            style={{ 
              color: colors.text.primary,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            Номер телефона <span style={{ color: colors.text.tertiary }}>(необязательно)</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+998 90 123 45 67"
            className="w-full h-12 px-4 rounded-xl text-base outline-none transition-all"
            style={{

              ...(formData.phone ? glassStyles.inputActive : glassStyles.input),
              color: colors.text.primary,
            }}
          />
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2" 
            style={{ 
              color: colors.text.primary,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            Дата рождения <span style={{ color: colors.text.tertiary }}>(для напоминаний)</span>
          </label>
          <input
            type="date"
            value={formData.birthday}
            onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
            className="w-full h-12 px-4 rounded-xl text-base outline-none transition-all"
            style={{

              ...(formData.birthday ? glassStyles.inputActive : glassStyles.input),
              color: colors.text.primary,
              colorScheme: 'dark',
            }}
          />
        </div>

        <div 
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ 
            ...glassStyles.card,
            background: 'rgba(201, 169, 98, 0.15)',
            border: `1px solid ${colors.gold.borderLight}`,
          }}
        >
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" style={{ color: colors.gold.primary }}>
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Эти данные хранятся только на вашем устройстве
          </p>
        </div>
      </div>
    </StepWrapper>
  );

  // ============ LANGUAGE STEP ============
  const renderLanguageStep = () => (
    <StepWrapper
      title="Выберите язык"
      subtitle="На каком языке общаться?"
      onBack={goBack}
      onNext={goNext}
      progress={progress}
      backgroundImage={stepBackgrounds['language']}
      overlayIntensity={stepOverlayIntensity['language']}
    >
      <div className="space-y-2">
        {languages.map((lang) => {
          const isSelected = formData.language === lang.id;
          return (
            <motion.button
              key={lang.id}
              onClick={() => {
                setFormData(prev => ({ ...prev, language: lang.id }));
                hapticFeedback?.('selection');
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{

                background: isSelected 
                  ? 'rgba(201, 169, 98, 0.2)' 
                  : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: isSelected 
                  ? `1px solid ${colors.gold.border}` 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isSelected 
                  ? `0 0 20px ${colors.gold.primary}30` 
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1 text-left">
                <p className="font-medium" style={{ color: colors.text.primary }}>{lang.native}</p>
                <p className="text-sm" style={{ color: colors.text.tertiary }}>{lang.name}</p>
              </div>
              <div 
                className="w-6 h-6 rounded-full"
                style={{

                  border: isSelected ? `6px solid ${colors.gold.primary}` : '2px solid rgba(255, 255, 255, 0.3)',
                  background: 'transparent',
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </StepWrapper>
  );

  // ============ THEME STEP ============
  const renderThemeStep = () => (
    <StepWrapper
      title="Тема оформления"
      subtitle="Выберите комфортный вид"
      onBack={goBack}
      onNext={goNext}
      progress={progress}
      backgroundImage={stepBackgrounds['theme']}
      overlayIntensity={stepOverlayIntensity['theme']}
    >
      <div className="space-y-2">
        {themes.map((theme) => {
          const isSelected = formData.theme === theme.id;
          return (
            <motion.button
              key={theme.id}
              onClick={() => {
                setFormData(prev => ({ ...prev, theme: theme.id }));
                hapticFeedback?.('selection');
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                background: isSelected 
                  ? 'rgba(201, 169, 98, 0.2)' 
                  : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: isSelected 
                  ? `1px solid ${colors.gold.border}` 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isSelected 
                  ? `0 0 20px ${colors.gold.primary}30` 
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  background: isSelected ? colors.gold.primary : colors.gold.subtle,
                  color: isSelected ? colors.bg.primary : colors.gold.primary,
                }}
              >
                {theme.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium" style={{ color: colors.text.primary }}>{theme.name}</p>
                <p className="text-sm" style={{ color: colors.text.tertiary }}>{theme.description}</p>
              </div>
              <div 
                className="w-6 h-6 rounded-full"
                style={{

                  border: isSelected ? `6px solid ${colors.gold.primary}` : '2px solid rgba(255, 255, 255, 0.3)',
                  background: 'transparent',
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </StepWrapper>
  );

  // ============ CURRENCY STEP ============
  const renderCurrencyStep = () => (
    <StepWrapper
      title="Выберите валюту"
      subtitle="Основная валюта для учёта"
      onBack={goBack}
      onNext={goNext}
      progress={progress}
      backgroundImage={stepBackgrounds['currency']}
      overlayIntensity={stepOverlayIntensity['currency']}
    >
      <div className="space-y-3">
        <div className="relative">
          <svg 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
            viewBox="0 0 24 24" 
            fill="none"
            style={{ color: colors.text.tertiary }}
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск валюты..."
            className="w-full h-12 pl-12 pr-4 rounded-xl text-sm outline-none"
            style={{
              ...glassStyles.input,
              color: colors.text.primary,
            }}
          />
        </div>

        <div className="space-y-2">
          {filteredCurrencies.map((currency) => {
            const isSelected = formData.currency === currency.code;
            return (
              <motion.button
                key={currency.code}
                onClick={() => {
                  setFormData(prev => ({ ...prev, currency: currency.code }));
                  hapticFeedback?.('selection');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{

                  background: isSelected ? 'rgba(201, 169, 98, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                  border: isSelected ? `1px solid ${colors.gold.border}` : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isSelected ? `0 0 20px ${colors.gold.primary}30` : '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">{currency.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium" style={{ color: colors.text.primary }}>{currency.name}</p>
                  <p className="text-sm" style={{ color: colors.text.tertiary }}>{currency.code} • {currency.symbol}</p>
                </div>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{

                    border: isSelected ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                    background: isSelected ? colors.gold.primary : 'transparent',
                  }}
                >
                  {isSelected && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" style={{ color: colors.bg.primary }}>
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </StepWrapper>
  );

  // ============ BUDGET STEP ============
  const renderBudgetStep = () => (
    <StepWrapper
      title="Ваш бюджет"
      subtitle="Укажите начальные данные"
      onBack={goBack}
      onNext={goNext}
      progress={progress}
      backgroundImage={stepBackgrounds['budget']}
      overlayIntensity={stepOverlayIntensity['budget']}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
            Текущий баланс
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={balanceInput}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setBalanceInput(value ? formatNumber(parseInt(value)) : '');
                setFormData(prev => ({ ...prev, initialBalance: parseInt(value) || 0 }));
              }}
              placeholder="0"
              className="w-full h-12 px-4 pr-16 rounded-xl text-xl font-semibold outline-none transition-all"
              style={{
                ...(formData.initialBalance > 0 ? {
                  ...glassStyles.input,
                  border: `1px solid ${colors.success.border}`,
                  boxShadow: `0 0 15px ${colors.success.primary}20`,
                } : glassStyles.input),
                color: colors.text.primary,
              }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.text.tertiary }}>
              {getCurrencySymbol()}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
            Месячный бюджет
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={budgetInput}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setBudgetInput(value ? formatNumber(parseInt(value)) : '');
                setFormData(prev => ({ ...prev, monthlyBudget: parseInt(value) || 0 }));
              }}
              placeholder="0"
              className="w-full h-12 px-4 pr-16 rounded-xl text-xl font-semibold outline-none transition-all"
              style={{
                ...(formData.monthlyBudget > 0 ? glassStyles.inputActive : glassStyles.input),
                color: colors.text.primary,
              }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.text.tertiary }}>
              {getCurrencySymbol()}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {budgetPresets.map((preset) => (
              <button
                key={preset.amount}
                onClick={() => {
                  setBudgetInput(formatNumber(preset.amount));
                  setFormData(prev => ({ ...prev, monthlyBudget: preset.amount }));
                  hapticFeedback?.('selection');
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: formData.monthlyBudget === preset.amount 
                    ? 'rgba(201, 169, 98, 0.3)' 
                    : 'rgba(0, 0, 0, 0.25)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: formData.monthlyBudget === preset.amount 
                    ? `1px solid ${colors.gold.border}` 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: formData.monthlyBudget === preset.amount ? colors.gold.primary : colors.text.secondary,
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepWrapper>
  );

  // ============ SALARY DAY STEP ============
  const renderSalaryDayStep = () => (
    <StepWrapper
      title="День зарплаты"
      subtitle="Когда вы получаете доход?"
      onBack={goBack}
      onNext={goNext}
      progress={progress}
      backgroundImage={stepBackgrounds['salary-day']}
      overlayIntensity={stepOverlayIntensity['salary-day']}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const isSelected = formData.salaryDay === day;
            return (
              <motion.button
                key={day}
                onClick={() => {
                  setFormData(prev => ({ ...prev, salaryDay: day }));
                  hapticFeedback?.('selection');
                }}
                className="aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all"
                style={{

                  background: isSelected ? colors.gold.primary : 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? `0 0 15px ${colors.gold.primary}40` : '0 2px 8px rgba(0, 0, 0, 0.2)',
                  color: isSelected ? colors.bg.primary : colors.text.secondary,
                }}
                whileTap={{ scale: 0.9 }}
              >
                {day}
              </motion.button>
            );
          })}
        </div>

        <div 
          className="text-center p-4 rounded-xl"
          style={{ background: colors.gold.muted, border: `1px solid ${colors.gold.borderLight}` }}
        >
          <p className="text-sm" style={{ color: colors.text.secondary }}>Выбрано:</p>
          <p className="text-2xl font-bold" style={{ color: colors.gold.primary }}>
            {formData.salaryDay}-е число
          </p>
        </div>
      </div>
    </StepWrapper>
  );

  // ============ EXPENSE CATEGORIES STEP ============
  const renderExpenseCategoriesStep = () => (
    <StepWrapper
      title="Категории расходов"
      subtitle="На что вы обычно тратите?"
      onBack={goBack}
      onNext={goNext}
      nextDisabled={formData.expenseCategories.length === 0}
      progress={progress}
      backgroundImage={stepBackgrounds['expense-categories']}
      overlayIntensity={stepOverlayIntensity['expense-categories']}
    >
      <p className="text-xs mb-4" style={{ color: colors.text.tertiary }}>
        Выбрано: {formData.expenseCategories.length} из {expenseCategories.length}
      </p>
      
      <div className="grid grid-cols-4 gap-1.5">
        {expenseCategories.map((category) => {
          const isSelected = formData.expenseCategories.includes(category.id);
          return (
            <motion.button
              key={category.id}
              onClick={() => toggleCategory(category.id, 'expense')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all"
              style={{

                background: isSelected ? `${category.color}25` : 'rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: isSelected ? `1px solid ${category.color}60` : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isSelected ? `0 0 15px ${category.color}30` : '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ 
                  background: isSelected ? category.color : `${category.color}20`,
                  color: isSelected ? '#fff' : category.color,
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  {category.icon}
                </svg>
              </div>
              <span 
                className="text-[10px] font-medium text-center leading-tight"
                style={{ color: isSelected ? colors.text.primary : colors.text.secondary }}
              >
                {category.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </StepWrapper>
  );

  // ============ INCOME CATEGORIES STEP ============
  const renderIncomeCategoriesStep = () => (
    <StepWrapper
      title="Источники дохода"
      subtitle="Откуда вы получаете деньги?"
      onBack={goBack}
      onNext={goNext}
      nextDisabled={formData.incomeCategories.length === 0}
      progress={progress}
      backgroundImage={stepBackgrounds['income-categories']}
      overlayIntensity={stepOverlayIntensity['income-categories']}
    >
      <p className="text-xs mb-4" style={{ color: colors.text.tertiary }}>
        Выбрано: {formData.incomeCategories.length} из {incomeCategories.length}
      </p>
      
      <div className="grid grid-cols-4 gap-1.5">
        {incomeCategories.map((category) => {
          const isSelected = formData.incomeCategories.includes(category.id);
          return (
            <motion.button
              key={category.id}
              onClick={() => toggleCategory(category.id, 'income')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all"
              style={{

                background: isSelected ? `${category.color}25` : 'rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: isSelected ? `1px solid ${category.color}60` : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isSelected ? `0 0 15px ${category.color}30` : '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ 
                  background: isSelected ? category.color : `${category.color}20`,
                  color: isSelected ? '#fff' : category.color,
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  {category.icon}
                </svg>
              </div>
              <span 
                className="text-[10px] font-medium text-center leading-tight"
                style={{ color: isSelected ? colors.text.primary : colors.text.secondary }}
              >
                {category.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </StepWrapper>
  );

  // ============ GOALS STEP ============
  const renderGoalsStep = () => (
    <StepWrapper
      title="Ваши цели"
      subtitle="Чего хотите достичь?"
      onBack={goBack}
      onNext={goNext}
      nextDisabled={formData.goals.length === 0}
      progress={progress}
      backgroundImage={stepBackgrounds['goals']}
      overlayIntensity={stepOverlayIntensity['goals']}
    >
      <div className="space-y-2">
        {goals.map((goal) => {
          const isSelected = formData.goals.includes(goal.id);
          return (
            <motion.button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{

                background: isSelected ? 'rgba(201, 169, 98, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: isSelected ? `1px solid ${colors.gold.border}` : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isSelected ? `0 0 20px ${colors.gold.primary}30` : '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  background: isSelected ? colors.gold.primary : colors.gold.subtle,
                  color: isSelected ? colors.bg.primary : colors.gold.primary,
                }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  {goal.icon}
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium" style={{ color: colors.text.primary }}>{goal.name}</p>
                <p className="text-sm" style={{ color: colors.text.tertiary }}>{goal.description}</p>
              </div>
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{

                  border: isSelected ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                  background: isSelected ? colors.gold.primary : 'transparent',
                }}
              >
                {isSelected && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" style={{ color: colors.bg.primary }}>
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </StepWrapper>
  );

  // ============ LIFESTYLE STEP ============
  const renderLifestyleStep = () => (
    <StepWrapper
      title="Ваш образ жизни"
      subtitle="Это поможет точнее планировать"
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!formData.lifestyle}
      progress={progress}
      backgroundImage={stepBackgrounds['lifestyle']}
      overlayIntensity={stepOverlayIntensity['lifestyle']}
    >
      <div className="space-y-2">
        {lifestyleOptions.map((option) => {
          const isSelected = formData.lifestyle === option.id;
          return (
            <motion.button
              key={option.id}
              onClick={() => {
                setFormData(prev => ({ ...prev, lifestyle: option.id as OnboardingFormData['lifestyle'] }));
                hapticFeedback?.('selection');
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{

                background: isSelected ? 'rgba(201, 169, 98, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: isSelected ? `1px solid ${colors.gold.border}` : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isSelected ? `0 0 20px ${colors.gold.primary}30` : '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  background: isSelected ? colors.gold.primary : colors.gold.subtle,
                  color: isSelected ? colors.bg.primary : colors.gold.primary,
                }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  {option.icon}
                </svg>
              </div>
              <span className="flex-1 text-left font-medium" style={{ color: colors.text.primary }}>
                {option.name}
              </span>
              <div 
                className="w-6 h-6 rounded-full"
                style={{

                  border: isSelected ? `6px solid ${colors.gold.primary}` : '2px solid rgba(255, 255, 255, 0.3)',
                  background: 'transparent',
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </StepWrapper>
  );

  // ============ NOTIFICATIONS STEP ============
  const renderNotificationsStep = () => (
    <StepWrapper
      title="Напоминания"
      subtitle="Как часто напоминать?"
      onBack={goBack}
      onNext={goNext}
      nextLabel="Завершить"
      progress={progress}
      backgroundImage={stepBackgrounds['notifications']}
      overlayIntensity={stepOverlayIntensity['notifications']}
    >
      <div className="space-y-2">
        {notificationOptions.map((option) => {
          const isSelected = formData.notifications === option.id;
          return (
            <motion.button
              key={option.id}
              onClick={() => {
                setFormData(prev => ({ ...prev, notifications: option.id as OnboardingFormData['notifications'] }));
                hapticFeedback?.('selection');
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{

                background: isSelected ? 'rgba(201, 169, 98, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: isSelected ? `1px solid ${colors.gold.border}` : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isSelected ? `0 0 20px ${colors.gold.primary}30` : '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  background: isSelected ? colors.gold.primary : 'rgba(255, 255, 255, 0.1)',
                  color: isSelected ? colors.bg.primary : colors.gold.primary,
                }}
              >
                {option.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium" style={{ color: colors.text.primary }}>{option.name}</p>
                <p className="text-sm" style={{ color: colors.text.tertiary }}>{option.description}</p>
              </div>
              <div 
                className="w-6 h-6 rounded-full"
                style={{

                  border: isSelected ? `6px solid ${colors.gold.primary}` : '2px solid rgba(255, 255, 255, 0.3)',
                  background: 'transparent',
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </StepWrapper>
  );

  // ============ COMPLETE STEP ============
  const renderCompleteStep = () => {
    const selectedCurrency = currencies.find(c => c.code === formData.currency);
    
    return (
      <div className="page-scrollable" style={{ background: colors.bg.primary }}>
        {/* Background Image - FIXED */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${stepBackgrounds['complete']})`,
            zIndex: 0,
          }}
        />
        
        {/* Gradient overlay - LIGHT для празднования! */}
        <div 
          className="fixed inset-0"
          style={{ 
            background: getOverlayGradient('light'),
            zIndex: 1,
          }}
        />
        
        <div className="relative min-h-full flex flex-col items-center justify-center px-4 pb-24 text-center" style={{ zIndex: 2 }}>
          {/* Glass card container - компактный */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="p-5 rounded-2xl w-full max-w-sm"
            style={{
              background: 'rgba(10, 10, 10, 0.4)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative mb-4 mx-auto w-fit"
            >
              <div 
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: colors.success.subtle, transform: 'scale(2)' }}
              />
              <div 
                className="relative w-16 h-16 rounded-full flex items-center justify-center"
                style={{ 
                  background: colors.success.primary,
                  boxShadow: `0 0 25px ${colors.success.primary}50`,
                }}
              >
                <motion.svg 
                  className="w-8 h-8" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <motion.path 
                    d="M5 13l4 4L19 7" 
                    stroke={colors.bg.primary}
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  />
                </motion.svg>
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-bold mb-1"
              style={{ 
                color: colors.text.primary,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Всё готово!
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm mb-4"
              style={{ color: colors.text.secondary }}
            >
              {formData.name ? `${formData.name}, д` : 'Д'}обро пожаловать в LifeLedger
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-3 rounded-xl"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="grid grid-cols-3 gap-3 text-left">
                <div>
                  <p className="text-[10px]" style={{ color: colors.text.tertiary }}>Валюта</p>
                  <p className="text-sm font-medium" style={{ color: colors.text.primary }}>
                    {selectedCurrency?.flag} {formData.currency}
                  </p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: colors.text.tertiary }}>Баланс</p>
                  <p className="text-sm font-medium" style={{ color: colors.success.primary }}>
                    {formatNumber(formData.initialBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: colors.text.tertiary }}>Бюджет</p>
                  <p className="text-sm font-medium" style={{ color: colors.gold.primary }}>
                    {formatNumber(formData.monthlyBudget)}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Fixed Button - компактный */}
        <div 
          className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3"
          style={{ 
            background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.5) 60%, transparent 100%)',
            zIndex: 10,
          }}
        >
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={completeOnboarding}
            className="w-full h-12 rounded-xl font-semibold text-base relative overflow-hidden"
            style={{ 
              background: gradients.gold,
              color: colors.bg.primary,
              boxShadow: '0 4px 20px rgba(201, 169, 98, 0.4)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: gradients.shimmer }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <span className="relative z-10">Начать использовать</span>
          </motion.button>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 'intro': return renderIntroStep();
      case 'registration': return renderRegistrationStep();
      case 'language': return renderLanguageStep();
      case 'theme': return renderThemeStep();
      case 'currency': return renderCurrencyStep();
      case 'budget': return renderBudgetStep();
      case 'salary-day': return renderSalaryDayStep();
      case 'expense-categories': return renderExpenseCategoriesStep();
      case 'income-categories': return renderIncomeCategoriesStep();
      case 'goals': return renderGoalsStep();
      case 'lifestyle': return renderLifestyleStep();
      case 'notifications': return renderNotificationsStep();
      case 'complete': return renderCompleteStep();
      default: return null;
    }
  };

  return renderStepContent();
}

// ============================================================================
// STEP WRAPPER - С ФОНОВЫМ ИЗОБРАЖЕНИЕМ
// ============================================================================

interface StepWrapperProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  progress: number;
  backgroundImage?: string;
  overlayIntensity?: OverlayIntensity;
}

function StepWrapper({ 
  title, 
  subtitle, 
  children, 
  onBack, 
  onNext, 
  nextDisabled = false,
  nextLabel = 'Далее',
  progress,
  backgroundImage,
  overlayIntensity = 'medium',
}: StepWrapperProps) {
  return (
    <div className="page-scrollable" style={{ background: colors.bg.primary }}>
      {/* Background Image - FIXED */}
      {backgroundImage && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            zIndex: 0,
          }}
        />
      )}
      
      {/* Gradient overlay - адаптивная прозрачность */}
      {backgroundImage && (
        <div 
          className="fixed inset-0"
          style={{ 
            background: getOverlayGradient(overlayIntensity),
            zIndex: 1,
          }}
        />
      )}
      
      <div className="relative min-h-full px-4 pb-24" style={{ zIndex: 2 }}>
        {/* Header - компактный */}
        <div className="pt-3 pb-2">
          {/* Progress bar */}
          <div 
            className="h-1 rounded-full overflow-hidden mb-3" 
            style={{ background: 'rgba(255, 255, 255, 0.2)' }}
          >
            <motion.div 
              className="h-full rounded-full"
              style={{ background: gradients.gold }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Back button & Title */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack} 
              className="w-9 h-9 flex items-center justify-center rounded-lg"
              style={{ 
                background: 'rgba(10, 10, 10, 0.5)', 
                color: colors.text.primary,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div>
              <h1 
                className="text-lg font-bold"
                style={{ 
                  color: colors.text.primary,
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                }}
              >
                {title}
              </h1>
              <p 
                className="text-sm"
                style={{ 
                  color: colors.text.secondary,
                  textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                }}
              >
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pb-2">
          {children}
        </div>
      </div>

      {/* Fixed Button - компактный */}
      <div 
        className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3"
        style={{ 
          background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.6) 60%, transparent 100%)',
          zIndex: 10,
        }}
      >
        <motion.button
          onClick={onNext}
          disabled={nextDisabled}
          className="w-full h-12 rounded-xl font-semibold text-base transition-all"
          style={{ 
            background: nextDisabled ? 'rgba(255, 255, 255, 0.1)' : gradients.gold,
            color: nextDisabled ? colors.text.tertiary : colors.bg.primary,
            opacity: nextDisabled ? 0.5 : 1,
            boxShadow: nextDisabled ? 'none' : '0 4px 15px rgba(201, 169, 98, 0.35)',
          }}
          whileTap={nextDisabled ? {} : { scale: 0.98 }}
        >
          {nextLabel}
        </motion.button>
      </div>
    </div>
  );
}