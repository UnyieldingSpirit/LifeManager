// src/app/profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  BellIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  XMarkIcon,
  CheckIcon,
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useStore } from '@/store';
import { useTelegram, useTranslation, useFormatters, useScrollLock } from '@/hooks';
import { getAvailableLanguages, type Locale } from '@/locales';

// ============================================================================
// CURRENCY OPTIONS
// ============================================================================

const CURRENCY_OPTIONS = [
  { code: 'UZS', symbol: "so'm", flag: '🇺🇿' },
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
  { code: 'RUB', symbol: '₽', flag: '🇷🇺' },
  { code: 'KZT', symbol: '₸', flag: '🇰🇿' },
  { code: 'KGS', symbol: 'сом', flag: '🇰🇬' },
  { code: 'TJS', symbol: 'с.', flag: '🇹🇯' },
  { code: 'TRY', symbol: '₺', flag: '🇹🇷' },
];

// ============================================================================
// BOTTOM SHEET COMPONENT
// ============================================================================

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  
  // Блокируем скролл при открытии
  useScrollLock(isOpen);
  
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] max-h-[85vh] overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1A1A1A 0%, #0F0F0F 100%)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
              />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              >
                <XMarkIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </motion.button>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] pb-safe">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// LANGUAGE SELECTOR CONTENT
// ============================================================================

interface LanguageSelectorContentProps {
  currentLocale: Locale;
  onSelect: (locale: Locale) => void;
}

