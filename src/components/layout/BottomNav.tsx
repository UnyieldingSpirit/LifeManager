// src/components/BottomNav.tsx
'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import { colors } from '@/lib';

// ============================================================================
// ИКОНКИ
// ============================================================================

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
      stroke="currentColor" strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
  </svg>
);

const FinanceIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
      stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
  </svg>
);

const TasksIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
      stroke="currentColor" strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.1 : 0} />
  </svg>
);

const CalendarIcon = ({ active }: { active: boolean }) => {
  const today = new Date().getDate();
  return (
    <div className="relative w-6 h-6">
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth={active ? 2 : 1.5}
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.1 : 0} />
        <path d="M3 9h18" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
        <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mt-2"
        style={{ color: active ? colors.gold.primary : 'currentColor' }}>{today}</span>
    </div>
  );
};

const HabitsIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
  </svg>
);

const NotesIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      stroke="currentColor" strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.1 : 0} />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

const ContactsIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.1 : 0} />
  </svg>
);

const MoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="6" r="1.5" fill="currentColor" />
    <circle cx="12" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// ============================================================================
// МАППИНГ
// ============================================================================

const iconMap: Record<string, React.FC<{ active: boolean }>> = {
  home: HomeIcon, finance: FinanceIcon, tasks: TasksIcon, events: CalendarIcon,
  habits: HabitsIcon, notes: NotesIcon, contacts: ContactsIcon, more: MoreIcon,
};

const routeMap: Record<string, string> = {
  home: '/', finance: '/finance', tasks: '/tasks', events: '/calendar',
  habits: '/habits', notes: '/notes', contacts: '/contacts', more: '/more',
};

const labelMap: Record<string, string> = {
  home: 'Главная', finance: 'Финансы', tasks: 'Задачи', events: 'Календарь',
  habits: 'Привычки', notes: 'Заметки', contacts: 'Контакты', more: 'Ещё',
};

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export default function BottomNav() {
  const pathname = usePathname();
  const { hapticFeedback } = useTelegram();
  const enabledModules = useStore((s) => s.profile?.settings.enabledModules || ['finance']);
  const openBottomSheet = useStore((s) => s.openBottomSheet);

  const navItems = useMemo(() => {
    const items: Array<{ id: string; route: string; label: string }> = [
      { id: 'home', route: '/', label: labelMap.home },
    ];
    const modulesToShow = enabledModules.slice(0, 3);
    modulesToShow.forEach((m) => items.push({ id: m, route: routeMap[m], label: labelMap[m] }));
    if (enabledModules.length > 3) items.push({ id: 'more', route: '/more', label: labelMap.more });
    return items;
  }, [enabledModules]);

  const handleClick = () => hapticFeedback?.('selection');
  const handleAddClick = () => { hapticFeedback?.('medium'); openBottomSheet('quick-add'); };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
      <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(12, 12, 12, 0.95)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.3)',
        }}>
        <div className="absolute inset-0 opacity-50 pointer-events-none"
          style={{ background: `linear-gradient(180deg, transparent 0%, ${colors.gold.subtle} 100%)` }} />
        
        <div className="relative flex items-center justify-around py-2">
          {navItems.map((item, index) => {
            const isActive = item.route === '/' ? pathname === '/' : pathname.startsWith(item.route);
            const Icon = iconMap[item.id];
            const isMiddle = index === Math.floor(navItems.length / 2);

            return (
              <React.Fragment key={item.id}>
                {isMiddle && (
                  <button onClick={handleAddClick}
                    className="relative flex items-center justify-center w-12 h-12 -mt-4 rounded-full transition-transform active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${colors.gold.primary} 0%, ${colors.gold.light} 50%, ${colors.gold.primary} 100%)`,
                      boxShadow: `0 4px 20px ${colors.gold.primary}50`,
                      color: colors.bg.primary,
                    }}>
                    <AddIcon />
                  </button>
                )}
                <Link href={item.route} onClick={handleClick}
                  className="relative flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all duration-200">
                  {isActive && (
                    <motion.div layoutId="navActive" className="absolute inset-0 rounded-xl"
                      style={{ background: colors.gold.subtle, border: `1px solid ${colors.gold.border}` }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                  )}
                  <div className="relative z-10 transition-transform duration-200"
                    style={{ color: isActive ? colors.gold.primary : colors.text.tertiary, transform: isActive ? 'scale(1.05)' : 'scale(1)' }}>
                    <Icon active={isActive} />
                  </div>
                  <span className="relative z-10 text-[10px] mt-0.5 font-medium transition-colors duration-200"
                    style={{ color: isActive ? colors.gold.primary : colors.text.tertiary }}>
                    {item.label}
                  </span>
                </Link>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
