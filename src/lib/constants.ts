// src/lib/constants.ts

// Локальные типы для констант
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  locale: string;
}

export interface Category {
  id: string;
  name: { ru: string; en: string; uz: string };
  icon: string;
  color: string;
  type: 'expense' | 'income';
  budgetSuggestion?: number;
}

// ============================================================================
// ВАЛЮТЫ
// ============================================================================

export const CURRENCIES: Currency[] = [
  { code: 'UZS', name: 'Узбекский сум', symbol: "so'm", flag: '🇺🇿', locale: 'uz-UZ' },
  { code: 'RUB', name: 'Российский рубль', symbol: '₽', flag: '🇷🇺', locale: 'ru-RU' },
  { code: 'USD', name: 'Доллар США', symbol: '$', flag: '🇺🇸', locale: 'en-US' },
  { code: 'EUR', name: 'Евро', symbol: '€', flag: '🇪🇺', locale: 'de-DE' },
  { code: 'KZT', name: 'Казахстанский тенге', symbol: '₸', flag: '🇰🇿', locale: 'kk-KZ' },
  { code: 'GBP', name: 'Фунт стерлингов', symbol: '£', flag: '🇬🇧', locale: 'en-GB' },
  { code: 'TRY', name: 'Турецкая лира', symbol: '₺', flag: '🇹🇷', locale: 'tr-TR' },
  { code: 'AED', name: 'Дирхам ОАЭ', symbol: 'د.إ', flag: '🇦🇪', locale: 'ar-AE' },
  { code: 'CNY', name: 'Китайский юань', symbol: '¥', flag: '🇨🇳', locale: 'zh-CN' },
  { code: 'JPY', name: 'Японская иена', symbol: '¥', flag: '🇯🇵', locale: 'ja-JP' },
];

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find((c) => c.code === code);
};

// ============================================================================
// КАТЕГОРИИ РАСХОДОВ
// ============================================================================

export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: { ru: 'Продукты', en: 'Groceries', uz: 'Oziq-ovqat' },
    icon: '🛒',
    color: '#4ADE80',
    type: 'expense',
    budgetSuggestion: 0.25,
  },
  {
    id: 'transport',
    name: { ru: 'Транспорт', en: 'Transport', uz: 'Transport' },
    icon: '🚗',
    color: '#60A5FA',
    type: 'expense',
    budgetSuggestion: 0.10,
  },
  {
    id: 'housing',
    name: { ru: 'Жильё', en: 'Housing', uz: 'Uy-joy' },
    icon: '🏠',
    color: '#F97316',
    type: 'expense',
    budgetSuggestion: 0.30,
  },
  {
    id: 'utilities',
    name: { ru: 'Коммуналка', en: 'Utilities', uz: 'Kommunal' },
    icon: '💡',
    color: '#FBBF24',
    type: 'expense',
    budgetSuggestion: 0.10,
  },
  {
    id: 'health',
    name: { ru: 'Здоровье', en: 'Health', uz: 'Salomatlik' },
    icon: '💊',
    color: '#F87171',
    type: 'expense',
    budgetSuggestion: 0.05,
  },
  {
    id: 'entertainment',
    name: { ru: 'Развлечения', en: 'Entertainment', uz: "Ko'ngilochar" },
    icon: '🎮',
    color: '#A855F7',
    type: 'expense',
    budgetSuggestion: 0.10,
  },
  {
    id: 'shopping',
    name: { ru: 'Покупки', en: 'Shopping', uz: 'Xaridlar' },
    icon: '🛍️',
    color: '#EC4899',
    type: 'expense',
    budgetSuggestion: 0.05,
  },
  {
    id: 'education',
    name: { ru: 'Образование', en: 'Education', uz: "Ta'lim" },
    icon: '📚',
    color: '#14B8A6',
    type: 'expense',
    budgetSuggestion: 0.05,
  },
  {
    id: 'beauty',
    name: { ru: 'Красота', en: 'Beauty', uz: "Go'zallik" },
    icon: '💅',
    color: '#F472B6',
    type: 'expense',
  },
  {
    id: 'cafe',
    name: { ru: 'Кафе', en: 'Cafe', uz: 'Kafe' },
    icon: '☕',
    color: '#92400E',
    type: 'expense',
  },
  {
    id: 'clothing',
    name: { ru: 'Одежда', en: 'Clothing', uz: 'Kiyim' },
    icon: '👕',
    color: '#818CF8',
    type: 'expense',
  },
  {
    id: 'gifts',
    name: { ru: 'Подарки', en: 'Gifts', uz: 'Sovgʻalar' },
    icon: '🎁',
    color: '#FB7185',
    type: 'expense',
  },
  {
    id: 'kids',
    name: { ru: 'Дети', en: 'Kids', uz: 'Bolalar' },
    icon: '👶',
    color: '#67E8F9',
    type: 'expense',
  },
  {
    id: 'pets',
    name: { ru: 'Питомцы', en: 'Pets', uz: 'Uy hayvonlari' },
    icon: '🐕',
    color: '#FCD34D',
    type: 'expense',
  },
  {
    id: 'sports',
    name: { ru: 'Спорт', en: 'Sports', uz: 'Sport' },
    icon: '⚽',
    color: '#34D399',
    type: 'expense',
  },
  {
    id: 'travel',
    name: { ru: 'Путешествия', en: 'Travel', uz: 'Sayohat' },
    icon: '✈️',
    color: '#0EA5E9',
    type: 'expense',
  },
  {
    id: 'subscriptions',
    name: { ru: 'Подписки', en: 'Subscriptions', uz: 'Obunalar' },
    icon: '📱',
    color: '#A78BFA',
    type: 'expense',
  },
  {
    id: 'communication',
    name: { ru: 'Связь', en: 'Communication', uz: 'Aloqa' },
    icon: '📞',
    color: '#38BDF8',
    type: 'expense',
  },
  {
    id: 'taxi',
    name: { ru: 'Такси', en: 'Taxi', uz: 'Taksi' },
    icon: '🚕',
    color: '#FDE047',
    type: 'expense',
  },
  {
    id: 'other_expense',
    name: { ru: 'Другое', en: 'Other', uz: 'Boshqa' },
    icon: '📦',
    color: '#6B7280',
    type: 'expense',
  },
];

