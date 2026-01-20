// src/types/index.ts

// ═══════════════════════════════════════════════════════════════════════════
// CURRENCY
// ═══════════════════════════════════════════════════════════════════════════

export type CurrencyCode = 'UZS' | 'USD' | 'EUR' | 'RUB' | 'GBP' | 'JPY' | 'CNY' | 'KZT' | 'TRY' | 'KRW';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'UZS', name: 'Узбекский сум', symbol: 'сум', flag: '🇺🇿' },
  { code: 'USD', name: 'Доллар США', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Евро', symbol: '€', flag: '🇪🇺' },
  { code: 'RUB', name: 'Российский рубль', symbol: '₽', flag: '🇷🇺' },
  { code: 'GBP', name: 'Фунт стерлингов', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Японская иена', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Китайский юань', symbol: '¥', flag: '🇨🇳' },
  { code: 'KZT', name: 'Казахстанский тенге', symbol: '₸', flag: '🇰🇿' },
  { code: 'TRY', name: 'Турецкая лира', symbol: '₺', flag: '🇹🇷' },
  { code: 'KRW', name: 'Корейская вона', symbol: '₩', flag: '🇰🇷' },
];

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'taxi', name: 'Такси', icon: '🚕', color: '#FFB800', type: 'expense' },
  { id: 'transport', name: 'Транспорт', icon: '🚌', color: '#5B8DEF', type: 'expense' },
  { id: 'food', name: 'Еда', icon: '🍔', color: '#FF6B6B', type: 'expense' },
  { id: 'groceries', name: 'Продукты', icon: '🛒', color: '#00D26A', type: 'expense' },
  { id: 'restaurants', name: 'Рестораны', icon: '🍽️', color: '#FF8C42', type: 'expense' },
  { id: 'shopping', name: 'Покупки', icon: '🛍️', color: '#A855F7', type: 'expense' },
  { id: 'clothing', name: 'Одежда', icon: '👕', color: '#EC4899', type: 'expense' },
  { id: 'electronics', name: 'Электроника', icon: '📱', color: '#64748B', type: 'expense' },
  { id: 'health', name: 'Здоровье', icon: '💊', color: '#00D26A', type: 'expense' },
  { id: 'beauty', name: 'Красота', icon: '💄', color: '#F472B6', type: 'expense' },
  { id: 'entertainment', name: 'Развлечения', icon: '🎬', color: '#8B5CF6', type: 'expense' },
  { id: 'subscriptions', name: 'Подписки', icon: '📺', color: '#6366F1', type: 'expense' },
  { id: 'education', name: 'Образование', icon: '📚', color: '#0EA5E9', type: 'expense' },
  { id: 'bills', name: 'Счета', icon: '📄', color: '#64748B', type: 'expense' },
  { id: 'rent', name: 'Аренда', icon: '🏠', color: '#F59E0B', type: 'expense' },
  { id: 'utilities', name: 'Коммуналка', icon: '💡', color: '#FBBF24', type: 'expense' },
  { id: 'internet', name: 'Интернет', icon: '🌐', color: '#3B82F6', type: 'expense' },
  { id: 'phone', name: 'Связь', icon: '📞', color: '#10B981', type: 'expense' },
  { id: 'charity', name: 'Благотворительность', icon: '❤️', color: '#EC4899', type: 'expense' },
  { id: 'gifts', name: 'Подарки', icon: '🎁', color: '#F43F5E', type: 'expense' },
  { id: 'travel', name: 'Путешествия', icon: '✈️', color: '#0891B2', type: 'expense' },
  { id: 'pets', name: 'Питомцы', icon: '🐾', color: '#D97706', type: 'expense' },
  { id: 'kids', name: 'Дети', icon: '👶', color: '#FB7185', type: 'expense' },
  { id: 'home', name: 'Дом', icon: '🏡', color: '#84CC16', type: 'expense' },
  { id: 'car', name: 'Авто', icon: '🚗', color: '#475569', type: 'expense' },
  { id: 'sports', name: 'Спорт', icon: '🏃', color: '#22C55E', type: 'expense' },
  { id: 'hobbies', name: 'Хобби', icon: '🎨', color: '#D946EF', type: 'expense' },
  { id: 'games', name: 'Игры', icon: '🎮', color: '#7C3AED', type: 'expense' },
  { id: 'other_expense', name: 'Другое', icon: '📌', color: '#94A3B8', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Зарплата', icon: '💰', color: '#00D26A', type: 'income' },
  { id: 'advance', name: 'Аванс', icon: '💵', color: '#10B981', type: 'income' },
  { id: 'bonus', name: 'Бонус', icon: '🎯', color: '#22C55E', type: 'income' },
  { id: 'freelance', name: 'Фриланс', icon: '💻', color: '#6366F1', type: 'income' },
  { id: 'business', name: 'Бизнес', icon: '🏢', color: '#8B5CF6', type: 'income' },
  { id: 'investments', name: 'Инвестиции', icon: '📈', color: '#D4AF37', type: 'income' },
  { id: 'dividends', name: 'Дивиденды', icon: '💹', color: '#F59E0B', type: 'income' },
  { id: 'rental', name: 'Аренда', icon: '🏠', color: '#0EA5E9', type: 'income' },
  { id: 'cashback', name: 'Кэшбэк', icon: '💳', color: '#EC4899', type: 'income' },
  { id: 'refund', name: 'Возврат', icon: '↩️', color: '#64748B', type: 'income' },
  { id: 'gifts_income', name: 'Подарки', icon: '🎁', color: '#F43F5E', type: 'income' },
  { id: 'pension', name: 'Пенсия', icon: '👴', color: '#78716C', type: 'income' },
  { id: 'scholarship', name: 'Стипендия', icon: '🎓', color: '#3B82F6', type: 'income' },
  { id: 'sales', name: 'Продажа имущества', icon: '🏷️', color: '#14B8A6', type: 'income' },
  { id: 'side_income', name: 'Доп. заработок', icon: '💼', color: '#A855F7', type: 'income' },
  { id: 'other_income', name: 'Другое', icon: '📌', color: '#94A3B8', type: 'income' },
];

// ═══════════════════════════════════════════════════════════════════════════
// USER
// ═══════════════════════════════════════════════════════════════════════════

export interface UserProfile {
  id: string;
  name: string;
  currency: CurrencyCode;
  createdAt: string;
  expenseCategories: string[];
  incomeCategories: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// ACCOUNTS
// ═══════════════════════════════════════════════════════════════════════════

export type AccountType = 'cash' | 'card' | 'savings' | 'crypto';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: CurrencyCode;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  description?: string;
  date: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════════════════════════════════

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════════════════════════════════════════

export type SetupStep = 'currency' | 'expense-categories' | 'income-categories' | 'profile';

export interface OnboardingSlide {
  id: number;
  image: string;
  title: string;
  description: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    image: 'balance',
    title: 'Получите быструю информацию о вашем балансе',
    description: 'Эта функция упрощает управление финансами, предоставляя сводку текущего баланса вашего счёта и последних транзакций.',
  },
  {
    id: 2,
    image: 'categories',
    title: 'План расходов по категориям',
    description: 'Наглядно отображает ваши расходы по разным категориям, помогая вам легко отслеживать и управлять своим бюджетом.',
  },
  {
    id: 3,
    image: 'history',
    title: 'История всех ваших действий',
    description: 'Отслеживайте все транзакции, анализируйте свои привычки и принимайте взвешенные финансовые решения.',
  },
];