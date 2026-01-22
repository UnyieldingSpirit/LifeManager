// src/app/more/page.tsx
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  FireIcon,
  DocumentTextIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ClockIcon,
  FlagIcon,
  BanknotesIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import { EnabledModule } from '@/types';

interface MenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  labelEn: string;
  route: string;
  color: string;
  module?: EnabledModule;
  badge?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'finance', icon: ChartBarIcon, label: 'Финансы', labelEn: 'Finance', route: '/finance', color: '#4ADE80', module: 'finance' },
  { id: 'history', icon: ClockIcon, label: 'История', labelEn: 'History', route: '/history', color: '#60A5FA', module: 'finance' },
  { id: 'goals', icon: FlagIcon, label: 'Цели', labelEn: 'Goals', route: '/goals', color: '#F59E0B', module: 'finance' },
  { id: 'tasks', icon: ClipboardDocumentListIcon, label: 'Задачи', labelEn: 'Tasks', route: '/tasks', color: '#3B82F6', module: 'tasks' },
  { id: 'calendar', icon: CalendarIcon, label: 'Календарь', labelEn: 'Calendar', route: '/calendar', color: '#A855F7', module: 'events' },
  { id: 'habits', icon: FireIcon, label: 'Привычки', labelEn: 'Habits', route: '/habits', color: '#F97316', module: 'habits' },
  { id: 'notes', icon: DocumentTextIcon, label: 'Заметки', labelEn: 'Notes', route: '/notes', color: '#FACC15', module: 'notes' },
  { id: 'contacts', icon: UserGroupIcon, label: 'Контакты', labelEn: 'Contacts', route: '/contacts', color: '#EC4899', module: 'contacts' },
];

const SYSTEM_ITEMS: MenuItem[] = [
  { id: 'settings', icon: Cog6ToothIcon, label: 'Настройки', labelEn: 'Settings', route: '/settings', color: '#6B7280' },
  { id: 'help', icon: QuestionMarkCircleIcon, label: 'Помощь', labelEn: 'Help', route: '/help', color: '#6B7280' },
  { id: 'about', icon: InformationCircleIcon, label: 'О приложении', labelEn: 'About', route: '/about', color: '#6B7280' },
];

export default function MorePage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();
  
  const profile = useStore((s) => s.profile);
  const enabledModules = profile?.settings?.enabledModules || ['finance'];
  const language = profile?.settings?.language || 'ru';
  
  const visibleItems = useMemo(() => {
    return MENU_ITEMS.filter(item => !item.module || enabledModules.includes(item.module));
  }, [enabledModules]);
  
  const handleNavigate = (route: string) => {
    hapticFeedback?.('light');
    router.push(route);
  };
  
  const getLabel = (item: MenuItem) => language === 'ru' ? item.label : item.labelEn;

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--background)' }}>
      <header className="px-4 pt-safe">
        <div className="py-4">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {language === 'ru' ? 'Ещё' : 'More'}
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {language === 'ru' ? 'Все функции приложения' : 'All app features'}
          </p>
        </div>
      </header>
      
      <main className="px-4 space-y-6">
        {/* Main Menu */}
        <section>
          <h3 className="text-xs font-medium mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
            {language === 'ru' ? 'МОДУЛИ' : 'MODULES'}
          </h3>
          <div className="glass-card overflow-hidden">
            {visibleItems.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === visibleItems.length - 1;
              
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigate(item.route)}
                  className="w-full flex items-center justify-between p-4"
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${item.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {getLabel(item)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--primary)', color: '#0A0A0A' }}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>
        
        {/* System Menu */}
        <section>
          <h3 className="text-xs font-medium mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
            {language === 'ru' ? 'СИСТЕМА' : 'SYSTEM'}
          </h3>
          <div className="glass-card overflow-hidden">
            {SYSTEM_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === SYSTEM_ITEMS.length - 1;
              
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigate(item.route)}
                  className="w-full flex items-center justify-between p-4"
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--surface-secondary)' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {getLabel(item)}
                    </span>
                  </div>
                  <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                </motion.button>
              );
            })}
          </div>
        </section>
        
        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            LifeLedger v1.0.0
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
            © 2025 {language === 'ru' ? 'Все права защищены' : 'All rights reserved'}
          </p>
        </div>
      </main>
    </div>
  );
}