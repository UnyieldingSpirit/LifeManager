// src/lib/categoryConfig.ts
// Единый источник конфигурации категорий для всего приложения

export interface CategoryConfig {
  id: string;
  icon: string;
  color: string;
  label: { ru: string; en: string; uz?: string };
}

export const EXPENSE_CATEGORIES: CategoryConfig[] = [
  { id: 'food',          icon: '🍔', color: '#F97316', label: { ru: 'Еда',           en: 'Food'          } },
  { id: 'transport',     icon: '🚗', color: '#3B82F6', label: { ru: 'Транспорт',     en: 'Transport'     } },
  { id: 'shopping',      icon: '🛒', color: '#EC4899', label: { ru: 'Покупки',       en: 'Shopping'      } },
  { id: 'entertainment', icon: '🎬', color: '#A855F7', label: { ru: 'Развлечения',   en: 'Entertainment' } },
  { id: 'health',        icon: '💊', color: '#10B981', label: { ru: 'Здоровье',      en: 'Health'        } },
  { id: 'bills',         icon: '📱', color: '#EF4444', label: { ru: 'Счета',         en: 'Bills'         } },
  { id: 'education',     icon: '📚', color: '#6366F1', label: { ru: 'Образование',   en: 'Education'     } },
  { id: 'housing',       icon: '🏠', color: '#8B5CF6', label: { ru: 'Жильё',         en: 'Housing'       } },
  { id: 'clothing',      icon: '👗', color: '#F43F5E', label: { ru: 'Одежда',        en: 'Clothing'      } },
  { id: 'beauty',        icon: '💄', color: '#E879F9', label: { ru: 'Красота',       en: 'Beauty'        } },
  { id: 'sports',        icon: '⚽', color: '#22C55E', label: { ru: 'Спорт',         en: 'Sports'        } },
  { id: 'travel',        icon: '✈️', color: '#0EA5E9', label: { ru: 'Путешествия',   en: 'Travel'        } },
  { id: 'other',         icon: '📦', color: '#6B7280', label: { ru: 'Другое',        en: 'Other'         } },
];

export const INCOME_CATEGORIES: CategoryConfig[] = [
  { id: 'salary',        icon: '💼', color: '#22C55E', label: { ru: 'Зарплата',      en: 'Salary'        } },
  { id: 'freelance',     icon: '💻', color: '#14B8A6', label: { ru: 'Фриланс',       en: 'Freelance'     } },
  { id: 'investment',    icon: '📈', color: '#F59E0B', label: { ru: 'Инвестиции',    en: 'Investment'    } },
  { id: 'gift',          icon: '🎁', color: '#EC4899', label: { ru: 'Подарок',       en: 'Gift'          } },
  { id: 'rental',        icon: '🏢', color: '#8B5CF6', label: { ru: 'Аренда',        en: 'Rental'        } },
  { id: 'business',      icon: '🏪', color: '#F97316', label: { ru: 'Бизнес',        en: 'Business'      } },
  { id: 'other_income',  icon: '💰', color: '#6B7280', label: { ru: 'Другое',        en: 'Other'         } },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

/** Получить конфиг категории по id */
export function getCategoryConfig(id: string): CategoryConfig {
  return ALL_CATEGORIES.find(c => c.id === id) ?? {
    id,
    icon: '📦',
    color: '#6B7280',
    label: { ru: id, en: id },
  };
}

/** Получить label категории */
export function getCategoryLabel(id: string, lang: 'ru' | 'en' | 'uz' = 'ru'): string {
  const cat = getCategoryConfig(id);
  return cat.label[lang] ?? cat.label.ru ?? id;
}

/** Получить emoji категории */
export function getCategoryIcon(id: string): string {
  return getCategoryConfig(id).icon;
}

/** Получить цвет категории */
export function getCategoryColor(id: string): string {
  return getCategoryConfig(id).color;
}