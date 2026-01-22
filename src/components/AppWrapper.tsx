// src/components/AppWrapper.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import BottomNav from './layout/BottomNav';
import { colors, gradients } from '@/lib';

interface AppWrapperProps {
  children: ReactNode;
}

const NO_NAV_ROUTES = ['/onboarding'];
const PUBLIC_ROUTES = ['/onboarding'];

// ============================================================================
// LOADER
// ============================================================================

function PremiumLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: colors.bg.primary, zIndex: 9999 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${colors.gold.primary} 0%, transparent 70%)`,
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: gradients.gold, boxShadow: `0 0 40px ${colors.gold.primary}40` }}
          animate={{ boxShadow: [`0 0 40px ${colors.gold.primary}40`, `0 0 60px ${colors.gold.primary}60`, `0 0 40px ${colors.gold.primary}40`] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" style={{ color: colors.bg.primary }}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold"
          style={{ color: colors.text.primary }}
        >
          LifeLedger
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-1.5 mt-4"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: colors.gold.primary }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// QUICK ADD SHEET
// ============================================================================

function QuickAddSheet() {
  const bottomSheetContent = useStore((s) => s.bottomSheetContent);
  const closeBottomSheet = useStore((s) => s.closeBottomSheet);
  const enabledModules = useStore((s) => s.profile?.settings.enabledModules || ['finance']);

  if (bottomSheetContent !== 'quick-add') return null;

  const options = [
    { id: 'expense', icon: '💸', label: 'Расход', color: colors.semantic.error, module: 'finance' },
    { id: 'income', icon: '💰', label: 'Доход', color: colors.semantic.success, module: 'finance' },
    { id: 'task', icon: '✅', label: 'Задача', color: colors.modules.tasks, module: 'tasks' },
    { id: 'event', icon: '📅', label: 'Событие', color: colors.modules.events, module: 'events' },
    { id: 'habit', icon: '🔥', label: 'Привычка', color: colors.modules.habits, module: 'habits' },
    { id: 'note', icon: '📝', label: 'Заметка', color: colors.modules.notes, module: 'notes' },
  ].filter((opt) => enabledModules.includes(opt.module as any) || opt.module === 'finance');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        onClick={closeBottomSheet}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden"
          style={{ background: colors.bg.elevated, paddingBottom: 'env(safe-area-inset-bottom)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          <div className="px-5 pb-4">
            <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>Что добавить?</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 px-5 pb-6">
            {options.map((opt) => (
              <motion.button
                key={opt.id}
                onClick={() => { closeBottomSheet(); console.log('Add:', opt.id); }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all active:scale-95"
                style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}30` }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-xs font-medium" style={{ color: colors.text.primary }}>{opt.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// TOASTS
// ============================================================================

function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  const getStyles = (type: string) => {
    switch (type) {
      case 'success': return { bg: colors.semantic.successSubtle, border: colors.semantic.success, icon: '✓' };
      case 'error': return { bg: colors.semantic.errorSubtle, border: colors.semantic.error, icon: '✕' };
      case 'warning': return { bg: colors.semantic.warningSubtle, border: colors.semantic.warning, icon: '!' };
      default: return { bg: 'rgba(96, 165, 250, 0.12)', border: colors.semantic.info, icon: 'i' };
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="flex items-center gap-3 p-4 rounded-xl pointer-events-auto"
              style={{ background: styles.bg, border: `1px solid ${styles.border}`, backdropFilter: 'blur(20px)' }}
              onClick={() => removeToast(toast.id)}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: styles.border, color: colors.bg.primary }}>{styles.icon}</span>
              <span className="flex-1 text-sm" style={{ color: colors.text.primary }}>{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MAIN
// ============================================================================

export default function AppWrapper({ children }: AppWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const isOnboarded = useStore((s) => s.isOnboarded);

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const check = async () => {
      await new Promise((r) => setTimeout(r, 800));
      const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
      if (!isOnboarded && !isPublic) router.replace('/onboarding');
      else if (isOnboarded && isPublic) router.replace('/');
      setIsChecking(false);
    };
    check();
  }, [isHydrated, isOnboarded, pathname, router]);

  const showNav = !NO_NAV_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <>
      <AnimatePresence mode="wait">{isChecking && <PremiumLoader key="loader" />}</AnimatePresence>

      <div className="main-content"
        style={{ opacity: isChecking ? 0 : 1, transition: 'opacity 0.3s ease-out', minHeight: '100vh', background: colors.bg.primary }}>
        {children}
      </div>

      {showNav && !isChecking && <BottomNav />}
      <QuickAddSheet />
      <ToastContainer />
    </>
  );
}