// ============================================================================
// КАТЕГОРИИ ДОХОДОВ
// ============================================================================

export const INCOME_CATEGORIES: Category[] = [
  {
    id: 'salary',
    name: { ru: 'Зарплата', en: 'Salary', uz: 'Maosh' },
    icon: '💼',
    color: '#4ADE80',
    type: 'income',
  },
  {
    id: 'freelance',
    name: { ru: 'Фриланс', en: 'Freelance', uz: 'Frilanс' },
    icon: '💻',
    color: '#60A5FA',
    type: 'income',
  },
  {
    id: 'business',
    name: { ru: 'Бизнес', en: 'Business', uz: 'Biznes' },
    icon: '🏢',
    color: '#F97316',
    type: 'income',
  },
  {
    id: 'investments',
    name: { ru: 'Инвестиции', en: 'Investments', uz: 'Investitsiyalar' },
    icon: '📈',
    color: '#8B5CF6',
    type: 'income',
  },
  {
    id: 'rental',
    name: { ru: 'Аренда', en: 'Rental', uz: 'Ijara' },
    icon: '🏘️',
    color: '#EC4899',
    type: 'income',
  },
  {
    id: 'cashback',
    name: { ru: 'Кэшбэк', en: 'Cashback', uz: 'Keshbek' },
    icon: '💳',
    color: '#14B8A6',
    type: 'income',
  },
  {
    id: 'gifts_income',
    name: { ru: 'Подарки', en: 'Gifts', uz: 'Sovgʻalar' },
    icon: '🎁',
    color: '#FB7185',
    type: 'income',
  },
  {
    id: 'pension',
    name: { ru: 'Пенсия', en: 'Pension', uz: 'Pensiya' },
    icon: '👴',
    color: '#FBBF24',
    type: 'income',
  },
  {
    id: 'social',
    name: { ru: 'Соц. выплаты', en: 'Social benefits', uz: 'Ijtimoiy' },
    icon: '🏛️',
    color: '#38BDF8',
    type: 'income',
  },
  {
    id: 'parttime',
    name: { ru: 'Подработка', en: 'Part-time', uz: 'Qoʻshimcha ish' },
    icon: '⏰',
    color: '#A78BFA',
    type: 'income',
  },
  {
    id: 'deposits',
    name: { ru: 'Вклады', en: 'Deposits', uz: 'Depozitlar' },
    icon: '🏦',
    color: '#34D399',
    type: 'income',
  },
  {
    id: 'other_income',
    name: { ru: 'Другое', en: 'Other', uz: 'Boshqa' },
    icon: '💰',
    color: '#6B7280',
    type: 'income',
  },
];

// ============================================================================
// ВСЕ КАТЕГОРИИ
// ============================================================================

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const getCategoryById = (id: string): Category | undefined => {
  return ALL_CATEGORIES.find((c) => c.id === id);
};

export const getCategoryName = (id: string, locale: 'ru' | 'en' | 'uz' = 'ru'): string => {
  const category = getCategoryById(id);
  return category?.name[locale] || id;
};

// ============================================================================
// ФИНАНСОВЫЕ ЦЕЛИ
// ============================================================================

