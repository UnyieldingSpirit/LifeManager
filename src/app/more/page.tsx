// src/app/more/page.tsx
'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';

// ============================================================================
// ВСЕ СТРАНИЦЫ ПРИЛОЖЕНИЯ
// ============================================================================

interface PageItem {
  id: string;
  icon: string;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
  route: string;
  color: string;
  // moduleId — какой модуль должен быть включён, чтобы показать этот пункт.
  // undefined = показывать всегда (home, profile и т.д.)
  moduleId?: string;
}

// Полный список модульных страниц. Фильтрация — ниже по enabledModules.
const MODULE_PAGES: PageItem[] = [
  {
    id: 'home',
    icon: '🏠',
    label: 'Главная',
    labelEn: 'Home',
    description: 'Обзор дня и все данные',
    descriptionEn: 'Daily overview',
    route: '/',
    color: '#C9A962',
    // Home показывается всегда
    moduleId: undefined,
  },
  {
    id: 'finance',
    icon: '💰',
    label: 'Финансы',
    labelEn: 'Finance',
    description: 'Баланс, транзакции, бюджет',
    descriptionEn: 'Balance, transactions, budget',
    route: '/finance',
    color: '#4ADE80',
    moduleId: 'finance',
  },
  {
    id: 'tasks',
    icon: '✅',
    label: 'Задачи',
    labelEn: 'Tasks',
    description: 'Списки дел и проекты',
    descriptionEn: 'To-do lists and projects',
    route: '/tasks',
    color: '#60A5FA',
    moduleId: 'tasks',
  },
  {
    id: 'calendar',
    icon: '📅',
    label: 'Календарь',
    labelEn: 'Calendar',
    description: 'События, встречи, дни рождения',
    descriptionEn: 'Events, meetings, birthdays',
    route: '/calendar',
    color: '#A855F7',
    moduleId: 'events',
  },
  {
    id: 'habits',
    icon: '🔥',
    label: 'Привычки',
    labelEn: 'Habits',
    description: 'Трекер привычек и серии',
    descriptionEn: 'Habit tracker and streaks',
    route: '/habits',
    color: '#F97316',
    moduleId: 'habits',
  },
  {
    id: 'notes',
    icon: '📝',
    label: 'Заметки',
    labelEn: 'Notes',
    description: 'Записи, идеи, списки',
    descriptionEn: 'Notes, ideas, lists',
    route: '/notes',
    color: '#FACC15',
    moduleId: 'notes',
  },
  {
    id: 'contacts',
    icon: '👥',
    label: 'Контакты',
    labelEn: 'Contacts',
    description: 'Люди, связи, долги',
    descriptionEn: 'People, connections, debts',
    route: '/contacts',
    color: '#EC4899',
    moduleId: 'contacts',
  },
];

const SYSTEM_PAGES: PageItem[] = [
  {
    id: 'profile',
    icon: '👤',
    label: 'Профиль и настройки',
    labelEn: 'Profile & Settings',
    description: 'Язык, тема, валюта, модули',
    descriptionEn: 'Language, theme, currency, modules',
    route: '/profile',
    color: '#C9A962',
  },
];

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export default function MorePage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();
  const profile = useStore((s) => s.profile);
  const language = profile?.settings?.language || 'ru';
  const isRu = language === 'ru';

  // enabledModules из стора (синхронизируется с API при bootstrap)
  const enabledModules: string[] = profile?.settings?.enabledModules || ['finance'];

  // Фильтруем MODULE_PAGES: показываем только страницы,
  // у которых moduleId === undefined (всегда) ИЛИ moduleId входит в enabledModules
  const visibleModulePages = MODULE_PAGES.filter(
    (item) => item.moduleId === undefined || enabledModules.includes(item.moduleId)
  );

  const handleNavigate = (route: string) => {
    hapticFeedback?.('light');
    router.push(route);
  };

  const renderItem = (item: PageItem, index: number) => (
    <motion.button
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => handleNavigate(item.route)}
      className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left active:scale-[0.98] transition-transform"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${item.color}15` }}
      >
        <span className="text-xl">{item.icon}</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>
          {isRu ? item.label : item.labelEn}
        </p>
        <p className="text-xs truncate" style={{ color: '#737373' }}>
          {isRu ? item.description : item.descriptionEn}
        </p>
      </div>

      {/* Arrow */}
      <svg
        className="w-4 h-4 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        style={{ color: '#525252' }}
      >
        <path
          d="M9 18l6-6-6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );

  return (
    <div className="page-scrollable" style={{ background: '#0A0A0A' }}>
      <div className="page-content px-4">
        {/* Header */}
        <header className="pt-3 pb-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl font-bold" style={{ color: '#F5F5F5' }}>
              {isRu ? 'Все разделы' : 'All Sections'}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#737373' }}>
              {isRu ? 'Быстрый доступ ко всему' : 'Quick access to everything'}
            </p>
          </motion.div>
        </header>

        {/* Enabled Module Pages */}
        <section className="mb-6">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3 px-1"
            style={{ color: '#525252' }}
          >
            {isRu ? 'Модули' : 'Modules'}
          </p>
          <div className="space-y-2">
            {visibleModulePages.map((item, i) => renderItem(item, i))}
          </div>
        </section>

        {/* System Pages */}
        <section className="mb-6">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3 px-1"
            style={{ color: '#525252' }}
          >
            {isRu ? 'Система' : 'System'}
          </p>
          <div className="space-y-2">
            {SYSTEM_PAGES.map((item, i) =>
              renderItem(item, i + visibleModulePages.length)
            )}
          </div>
        </section>

        {/* App info */}
        <div className="text-center pb-8 pt-4">
          <p className="text-xs" style={{ color: '#404040' }}>
            LifeLedger v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}