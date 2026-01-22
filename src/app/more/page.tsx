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
  ClockIcon,
  FlagIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  Squares2X2Icon,
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
  { id: 'lists', icon: ShoppingCartIcon, label: 'Списки', labelEn: 'Lists', route: '/lists', color: '#14B8A6' },
  { id: 'tasks', icon: ClipboardDocumentListIcon, label: 'Задачи', labelEn: 'Tasks', route: '/tasks', color: '#3B82F6', module: 'tasks' },
  { id: 'calendar', icon: CalendarIcon, label: 'Календарь', labelEn: 'Calendar', route: '/calendar', color: '#A855F7', module: 'events' },
  { id: 'habits', icon: FireIcon, label: 'Привычки', labelEn: 'Habits', route: '/habits', color: '#F97316', module: 'habits' },
  { id: 'notes', icon: DocumentTextIcon, label: 'Заметки', labelEn: 'Notes', route: '/notes', color: '#FACC15', module: 'notes' },
  { id: 'contacts', icon: UserGroupIcon, label: 'Контакты', labelEn: 'Contacts', route: '/contacts', color: '#EC4899', module: 'contacts' },
];

const SYSTEM_ITEMS: MenuItem[] = [
  { id: 'profile', icon: UserCircleIcon, label: 'Профиль', labelEn: 'Profile', route: '/profile', color: '#C9A962' },
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
    <div className="" style={{ background: '#0A0A0A' }}>
      {/* Уникальный фон - мультицветный */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[40%]" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(148, 163, 184, 0.1) 0%, transparent 60%)' }} />
        <div className="absolute top-1/4 left-0 w-1/3 h-1/3" style={{ background: 'radial-gradient(ellipse at left, rgba(74, 222, 128, 0.06) 0%, transparent 50%)' }} />
        <div className="absolute top-1/3 right-0 w-1/3 h-1/3" style={{ background: 'radial-gradient(ellipse at right, rgba(168, 85, 247, 0.06) 0%, transparent 50%)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-1/2 h-1/4" style={{ background: 'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.05) 0%, transparent 60%)' }} />
        <div className="absolute top-24 right-10 w-1 h-1 rounded-full bg-slate-400 opacity-20 animate-float" />
        <div className="absolute top-40 left-8 w-1 h-1 rounded-full bg-green-400 opacity-15 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>
      
      <div className="page-scrollable">
        <header className="px-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(100, 116, 139, 0.2) 100%)' }}>
              <Squares2X2Icon className="w-5 h-5" style={{ color: '#94A3B8' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Ещё' : 'More'}</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Все функции приложения' : 'All app features'}</p>
            </div>
          </div>
        </header>
        
        <main className="px-4 space-y-6 pb-8">
          {/* Main Menu */}
          <section>
            <h3 className="text-xs font-medium mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'МОДУЛИ' : 'MODULES'}</h3>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              {visibleItems.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === visibleItems.length - 1;
                return (
                  <motion.button key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigate(item.route)} className="w-full flex items-center justify-between p-4 transition-colors" style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}15` }}>
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{getLabel(item)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: item.color, color: '#0A0A0A' }}>{item.badge}</span>}
                      <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
          
          {/* System Menu */}
          <section>
            <h3 className="text-xs font-medium mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'СИСТЕМА' : 'SYSTEM'}</h3>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              {SYSTEM_ITEMS.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === SYSTEM_ITEMS.length - 1;
                return (
                  <motion.button key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (visibleItems.length + index) * 0.03 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigate(item.route)} className="w-full flex items-center justify-between p-4 transition-colors" style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}15` }}>
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{getLabel(item)}</span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                  </motion.button>
                );
              })}
            </div>
          </section>
          
          {/* App Info */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)', boxShadow: '0 4px 20px rgba(201, 169, 98, 0.2)' }}>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>LifeLedger</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>v1.0.0 • {language === 'ru' ? 'Управляй жизнью' : 'Manage your life'}</p>
            <p className="text-[10px] mt-2" style={{ color: 'var(--text-tertiary)' }}>© 2025 {language === 'ru' ? 'Все права защищены' : 'All rights reserved'}</p>
          </motion.div>
        </main>
      </div>
    </div>
  );
}