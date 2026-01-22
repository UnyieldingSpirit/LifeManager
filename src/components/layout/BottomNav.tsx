// src/components/layout/BottomNav.tsx
'use client';

import React, { useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import { EnabledModule } from '@/types';

// ============================================================================
// ИКОНКИ - Премиальные SVG с поддержкой активного состояния
// ============================================================================

interface IconProps {
  active: boolean;
  color?: string;
}

const HomeIcon = ({ active }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path 
      d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
      stroke="currentColor" 
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? 'currentColor' : 'none'} 
      fillOpacity={active ? 0.15 : 0} 
    />
  </svg>
);

const FinanceIcon = ({ active }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path 
      d="M3 3v18h18"
      stroke="currentColor" 
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path 
      d="M7 14l4-4 4 4 5-6"
      stroke="currentColor" 
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {active && (
      <circle cx="20" cy="8" r="2" fill="currentColor" />
    )}
  </svg>
);

const TasksIcon = ({ active }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <rect 
      x="3" y="3" width="18" height="18" rx="3"
      stroke="currentColor" 
      strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'} 
      fillOpacity={active ? 0.1 : 0}
    />
    <path 
      d="M8 12l2.5 2.5L16 9" 
      stroke="currentColor" 
      strokeWidth={active ? 2.5 : 2} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const CalendarIcon = ({ active }: IconProps) => {
  const today = new Date().getDate();
  return (
    <div className="relative w-6 h-6">
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect 
          x="3" y="4" width="18" height="17" rx="2" 
          stroke="currentColor" 
          strokeWidth={active ? 2 : 1.5}
          fill={active ? 'currentColor' : 'none'} 
          fillOpacity={active ? 0.1 : 0}
        />
        <path d="M3 9h18" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
        <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
      <span 
        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mt-1.5"
        style={{ color: 'currentColor' }}
      >
        {today}
      </span>
    </div>
  );
};

const HabitsIcon = ({ active }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path 
      d="M12 2C8 2 6 6 6 9c0 4 2 6 6 11 4-5 6-7 6-11 0-3-2-7-6-7z"
      stroke="currentColor" 
      strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'} 
      fillOpacity={active ? 0.2 : 0}
    />
    <path 
      d="M12 6c-2 0-3 2-3 3.5 0 2 1 3 3 5.5" 
      stroke="currentColor" 
      strokeWidth={1.5} 
      strokeLinecap="round"
      opacity={active ? 0.7 : 0.5}
    />
  </svg>
);

const NotesIcon = ({ active }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path 
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      stroke="currentColor" 
      strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'} 
      fillOpacity={active ? 0.1 : 0}
    />
    <path d="M14 2v6h6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

const ContactsIcon = ({ active }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <circle 
      cx="12" cy="8" r="4" 
      stroke="currentColor" 
      strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'} 
      fillOpacity={active ? 0.15 : 0}
    />
    <path 
      d="M4 20c0-4 4-6 8-6s8 2 8 6" 
      stroke="currentColor" 
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      fill={active ? 'currentColor' : 'none'} 
      fillOpacity={active ? 0.1 : 0}
    />
  </svg>
);

const MoreIcon = ({ active }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <circle cx="5" cy="12" r="2" fill="currentColor" opacity={active ? 1 : 0.8} />
    <circle cx="12" cy="12" r="2" fill="currentColor" opacity={active ? 1 : 0.8} />
    <circle cx="19" cy="12" r="2" fill="currentColor" opacity={active ? 1 : 0.8} />
  </svg>
);

const SettingsIcon = ({ active }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <circle 
      cx="12" cy="12" r="3" 
      stroke="currentColor" 
      strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'} 
      fillOpacity={active ? 0.15 : 0}
    />
    <path 
      d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke="currentColor" 
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
    />
  </svg>
);

const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// ============================================================================
// КОНФИГУРАЦИЯ МОДУЛЕЙ
// ============================================================================

interface ModuleConfig {
  id: string;
  icon: React.FC<IconProps>;
  label: string;
  labelEn: string;
  route: string;
  color: string;
  module?: EnabledModule;
  priority: number;
}

const ALL_MODULES: ModuleConfig[] = [
  { id: 'home', icon: HomeIcon, label: 'Главная', labelEn: 'Home', route: '/', color: '#C9A962', priority: 0 },
  { id: 'finance', icon: FinanceIcon, label: 'Финансы', labelEn: 'Finance', route: '/finance', color: '#4ADE80', module: 'finance', priority: 1 },
  { id: 'tasks', icon: TasksIcon, label: 'Задачи', labelEn: 'Tasks', route: '/tasks', color: '#60A5FA', module: 'tasks', priority: 2 },
  { id: 'calendar', icon: CalendarIcon, label: 'Календарь', labelEn: 'Calendar', route: '/calendar', color: '#A855F7', module: 'events', priority: 3 },
  { id: 'habits', icon: HabitsIcon, label: 'Привычки', labelEn: 'Habits', route: '/habits', color: '#F97316', module: 'habits', priority: 4 },
  { id: 'notes', icon: NotesIcon, label: 'Заметки', labelEn: 'Notes', route: '/notes', color: '#FACC15', module: 'notes', priority: 5 },
  { id: 'contacts', icon: ContactsIcon, label: 'Контакты', labelEn: 'Contacts', route: '/contacts', color: '#EC4899', module: 'contacts', priority: 6 },
];

const MORE_MODULE: ModuleConfig = { 
  id: 'more', icon: MoreIcon, label: 'Ещё', labelEn: 'More', route: '/more', color: '#A3A3A3', priority: 99 
};

const SETTINGS_MODULE: ModuleConfig = { 
  id: 'settings', icon: SettingsIcon, label: 'Настройки', labelEn: 'Settings', route: '/settings', color: '#A3A3A3', priority: 98 
};

// ============================================================================
// КОМПОНЕНТ НАВИГАЦИИ
// ============================================================================

export default function BottomNav() {
  const pathname = usePathname();
  const { hapticFeedback } = useTelegram();
  const profile = useStore((s) => s.profile);
  const enabledModules = profile?.settings.enabledModules || ['finance'];
  const language = profile?.settings.language || 'ru';
  const openBottomSheet = useStore((s) => s.openBottomSheet);

  // Строим адаптивный массив навигации
  const navItems = useMemo((): ModuleConfig[] => {
    const items: ModuleConfig[] = [];
    
    // Главная всегда первая
    items.push(ALL_MODULES[0]); // Home
    
    // Фильтруем включённые модули
    const activeModules = ALL_MODULES.filter(m => 
      m.module && enabledModules.includes(m.module)
    ).sort((a, b) => a.priority - b.priority);
    
    const moduleCount = activeModules.length;
    
    // === ЛОГИКА РАСПРЕДЕЛЕНИЯ ===
    // Цель: Навбар должен хорошо выглядеть с любым количеством модулей
    // Формула: Home + [модули] + More/Settings (4-5 элементов максимум)
    
    if (moduleCount === 0) {
      // Нет модулей - только настройки
      items.push(SETTINGS_MODULE);
    } else if (moduleCount === 1) {
      // 1 модуль: Home | Module | Settings
      items.push(activeModules[0]);
      items.push(SETTINGS_MODULE);
    } else if (moduleCount === 2) {
      // 2 модуля: Home | Module1 | Module2 | Settings
      items.push(activeModules[0]);
      items.push(activeModules[1]);
      items.push(SETTINGS_MODULE);
    } else if (moduleCount === 3) {
      // 3 модуля: Home | Module1 | Module2 | Module3 | Settings OR More
      items.push(activeModules[0]);
      items.push(activeModules[1]);
      items.push(activeModules[2]);
      items.push(SETTINGS_MODULE);
    } else {
      // 4+ модулей: Home | Top2 | More (остальные в More)
      items.push(activeModules[0]);
      items.push(activeModules[1]);
      items.push(MORE_MODULE);
    }
    
    return items;
  }, [enabledModules]);

  // Индекс для FAB кнопки (центр навбара)
  const fabIndex = useMemo(() => {
    return Math.floor(navItems.length / 2);
  }, [navItems]);

  const handleNavClick = useCallback(() => {
    hapticFeedback?.('selection');
  }, [hapticFeedback]);

  const handleAddClick = useCallback(() => {
    hapticFeedback?.('medium');
    openBottomSheet('quick-add');
  }, [hapticFeedback, openBottomSheet]);

  // Проверка активного маршрута
  const isActiveRoute = useCallback((route: string) => {
    if (route === '/') return pathname === '/';
    if (route === '/more') {
      // More активен для страниц вне основной навигации
      const mainRoutes = navItems.map(item => item.route);
      const isOnMainRoute = mainRoutes.some(r => 
        r !== '/more' && r !== '/' && (pathname === r || pathname.startsWith(r + '/'))
      );
      return !isOnMainRoute && pathname !== '/';
    }
    return pathname === route || pathname.startsWith(route + '/');
  }, [pathname, navItems]);

  const getLabel = (item: ModuleConfig) => {
    return language === 'ru' ? item.label : item.labelEn;
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 px-4"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
    >
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative mx-auto max-w-md rounded-2xl "
        style={{
          background: 'rgba(12, 12, 12, 0.95)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        }}
      >
        {/* Премиальная подсветка сверху */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(201, 169, 98, 0.5) 50%, transparent 100%)'
          }}
        />
        
        <div className="relative flex items-center justify-around py-2 px-1">
          {navItems.map((item, index) => {
            const isActive = isActiveRoute(item.route);
            const Icon = item.icon;
            const showFabBefore = index === fabIndex;

            return (
              <React.Fragment key={item.id}>
                {/* FAB кнопка */}
                {showFabBefore && (
                  <motion.button
                    onClick={handleAddClick}
                    whileTap={{ scale: 0.9 }}
                    className="relative flex items-center justify-center w-14 h-14 -mt-6 rounded-full z-60"
                    style={{
                      background: 'linear-gradient(135deg, #C9A962 0%, #E8D5A3 50%, #C9A962 100%)',
                      boxShadow: '0 4px 20px rgba(201, 169, 98, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      color: '#0A0A0A',
                    }}
                  >
                    {/* Пульсация */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(201, 169, 98, 0.4)',
                          '0 0 0 10px rgba(201, 169, 98, 0)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                    <AddIcon />
                  </motion.button>
                )}

                {/* Элемент навигации */}
                <Link
                  href={item.route}
                  onClick={handleNavClick}
                  className="relative flex flex-col items-center justify-center flex-1 min-w-0 py-1.5 px-1"
                >
                  {/* Активный фон */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="navActiveBackground"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-1 rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)`,
                          border: `1px solid ${item.color}30`,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Иконка */}
                  <motion.div
                    className="relative z-10"
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ color: isActive ? item.color : '#737373' }}
                  >
                    <Icon active={isActive} />
                  </motion.div>

                  {/* Лейбл */}
                  <motion.span
                    className="relative z-10 text-[10px] mt-0.5 font-medium truncate max-w-full"
                    animate={{ color: isActive ? item.color : '#737373' }}
                    transition={{ duration: 0.2 }}
                  >
                    {getLabel(item)}
                  </motion.span>

                  {/* Индикатор активности */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 16, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="absolute -bottom-0.5 h-0.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </AnimatePresence>
                </Link>
              </React.Fragment>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}