export const FINANCIAL_GOALS = [
  {
    id: 'save',
    name: { ru: 'Накопить на цель', en: 'Save for a goal', uz: 'Maqsad uchun tejash' },
    icon: '🎯',
    description: { 
      ru: 'Отслеживание прогресса накоплений',
      en: 'Track savings progress',
      uz: 'Jamgarish jarayonini kuzatish'
    },
  },
  {
    id: 'control',
    name: { ru: 'Контролировать расходы', en: 'Control spending', uz: 'Xarajatlarni nazorat qilish' },
    icon: '📊',
    description: {
      ru: 'Детальная аналитика трат',
      en: 'Detailed spending analytics',
      uz: 'Batafsil xarajat tahlili'
    },
  },
  {
    id: 'budget',
    name: { ru: 'Вести бюджет', en: 'Manage budget', uz: 'Byudjetni boshqarish' },
    icon: '📋',
    description: {
      ru: 'Лимиты по категориям',
      en: 'Category limits',
      uz: 'Kategoriya limitlari'
    },
  },
  {
    id: 'debt',
    name: { ru: 'Избавиться от долгов', en: 'Pay off debt', uz: "Qarzlardan xalos bo'lish" },
    icon: '💳',
    description: {
      ru: 'Отслеживание платежей',
      en: 'Payment tracking',
      uz: "To'lovlarni kuzatish"
    },
  },
  {
    id: 'invest',
    name: { ru: 'Начать инвестировать', en: 'Start investing', uz: 'Investitsiya qilish' },
    icon: '📈',
    description: {
      ru: 'Отслеживание инвестиций',
      en: 'Investment tracking',
      uz: 'Investitsiyalarni kuzatish'
    },
  },
  {
    id: 'emergency',
    name: { ru: 'Создать подушку безопасности', en: 'Emergency fund', uz: 'Xavfsizlik fondi' },
    icon: '🛡️',
    description: {
      ru: 'Финансовая подушка на 3-6 месяцев',
      en: '3-6 months emergency fund',
      uz: '3-6 oylik xavfsizlik fondi'
    },
  },
];

// ============================================================================
// СТИЛИ ЖИЗНИ
// ============================================================================

export const LIFESTYLE_OPTIONS = [
  {
    id: 'single',
    name: { ru: 'Живу один(а)', en: 'Living alone', uz: 'Yolg\'iz yashayman' },
    icon: '👤',
    priorityCategories: ['food', 'transport', 'entertainment', 'health'],
  },
  {
    id: 'couple',
    name: { ru: 'В паре', en: 'Couple', uz: 'Juftlikda' },
    icon: '👫',
    priorityCategories: ['food', 'housing', 'entertainment', 'gifts'],
  },
  {
    id: 'family',
    name: { ru: 'Семья с детьми', en: 'Family with kids', uz: 'Bolali oila' },
    icon: '👨‍👩‍👧‍👦',
    priorityCategories: ['food', 'housing', 'kids', 'education', 'health'],
  },
  {
    id: 'roommates',
    name: { ru: 'С соседями', en: 'With roommates', uz: 'Sheriklar bilan' },
    icon: '🏠',
    priorityCategories: ['housing', 'utilities', 'food'],
  },
];

// ============================================================================
// УВЕДОМЛЕНИЯ
// ============================================================================

export const NOTIFICATION_OPTIONS = [
  {
    id: 'daily',
    name: { ru: 'Ежедневно', en: 'Daily', uz: 'Har kuni' },
    icon: '🔔',
    description: { ru: 'Утренние напоминания + вечерняя сводка', en: 'Morning reminders + evening summary', uz: 'Ertalabki eslatmalar + kechki xulosa' },
  },
  {
    id: 'weekly',
    name: { ru: 'Раз в неделю', en: 'Weekly', uz: 'Haftada bir' },
    icon: '📅',
    description: { ru: 'Еженедельный отчёт по воскресеньям', en: 'Weekly report on Sundays', uz: 'Yakshanba kunlari haftalik hisobot' },
  },
  {
    id: 'important',
    name: { ru: 'Только важное', en: 'Important only', uz: 'Faqat muhim' },
    icon: '⚡',
    description: { ru: 'Превышение бюджета, напоминания о платежах', en: 'Budget exceeded, payment reminders', uz: 'Byudjet oshishi, to\'lov eslatmalari' },
  },
  {
    id: 'off',
    name: { ru: 'Отключить', en: 'Off', uz: "O'chirish" },
    icon: '🔕',
    description: { ru: 'Без уведомлений', en: 'No notifications', uz: 'Bildirishnomalarsiz' },
  },
];

// ============================================================================
// БЫСТРЫЕ СУММЫ (для ввода)
// ============================================================================

export const QUICK_AMOUNTS: Record<string, number[]> = {
  UZS: [50000, 100000, 200000, 500000, 1000000],
  RUB: [500, 1000, 2000, 5000, 10000],
  USD: [10, 20, 50, 100, 200],
  EUR: [10, 20, 50, 100, 200],
  KZT: [5000, 10000, 20000, 50000, 100000],
};

// ============================================================================
// ТАЙМАЙНГИ ДЛЯ UI
// ============================================================================

export const UI_TIMINGS = {
  toastDuration: 4000,
  autoSaveInterval: 3000,
  animationDuration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  loadingThreshold: {
    instant: 100,
    subtle: 300,
    spinner: 1000,
    progress: 3000,
  },
};

// ============================================================================
// РАЗМЕРЫ ДЛЯ UI
// ============================================================================

export const UI_SIZES = {
  touchTarget: 44, // px, минимум для touch
  inputHeight: 48,
  modalPadding: 24,
  cardPadding: 16,
  navHeight: 64,
  bottomNavHeight: 80,
};