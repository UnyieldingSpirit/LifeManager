// src/lib/index.ts
// ============================================================================
// LIFELEDGER - УТИЛИТЫ, КОНСТАНТЫ, ХЕЛПЕРЫ
// ============================================================================

import { TransactionType, Category, EnabledModule } from '@/types';

// ============================================================================
// ЦВЕТОВАЯ СИСТЕМА
// ============================================================================

export const colors = {
  gold: {
    primary: '#C9A962',
    light: '#E8D5A3',
    dark: '#A68B4B',
    subtle: 'rgba(201, 169, 98, 0.15)',
    border: 'rgba(201, 169, 98, 0.40)',
  },
  bg: {
    primary: '#0A0A0A',
    secondary: '#111111',
    elevated: '#1A1A1A',
  },
  text: {
    primary: '#F5F5F5',
    secondary: '#A3A3A3',
    tertiary: '#737373',
  },
  semantic: {
    success: '#4ADE80',
    successSubtle: 'rgba(74, 222, 128, 0.12)',
    warning: '#FBBF24',
    warningSubtle: 'rgba(251, 191, 36, 0.12)',
    error: '#F87171',
    errorSubtle: 'rgba(248, 113, 113, 0.12)',
    info: '#60A5FA',
  },
  modules: {
    finance: '#4ADE80',
    tasks: '#60A5FA',
    events: '#A855F7',
    habits: '#F97316',
    notes: '#FACC15',
    contacts: '#EC4899',
  },
};

