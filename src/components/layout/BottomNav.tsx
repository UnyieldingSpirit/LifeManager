// src/components/layout/BottomNav.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useTelegram } from '@/hooks/useTelegram';

// Кастомные иконки для более уникального вида
const TodayIcon = ({ active }: { active: boolean }) => {
  const today = new Date().getDate();
  return (
    <div className="relative w-6 h-6">
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect 
          x="3" y="4" width="18" height="17" rx="3" 
          stroke="currentColor" 
          strokeWidth={active ? 2 : 1.5}
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.15 : 0}
        />
        <path 
          d="M3 9h18" 
          stroke="currentColor" 
          strokeWidth={active ? 2 : 1.5}
        />
        <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/>
      </svg>
      <span 
        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mt-1.5"
        style={{ color: active ? 'var(--primary)' : 'currentColor' }}
      >
        {today}
      </span>
    </div>
  );
};

const CalendarIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <rect 
      x="3" y="4" width="18" height="17" rx="3" 
      stroke="currentColor" 
      strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'}
      fillOpacity={active ? 0.15 : 0}
    />
    <path d="M3 9h18" stroke="currentColor" strokeWidth={active ? 2 : 1.5}/>
    <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/>
    <circle cx="8" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="16" cy="14" r="1.5" fill="currentColor"/>
  </svg>
);

const ListIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <rect 
      x="3" y="3" width="18" height="18" rx="3" 
      stroke="currentColor" 
      strokeWidth={active ? 2 : 1.5}
      fill={active ? 'currentColor' : 'none'}
      fillOpacity={active ? 0.15 : 0}
    />
    <path 
      d="M7 8h2M7 12h2M7 16h2" 
      stroke="currentColor" 
      strokeWidth={2} 
      strokeLinecap="round"
    />
    <path 
      d="M12 8h5M12 12h5M12 16h5" 
      stroke="currentColor" 
      strokeWidth={1.5} 
      strokeLinecap="round"
    />
  </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
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
      fillOpacity={active ? 0.15 : 0}
    />
  </svg>
);

const navItems = [
  { href: '/', labelKey: 'nav.today', Icon: TodayIcon },
  { href: '/calendar', labelKey: 'nav.calendar', Icon: CalendarIcon },
  { href: '/lists', labelKey: 'nav.lists', Icon: ListIcon },
  { href: '/profile', labelKey: 'nav.profile', Icon: ProfileIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { hapticFeedback } = useTelegram();

  const handleClick = () => {
    hapticFeedback('selection');
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      {/* Glass Container */}
      <div 
        className="relative mx-auto max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'var(--glass-bg-heavy)',
          backdropFilter: 'blur(var(--glass-blur-heavy))',
          WebkitBackdropFilter: 'blur(var(--glass-blur-heavy))',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow-lg)',
        }}
      >
        {/* Subtle gradient overlay */}
        <div 
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, var(--primary-subtle) 100%)',
          }}
        />
        
        <div className="relative flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = item.href === '/' 
              ? pathname === '/' 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClick}
                className="relative flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-200"
              >
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId="navActive"
                    className="absolute inset-0 rounded-xl"
                    style={{ 
                      background: 'var(--primary-subtle)',
                      border: '1px solid var(--primary)',
                      borderOpacity: 0.2,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                
                {/* Icon */}
                <div
                  className="relative z-10 transition-transform duration-200"
                  style={{ 
                    color: isActive ? 'var(--primary)' : 'var(--text-tertiary)',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <item.Icon active={isActive} />
                </div>
                
                {/* Label */}
                <span
                  className="relative z-10 text-[10px] mt-0.5 font-medium transition-colors duration-200"
                  style={{ 
                    color: isActive ? 'var(--primary)' : 'var(--text-tertiary)',
                  }}
                >
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}