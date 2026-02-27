// src/components/layout/BottomNav.tsx
'use client';

import React, { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTelegram } from '@/hooks';

// ============================================================================
// ИКОНКИ
// ============================================================================

interface IconProps {
  active: boolean;
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
    <path d="M3 3v18h18" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 14l4-4 4 4 5-6" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
    {active && <circle cx="20" cy="8" r="2" fill="currentColor" />}
  </svg>
);

const TasksIcon = ({ active }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <rect 
      x="3" y="3" width="18" height="18" rx="3"
      stroke="currentColor" strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.1 : 0}
    />
    <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MoreIcon = ({ active }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <circle cx="5" cy="12" r="2" fill="currentColor" opacity={active ? 1 : 0.8} />
    <circle cx="12" cy="12" r="2" fill="currentColor" opacity={active ? 1 : 0.8} />
    <circle cx="19" cy="12" r="2" fill="currentColor" opacity={active ? 1 : 0.8} />
  </svg>
);

// ============================================================================
// ФИКСИРОВАННЫЕ 4 ТАБА
// ============================================================================

const NAV_ITEMS = [
  { id: 'home',    icon: HomeIcon,    label: 'Главная',  labelEn: 'Home',    route: '/',        color: '#C9A962' },
  { id: 'finance', icon: FinanceIcon, label: 'Финансы',  labelEn: 'Finance', route: '/finance',  color: '#4ADE80' },
  { id: 'tasks',   icon: TasksIcon,   label: 'Задачи',   labelEn: 'Tasks',   route: '/tasks',    color: '#60A5FA' },
  { id: 'more',    icon: MoreIcon,    label: 'Ещё',      labelEn: 'More',    route: '/more',     color: '#A3A3A3' },
];

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export default function BottomNav() {
  const pathname = usePathname();
  const { hapticFeedback } = useTelegram();

  const isActiveRoute = useCallback((route: string) => {
    if (route === '/') return pathname === '/';
    if (route === '/more') {
      // «Ещё» активен для всех страниц кроме /, /finance, /tasks
      const mainRoutes = ['/', '/finance', '/tasks'];
      return !mainRoutes.some(r => r === '/' ? pathname === '/' : pathname.startsWith(r));
    }
    return pathname === route || pathname.startsWith(route + '/');
  }, [pathname]);

  const handleNavClick = useCallback(() => {
    hapticFeedback?.('selection');
  }, [hapticFeedback]);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 px-4"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
    >
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative mx-auto max-w-md rounded-2xl"
        style={{
          background: 'rgba(12, 12, 12, 0.95)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        }}
      >
        {/* Gold accent line */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201, 169, 98, 0.5) 50%, transparent 100%)' }}
        />
        
        <div className="relative flex items-center justify-around py-2 px-1">
          {NAV_ITEMS.map((item) => {
            const isActive = isActiveRoute(item.route);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.route}
                onClick={handleNavClick}
                className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[60px]"
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `${item.color}12`,
                      border: `1px solid ${item.color}20`,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -top-0.5 w-4 h-0.5 rounded-full"
                    style={{ background: item.color }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                
                <div className="relative z-10" style={{ color: isActive ? item.color : 'rgba(163, 163, 163, 0.7)' }}>
                  <Icon active={isActive} />
                </div>
                
                <span 
                  className="relative z-10 text-[10px] font-medium mt-0.5 transition-colors duration-200"
                  style={{ color: isActive ? item.color : 'rgba(163, 163, 163, 0.5)' }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}