export const gradients = {
  gold: `linear-gradient(135deg, ${colors.gold.primary} 0%, ${colors.gold.light} 50%, ${colors.gold.primary} 100%)`,
  shimmer: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)`,
};

// ============================================================================
// КАТЕГОРИИ
// ============================================================================

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Продукты', icon: '🛒', color: '#4ADE80' },
  { id: 'transport', name: 'Транспорт', icon: '🚗', color: '#60A5FA' },
  { id: 'housing', name: 'Жильё', icon: '🏠', color: '#A855F7' },
  { id: 'utilities', name: 'Коммуналка', icon: '💡', color: '#FBBF24' },
  { id: 'health', name: 'Здоровье', icon: '💊', color: '#F87171' },
  { id: 'entertainment', name: 'Развлечения', icon: '🎮', color: '#EC4899' },
  { id: 'shopping', name: 'Покупки', icon: '🛍️', color: '#8B5CF6' },
  { id: 'cafe', name: 'Кафе', icon: '☕', color: '#F97316' },
  { id: 'education', name: 'Образование', icon: '📚', color: '#14B8A6' },
  { id: 'subscriptions', name: 'Подписки', icon: '📱', color: '#6366F1' },
  { id: 'gifts', name: 'Подарки', icon: '🎁', color: '#EC4899' },
  { id: 'other', name: 'Другое', icon: '📦', color: '#64748B' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Зарплата', icon: '💰', color: '#4ADE80' },
  { id: 'freelance', name: 'Фриланс', icon: '💻', color: '#60A5FA' },
  { id: 'business', name: 'Бизнес', icon: '🏢', color: '#A855F7' },
  { id: 'investments', name: 'Инвестиции', icon: '📈', color: '#FBBF24' },
  { id: 'gifts', name: 'Подарки', icon: '🎁', color: '#EC4899' },
  { id: 'other', name: 'Другое', icon: '📦', color: '#64748B' },
];

export const CURRENCIES = [
  { code: 'UZS', name: 'Сум', symbol: "so'm", flag: '🇺🇿' },
  { code: 'RUB', name: 'Рубль', symbol: '₽', flag: '🇷🇺' },
  { code: 'USD', name: 'Доллар', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Евро', symbol: '€', flag: '🇪🇺' },
  { code: 'KZT', name: 'Тенге', symbol: '₸', flag: '🇰🇿' },
];

export const MODULE_CONFIG: Record<EnabledModule, { name: string; icon: string; color: string; route: string }> = {
  finance: { name: 'Финансы', icon: '💰', color: colors.modules.finance, route: '/finance' },
  tasks: { name: 'Задачи', icon: '✅', color: colors.modules.tasks, route: '/tasks' },
  events: { name: 'Календарь', icon: '📅', color: colors.modules.events, route: '/calendar' },
  habits: { name: 'Привычки', icon: '🔥', color: colors.modules.habits, route: '/habits' },
  notes: { name: 'Заметки', icon: '📝', color: colors.modules.notes, route: '/notes' },
  contacts: { name: 'Контакты', icon: '👥', color: colors.modules.contacts, route: '/contacts' },
};

// ============================================================================
// ФОНЫ СТРАНИЦ (описания для AI-генерации)
// ============================================================================

export const PAGE_BACKGROUNDS = {
  dashboard: {
    image: '/onboarding-welcome.jpg',
    overlay: 'heavy' as const,
    description: `
      DASHBOARD - Центр управления жизнью
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      КОМПОЗИЦИЯ: Контроль, обзор, баланс
      ФОН: Глубокий карбон (#0A0A0A) с золотистым свечением
      ЭЛЕМЕНТЫ: Абстрактные виджеты, круговые диаграммы, линии графиков
      СТИЛЬ: Золотые (#C9A962) акценты, тонкие соединительные линии
      ИКОНКИ: 📊 💰 ✅
      АТМОСФЕРА: "Всё под контролем"
    `,
  },
  finance: {
    image: '/onboarding-finance.jpg',
    overlay: 'medium' as const,
    description: `
      ФИНАНСЫ - Богатство и рост
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      КОМПОЗИЦИЯ: Восходящий тренд, накопления
      ФОН: Тёмный с зелёным оттенком
      ЭЛЕМЕНТЫ: График роста (#4ADE80), монеты, круговая диаграмма
      СТИЛЬ: Зелёное свечение успеха, золотые акценты
      ИКОНКИ: 💵 📈 🎯
      АТМОСФЕРА: "Финансовая ясность"
    `,
  },
  tasks: {
    image: '/onboarding-tasks.jpg',
    overlay: 'medium' as const,
    description: `
      ЗАДАЧИ - Продуктивность
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      КОМПОЗИЦИЯ: Прогресс, достижения
      ФОН: Тёмный с синим оттенком
      ЭЛЕМЕНТЫ: Чек-листы (#60A5FA), progress bar, kanban
      СТИЛЬ: Синее свечение активности, зелёные галочки
      ИКОНКИ: ✅ 📋 🎯
      АТМОСФЕРА: "Каждая задача → цель"
    `,
  },
  calendar: {
    image: '/onboarding-calendar.jpg',
    overlay: 'medium' as const,
    description: `
      КАЛЕНДАРЬ - Время и планирование
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      КОМПОЗИЦИЯ: Ритм жизни, события
      ФОН: Тёмный с фиолетовым оттенком
      ЭЛЕМЕНТЫ: Сетка 7×5, светящиеся дни, цветные точки событий
      СТИЛЬ: Фиолетовое (#A855F7) свечение текущего дня
      ИКОНКИ: 🎂 📌 🔔
      АТМОСФЕРА: "Никогда не забывай важное"
    `,
  },
  habits: {
    image: '/onboarding-habits.jpg',
    overlay: 'medium' as const,
    description: `
      ПРИВЫЧКИ - Дисциплина и streak
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      КОМПОЗИЦИЯ: Огонь, цепочка дней
      ФОН: Тёмный с оранжевым оттенком
      ЭЛЕМЕНТЫ: Пламя streak (#F97316), connected dots
      СТИЛЬ: Огненное свечение, градиент тепла
      ИКОНКИ: 🔥 ⭐ 💪
      АТМОСФЕРА: "Маленькие шаги → большие изменения"
    `,
  },
  notes: {
    image: '/onboarding-modules.jpg',
    overlay: 'medium' as const,
    description: `
      ЗАМЕТКИ - Идеи и мысли
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      КОМПОЗИЦИЯ: Творчество, организация
      ФОН: Тёмный с жёлтым оттенком
      ЭЛЕМЕНТЫ: Карточки (#FACC15), линии текста, папки
      СТИЛЬ: Жёлтое свечение как от лампы
      ИКОНКИ: 📝 💡 📁
      АТМОСФЕРА: "Мысли организованы"
    `,
  },
  contacts: {
    image: '/onboarding-lifestyle.jpg',
    overlay: 'medium' as const,
    description: `
      КОНТАКТЫ - Связи и люди
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      КОМПОЗИЦИЯ: Отношения, сеть
      ФОН: Тёмный с розовым оттенком
      ЭЛЕМЕНТЫ: Аватары (#EC4899), линии связей
      СТИЛЬ: Розовое свечение, мягкие градиенты
      ИКОНКИ: 👥 💕 🎂
      АТМОСФЕРА: "Близкие люди рядом"
    `,
  },
  settings: {
    image: '/onboarding-preferences.jpg',
    overlay: 'heavy' as const,
    description: `
      НАСТРОЙКИ - Персонализация
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      КОМПОЗИЦИЯ: Контроль, точность
      ФОН: Нейтральный тёмный
      ЭЛЕМЕНТЫ: Шестерёнки, слайдеры, toggles
      СТИЛЬ: Золотые акценты (#C9A962)
      ИКОНКИ: ⚙️ 🔔 🎨
      АТМОСФЕРА: "Настройте под себя"
    `,
  },
  more: {
    image: '/onboarding-modules.jpg',
    overlay: 'heavy' as const,
    description: `
      ЕЩЁ - Дополнительные возможности
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      КОМПОЗИЦИЯ: Расширение, модули
      ФОН: Тёмный с многоцветными акцентами
      ЭЛЕМЕНТЫ: Сетка иконок модулей
      СТИЛЬ: Радужные акценты каждого модуля
      АТМОСФЕРА: "Ещё больше возможностей"
    `,
  },
};

// ============================================================================
// УТИЛИТЫ
// ============================================================================

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatCurrency = (amount: number, currency: string): string => {
  const formatted = new Intl.NumberFormat('ru-RU').format(Math.abs(amount));
  switch (currency) {
    case 'UZS': return `${formatted} so'm`;
    case 'RUB': return `${formatted} ₽`;
    case 'USD': return `$${formatted}`;
    case 'EUR': return `€${formatted}`;
    case 'KZT': return `${formatted} ₸`;
    default: return `${formatted} ${currency}`;
  }
};

export const formatCompactCurrency = (amount: number, currency: string): string => {
  const abs = Math.abs(amount);
  let formatted: string;
  if (abs >= 1e9) formatted = (abs / 1e9).toFixed(1) + 'B';
  else if (abs >= 1e6) formatted = (abs / 1e6).toFixed(1) + 'M';
  else if (abs >= 1e3) formatted = (abs / 1e3).toFixed(1) + 'K';
  else formatted = abs.toString();
  
  switch (currency) {
    case 'RUB': return `${formatted} ₽`;
    case 'USD': return `$${formatted}`;
    case 'EUR': return `€${formatted}`;
    default: return formatted;
  }
};

export const getCategoryById = (id: string, type: TransactionType): Category | undefined => {
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  return categories.find(c => c.id === id);
};

export const getStartOfMonth = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};

export const getEndOfMonth = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
};

export const isWithinPeriod = (date: string, start: string, end: string): boolean => {
  const d = new Date(date).getTime();
  return d >= new Date(start).getTime() && d <= new Date(end).getTime();
};

export const getGreeting = (): { text: string; emoji: string } => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Доброе утро', emoji: '☀️' };
  if (hour >= 12 && hour < 17) return { text: 'Добрый день', emoji: '🌤️' };
  if (hour >= 17 && hour < 22) return { text: 'Добрый вечер', emoji: '🌅' };
  return { text: 'Доброй ночи', emoji: '🌙' };
};

export const formatRelativeDate = (dateString: string): string => {
  const target = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const days = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Сегодня';
  if (days === 1) return 'Завтра';
  if (days === -1) return 'Вчера';
  if (days > 0 && days <= 7) return `Через ${days} дн.`;
  if (days < 0 && days >= -7) return `${Math.abs(days)} дн. назад`;
  return target.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

// ============================================================================
// ЛОКАЛИЗАЦИЯ
// ============================================================================

export const translations = {
  ru: {
    'nav.home': 'Главная',
    'nav.finance': 'Финансы',
    'nav.tasks': 'Задачи',
    'nav.calendar': 'Календарь',
    'nav.habits': 'Привычки',
    'nav.notes': 'Заметки',
    'nav.contacts': 'Контакты',
    'nav.more': 'Ещё',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.add': 'Добавить',
  },
  en: {
    'nav.home': 'Home',
    'nav.finance': 'Finance',
    'nav.tasks': 'Tasks',
    'nav.calendar': 'Calendar',
    'nav.habits': 'Habits',
    'nav.notes': 'Notes',
    'nav.contacts': 'Contacts',
    'nav.more': 'More',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.add': 'Add',
  },
  uz: {
    'nav.home': 'Bosh sahifa',
    'nav.finance': 'Moliya',
    'nav.tasks': 'Vazifalar',
    'nav.calendar': 'Kalendar',
    'nav.habits': 'Odatlar',
    'nav.notes': 'Eslatmalar',
    'nav.contacts': 'Kontaktlar',
    'nav.more': 'Yana',
    'common.save': 'Saqlash',
    'common.cancel': 'Bekor',
    'common.delete': "O'chirish",
    'common.add': "Qo'shish",
  },
};