function LanguageSelectorContent({ currentLocale, onSelect }: LanguageSelectorContentProps) {
  const languages = getAvailableLanguages();
  const { hapticFeedback } = useTelegram();

  const handleSelect = (locale: Locale) => {
    hapticFeedback?.('selection');
    onSelect(locale);
  };

  return (
    <div className="p-4 space-y-2">
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect(lang.code)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
          style={{
            background: currentLocale === lang.code 
              ? 'linear-gradient(135deg, rgba(201, 169, 98, 0.2) 0%, rgba(201, 169, 98, 0.1) 100%)'
              : 'rgba(255, 255, 255, 0.05)',
            border: currentLocale === lang.code 
              ? '1px solid rgba(201, 169, 98, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Flag */}
          <span className="text-3xl">{lang.flag}</span>
          
          {/* Text */}
          <div className="flex-1 text-left">
            <p 
              className="text-base font-semibold"
              style={{ 
                color: currentLocale === lang.code ? 'var(--primary)' : 'var(--text-primary)' 
              }}
            >
              {lang.nativeName}
            </p>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {lang.name}
            </p>
          </div>
          
          {/* Check */}
          {currentLocale === lang.code && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'var(--primary)' }}
            >
              <CheckIcon className="w-4 h-4 text-black" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}

// ============================================================================
// THEME SELECTOR CONTENT
// ============================================================================

interface ThemeSelectorContentProps {
  currentTheme: 'light' | 'dark' | 'system';
  onSelect: (theme: 'light' | 'dark' | 'system') => void;
  t: (key: string) => string;
}

function ThemeSelectorContent({ currentTheme, onSelect, t }: ThemeSelectorContentProps) {
  const { hapticFeedback } = useTelegram();
  
  const themes = [
    { id: 'dark' as const, icon: MoonIcon, label: t('profile.themeDark'), desc: 'Тёмные тона' },
    { id: 'light' as const, icon: SunIcon, label: t('profile.themeLight'), desc: 'Светлые тона' },
    { id: 'system' as const, icon: ComputerDesktopIcon, label: t('profile.themeSystem'), desc: 'Как в системе' },
  ];

  const handleSelect = (theme: 'light' | 'dark' | 'system') => {
    hapticFeedback?.('selection');
    onSelect(theme);
  };

  return (
    <div className="p-4 space-y-2">
      {themes.map((theme) => (
        <motion.button
          key={theme.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect(theme.id)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
          style={{
            background: currentTheme === theme.id 
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)'
              : 'rgba(255, 255, 255, 0.05)',
            border: currentTheme === theme.id 
              ? '1px solid rgba(168, 85, 247, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: currentTheme === theme.id ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.1)' }}
          >
            <theme.icon 
              className="w-6 h-6" 
              style={{ color: currentTheme === theme.id ? '#A855F7' : 'var(--text-secondary)' }} 
            />
          </div>
          
          <div className="flex-1 text-left">
            <p 
              className="text-base font-semibold"
              style={{ color: currentTheme === theme.id ? '#A855F7' : 'var(--text-primary)' }}
            >
              {theme.label}
            </p>
          </div>
          
          {currentTheme === theme.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: '#A855F7' }}
            >
              <CheckIcon className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}

// ============================================================================
// CURRENCY SELECTOR CONTENT
// ============================================================================

interface CurrencySelectorContentProps {
  currentCurrency: string;
  onSelect: (currency: string) => void;
  t: (key: string) => string;
}

function CurrencySelectorContent({ currentCurrency, onSelect, t }: CurrencySelectorContentProps) {
  const { hapticFeedback } = useTelegram();
  const { translations } = useTranslation();

  const handleSelect = (currency: string) => {
    hapticFeedback?.('selection');
    onSelect(currency);
  };

  return (
    <div className="p-4 grid grid-cols-2 gap-2">
      {CURRENCY_OPTIONS.map((c) => (
        <motion.button
          key={c.code}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect(c.code)}
          className="flex items-center gap-3 p-4 rounded-2xl transition-all"
          style={{
            background: currentCurrency === c.code 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
              : 'rgba(255, 255, 255, 0.05)',
            border: currentCurrency === c.code 
              ? '1px solid rgba(34, 197, 94, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span className="text-2xl">{c.flag}</span>
          <div className="flex-1 text-left">
            <p 
              className="text-sm font-semibold"
              style={{ color: currentCurrency === c.code ? '#22C55E' : 'var(--text-primary)' }}
            >
              {c.code}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {c.symbol}
            </p>
          </div>
          {currentCurrency === c.code && (
            <CheckIcon className="w-5 h-5" style={{ color: '#22C55E' }} />
          )}
        </motion.button>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN PROFILE PAGE
// ============================================================================

export default function ProfilePage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();
  const { t, locale, localeInfo } = useTranslation();
  const { formatCompactMoney } = useFormatters();
  
  const profile = useStore((s) => s.profile);
  const transactions = useStore((s) => s.transactions);
  const updateSettings = useStore((s) => s.updateSettings);
  const updateFinance = useStore((s) => s.updateFinance);
  const setLanguage = useStore((s) => s.setLanguage);
  const setTheme = useStore((s) => s.setTheme);
  const resetStore = useStore((s) => s.resetStore);
  const addToast = useStore((s) => s.addToast);
  
  const currency = profile?.finance?.currency || 'UZS';
  const theme = profile?.settings?.theme || 'dark';
  
  // Modals state
  const [showLangSheet, setShowLangSheet] = useState(false);
  const [showThemeSheet, setShowThemeSheet] = useState(false);
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  
  // Handlers
  const handleLanguageChange = (newLocale: Locale) => {
    setLanguage(newLocale);
    setShowLangSheet(false);
    addToast({ type: 'success', message: t('messages.saved') });
  };
  
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setShowThemeSheet(false);
    addToast({ type: 'success', message: t('messages.saved') });
  };
  
  const handleCurrencyChange = (newCurrency: string) => {
    updateFinance({ currency: newCurrency });
    setShowCurrencySheet(false);
    addToast({ type: 'success', message: t('messages.saved') });
  };
  
  const handleReset = () => {
    hapticFeedback?.('notification', 'warning');
    if (confirm(t('messages.confirmDelete'))) {
      resetStore();
      router.push('/onboarding');
    }
  };
  
  // Stats
  const stats = {
    totalTransactions: transactions.length,
    totalIncome: transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    totalExpenses: transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  };

  // Menu items
  const menuItems = [
    { 
      icon: GlobeAltIcon, 
      label: t('profile.language'), 
      value: `${localeInfo.flag} ${localeInfo.nativeName}`, 
      onClick: () => setShowLangSheet(true), 
      color: '#3B82F6' 
    },
    { 
      icon: PaintBrushIcon, 
      label: t('profile.theme'), 
      value: theme === 'dark' ? t('profile.themeDark') : theme === 'light' ? t('profile.themeLight') : t('profile.themeSystem'), 
      onClick: () => setShowThemeSheet(true), 
      color: '#A855F7' 
    },
    { 
      icon: CurrencyDollarIcon, 
      label: t('profile.currency'), 
      value: `${CURRENCY_OPTIONS.find(c => c.code === currency)?.flag || ''} ${currency}`, 
      onClick: () => setShowCurrencySheet(true), 
      color: '#22C55E' 
    },
  ];

  return (
    <>
      <div className="min-h-screen relative">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50%]" 
            style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201, 169, 98, 0.12) 0%, transparent 60%)' }} 
          />
        </div>
        
        <div className="page-scrollable relative">
          {/* Header */}
          <header className="px-4 pt-2 pb-4">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {t('profile.title')}
            </h1>
          </header>
          
          <main className="px-4 space-y-4 pb-32">
            {/* User Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="p-5 rounded-2xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)', 
                border: '1px solid rgba(201, 169, 98, 0.2)' 
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(201, 169, 98, 0.2)' }}
                >
                  {profile?.name ? (
                    <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <UserIcon className="w-8 h-8" style={{ color: 'var(--primary)' }} />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {profile?.name || t('profile.taskflowUser')}
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    LifeLedger • {localeInfo.nativeName}
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-3 rounded-xl text-center"
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.totalTransactions}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {t('finance.transactions')}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-3 rounded-xl text-center"
                style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)' }}
              >
                <p className="text-base font-bold truncate" style={{ color: '#4ADE80' }}>
                  +{formatCompactMoney(stats.totalIncome)}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {t('finance.income')}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 rounded-xl text-center"
                style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)' }}
              >
                <p className="text-base font-bold truncate" style={{ color: '#F87171' }}>
                  -{formatCompactMoney(stats.totalExpenses)}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {t('finance.expense')}
                </p>
              </motion.div>
            </div>
            
            {/* Settings Menu */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <h3 className="text-sm font-semibold px-1 mb-3" style={{ color: 'var(--text-secondary)' }}>
                {t('profile.settings')}
              </h3>
              
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)' 
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${item.color}20` }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {item.value}
                    </span>
                    <ChevronRightIcon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                </motion.button>
              ))}
            </motion.div>
            
            {/* Danger Zone */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4"
            >
              <motion.button 
                whileTap={{ scale: 0.98 }} 
                onClick={handleReset} 
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl"
                style={{ 
                  background: 'rgba(248, 113, 113, 0.1)', 
                  border: '1px solid rgba(248, 113, 113, 0.2)' 
                }}
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" style={{ color: '#F87171' }} />
                <span className="text-sm font-medium" style={{ color: '#F87171' }}>
                  {t('profile.logout')}
                </span>
              </motion.button>
            </motion.div>
            
            {/* Version */}
            <p className="text-center text-xs pt-4" style={{ color: 'var(--text-tertiary)' }}>
              LifeLedger v2.0.0
            </p>
          </main>
        </div>
      </div>
      
      {/* Bottom Sheets */}
      <BottomSheet
        isOpen={showLangSheet}
        onClose={() => setShowLangSheet(false)}
        title={t('profile.selectLanguage')}
      >
        <LanguageSelectorContent
          currentLocale={locale}
          onSelect={handleLanguageChange}
        />
      </BottomSheet>
      
      <BottomSheet
        isOpen={showThemeSheet}
        onClose={() => setShowThemeSheet(false)}
        title={t('profile.theme')}
      >
        <ThemeSelectorContent
          currentTheme={theme}
          onSelect={handleThemeChange}
          t={t}
        />
      </BottomSheet>
      
      <BottomSheet
        isOpen={showCurrencySheet}
        onClose={() => setShowCurrencySheet(false)}
        title={t('profile.currency')}
      >
        <CurrencySelectorContent
          currentCurrency={currency}
          onSelect={handleCurrencyChange}
          t={t}
        />
      </BottomSheet>
    </>
  );
}