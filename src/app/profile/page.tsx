// src/app/profile/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { ArrowLeftIcon, UserIcon, CogIcon, PaintBrushIcon, GlobeAltIcon, BellIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon, ChevronRightIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import { formatCurrency } from '@/lib/utils';

const CURRENCY_OPTIONS = [
  { code: 'UZS', symbol: "so'm", flag: '🇺🇿', name: { ru: 'Узбекский сум', en: 'Uzbek Som' } },
  { code: 'USD', symbol: '$', flag: '🇺🇸', name: { ru: 'Доллар США', en: 'US Dollar' } },
  { code: 'RUB', symbol: '₽', flag: '🇷🇺', name: { ru: 'Российский рубль', en: 'Russian Ruble' } },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', name: { ru: 'Евро', en: 'Euro' } },
];

const LANGUAGE_OPTIONS = [
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();
  
  const profile = useStore((s) => s.profile);
  const transactions = useStore((s) => s.transactions);
  const updateProfile = useStore((s) => s.updateProfile);
  const updateSettings = useStore((s) => s.updateSettings);
  const updateFinance = useStore((s) => s.updateFinance);
  const resetStore = useStore((s) => s.resetStore);
  const addToast = useStore((s) => s.addToast);
  
  const language = profile?.settings?.language || 'ru';
  const currency = profile?.finance?.currency || 'UZS';
  const theme = profile?.settings?.theme || 'dark';
  const dateLocale = language === 'ru' ? ru : enUS;
  
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    hapticFeedback?.('selection');
    updateSettings({ theme: newTheme });
    setShowThemeModal(false);
    addToast({ type: 'success', message: language === 'ru' ? 'Тема изменена' : 'Theme changed' });
  };
  
  const handleLanguageChange = (newLang: 'ru' | 'en') => {
    hapticFeedback?.('selection');
    updateSettings({ language: newLang });
    setShowLangModal(false);
    addToast({ type: 'success', message: newLang === 'ru' ? 'Язык изменён' : 'Language changed' });
  };
  
  const handleCurrencyChange = (newCurrency: string) => {
    hapticFeedback?.('selection');
    updateFinance({ currency: newCurrency });
    setShowCurrencyModal(false);
    addToast({ type: 'success', message: language === 'ru' ? 'Валюта изменена' : 'Currency changed' });
  };
  
  const handleReset = () => {
    hapticFeedback?.('notification', 'warning');
    if (confirm(language === 'ru' ? 'Вы уверены? Все данные будут удалены.' : 'Are you sure? All data will be deleted.')) {
      resetStore();
      router.push('/onboarding');
    }
  };
  
  const stats = {
    totalTransactions: transactions.length,
    totalIncome: transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    totalExpenses: transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  };

  const menuItems = [
    { icon: PaintBrushIcon, label: language === 'ru' ? 'Тема оформления' : 'Appearance', value: theme === 'dark' ? (language === 'ru' ? 'Тёмная' : 'Dark') : theme === 'light' ? (language === 'ru' ? 'Светлая' : 'Light') : (language === 'ru' ? 'Системная' : 'System'), onClick: () => setShowThemeModal(true), color: '#A855F7' },
    { icon: GlobeAltIcon, label: language === 'ru' ? 'Язык' : 'Language', value: LANGUAGE_OPTIONS.find(l => l.code === language)?.name || 'Русский', onClick: () => setShowLangModal(true), color: '#3B82F6' },
    { icon: BellIcon, label: language === 'ru' ? 'Валюта' : 'Currency', value: `${CURRENCY_OPTIONS.find(c => c.code === currency)?.flag} ${currency}`, onClick: () => setShowCurrencyModal(true), color: '#22C55E' },
  ];

  return (
    <div className="" >
      {/* Background */}
      <div className="">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50%]" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201, 169, 98, 0.12) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/3" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.08) 0%, transparent 50%)' }} />
      </div>
      
      {/* Modals */}
      {showThemeModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setShowThemeModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm p-5 rounded-2xl" style={{ background: 'var(--glass-bg-heavy)', border: '1px solid var(--glass-border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Тема оформления' : 'Theme'}</h3>
            <div className="space-y-2">
              {[{ id: 'dark', icon: MoonIcon, label: language === 'ru' ? 'Тёмная' : 'Dark' }, { id: 'light', icon: SunIcon, label: language === 'ru' ? 'Светлая' : 'Light' }, { id: 'system', icon: ComputerDesktopIcon, label: language === 'ru' ? 'Системная' : 'System' }].map((t) => (
                <motion.button key={t.id} whileTap={{ scale: 0.98 }} onClick={() => handleThemeChange(t.id as any)} className="w-full flex items-center gap-3 p-3 rounded-xl" style={{ background: theme === t.id ? 'var(--primary-subtle)' : 'var(--surface)', border: `1px solid ${theme === t.id ? 'var(--primary)' : 'var(--border)'}` }}>
                  <t.icon className="w-5 h-5" style={{ color: theme === t.id ? 'var(--primary)' : 'var(--text-secondary)' }} />
                  <span className="text-sm font-medium" style={{ color: theme === t.id ? 'var(--primary)' : 'var(--text-primary)' }}>{t.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {showLangModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setShowLangModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm p-5 rounded-2xl" style={{ background: 'var(--glass-bg-heavy)', border: '1px solid var(--glass-border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Язык' : 'Language'}</h3>
            <div className="space-y-2">
              {LANGUAGE_OPTIONS.map((l) => (
                <motion.button key={l.code} whileTap={{ scale: 0.98 }} onClick={() => handleLanguageChange(l.code as any)} className="w-full flex items-center gap-3 p-3 rounded-xl" style={{ background: language === l.code ? 'var(--primary-subtle)' : 'var(--surface)', border: `1px solid ${language === l.code ? 'var(--primary)' : 'var(--border)'}` }}>
                  <span className="text-xl">{l.flag}</span>
                  <span className="text-sm font-medium" style={{ color: language === l.code ? 'var(--primary)' : 'var(--text-primary)' }}>{l.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {showCurrencyModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setShowCurrencyModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm p-5 rounded-2xl" style={{ background: 'var(--glass-bg-heavy)', border: '1px solid var(--glass-border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Валюта' : 'Currency'}</h3>
            <div className="space-y-2">
              {CURRENCY_OPTIONS.map((c) => (
                <motion.button key={c.code} whileTap={{ scale: 0.98 }} onClick={() => handleCurrencyChange(c.code)} className="w-full flex items-center gap-3 p-3 rounded-xl" style={{ background: currency === c.code ? 'var(--primary-subtle)' : 'var(--surface)', border: `1px solid ${currency === c.code ? 'var(--primary)' : 'var(--border)'}` }}>
                  <span className="text-xl">{c.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium" style={{ color: currency === c.code ? 'var(--primary)' : 'var(--text-primary)' }}>{c.code}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{c.name[language as 'ru' | 'en']}</p>
                  </div>
                  <span className="text-lg" style={{ color: 'var(--text-secondary)' }}>{c.symbol}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
      
      <div className="page-scrollable">
        <header className="px-4 mb-4">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { hapticFeedback?.('light'); router.back(); }} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}><ArrowLeftIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} /></motion.button>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Профиль' : 'Profile'}</h1>
          </div>
        </header>
        
        <main className="px-4 space-y-4 pb-8">
          {/* User Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.15) 0%, var(--glass-bg) 100%)', border: '1px solid rgba(201, 169, 98, 0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--primary-subtle)' }}>
                {profile?.name ? (<span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{profile.name.charAt(0).toUpperCase()}</span>) : (<UserIcon className="w-8 h-8" style={{ color: 'var(--primary)' }} />)}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{profile?.name || (language === 'ru' ? 'Пользователь' : 'User')}</h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Участник с' : 'Member since'} {format(new Date(), 'MMMM yyyy', { locale: dateLocale })}</p>
              </div>
            </div>
          </motion.div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalTransactions}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Транзакций' : 'Transactions'}</p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>+{formatCurrency(stats.totalIncome, currency, true)}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Доходы' : 'Income'}</p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--error)' }}>-{formatCurrency(stats.totalExpenses, currency, true)}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Расходы' : 'Expenses'}</p>
            </div>
          </div>
          
          {/* Settings */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold px-1 mb-2" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Настройки' : 'Settings'}</h3>
            {menuItems.map((item, index) => (
              <motion.button key={index} whileTap={{ scale: 0.98 }} onClick={item.onClick} className="w-full flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}20` }}><item.icon className="w-5 h-5" style={{ color: item.color }} /></div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.value}</span>
                  <ChevronRightIcon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </motion.button>
            ))}
          </div>
          
          {/* Danger Zone */}
          <div className="pt-4">
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleReset} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl" style={{ background: 'var(--error-subtle)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
              <ArrowRightOnRectangleIcon className="w-5 h-5" style={{ color: 'var(--error)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--error)' }}>{language === 'ru' ? 'Сбросить все данные' : 'Reset All Data'}</span>
            </motion.button>
          </div>
        </main>
      </div>
    </div>
  );
}