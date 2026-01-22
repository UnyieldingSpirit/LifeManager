// src/app/finance/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ClockIcon,
  ChevronRightIcon,
  FunnelIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  XMarkIcon,
  FlagIcon,
  CreditCardIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import { formatCurrency } from '@/lib/utils';

// Цвета категорий
const CATEGORY_COLORS: Record<string, string> = {
  food: '#F97316',
  transport: '#3B82F6',
  entertainment: '#A855F7',
  shopping: '#EC4899',
  health: '#10B981',
  bills: '#EF4444',
  education: '#6366F1',
  other: '#6B7280',
  salary: '#22C55E',
  freelance: '#14B8A6',
  investment: '#F59E0B',
  gift: '#EC4899',
};

const CATEGORY_LABELS: Record<string, { ru: string; en: string }> = {
  food: { ru: 'Еда', en: 'Food' },
  transport: { ru: 'Транспорт', en: 'Transport' },
  entertainment: { ru: 'Развлечения', en: 'Entertainment' },
  shopping: { ru: 'Покупки', en: 'Shopping' },
  health: { ru: 'Здоровье', en: 'Health' },
  bills: { ru: 'Счета', en: 'Bills' },
  education: { ru: 'Образование', en: 'Education' },
  other: { ru: 'Другое', en: 'Other' },
  salary: { ru: 'Зарплата', en: 'Salary' },
  freelance: { ru: 'Фриланс', en: 'Freelance' },
  investment: { ru: 'Инвестиции', en: 'Investment' },
  gift: { ru: 'Подарок', en: 'Gift' },
};

export default function FinancePage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();
  
  const profile = useStore((s) => s.profile);
  const transactions = useStore((s) => s.transactions);
  const goals = useStore((s) => s.goals);
  
  const language = profile?.settings?.language || 'ru';
  const currency = profile?.finance?.currency || 'UZS';
  const dateLocale = language === 'ru' ? ru : enUS;
  const balance = profile?.stats?.currentBalance || 0;
  
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'custom'>('month');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  
  // Расчёт дат для периода
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31) };
      case 'custom':
        return customDateStart && customDateEnd 
          ? { start: parseISO(customDateStart), end: parseISO(customDateEnd) }
          : { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [period, customDateStart, customDateEnd]);
  
  // Расчёт статистики
  const stats = useMemo(() => {
    const filtered = transactions.filter(t => {
      const txDate = parseISO(t.date);
      const inRange = isWithinInterval(txDate, { start: dateRange.start, end: dateRange.end });
      const matchesType = filterType === 'all' || t.type === filterType;
      return inRange && matchesType;
    });
    
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    // Категории расходов
    const categoryMap = new Map<string, number>();
    filtered.filter(t => t.type === 'expense').forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });
    
    const categories = Array.from(categoryMap.entries())
      .map(([name, amount]) => ({ name, amount, percent: expenses > 0 ? (amount / expenses) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // Последние транзакции
    const recent = filtered.slice(0, 5);
    
    return { income, expenses, balance: income - expenses, categories, transactions: filtered, recent };
  }, [transactions, dateRange, filterType]);
  
  const periodLabels = {
    week: language === 'ru' ? 'Неделя' : 'Week',
    month: language === 'ru' ? 'Месяц' : 'Month',
    year: language === 'ru' ? 'Год' : 'Year',
    custom: language === 'ru' ? 'Период' : 'Custom',
  };
  
  const applyCustomDate = () => {
    if (customDateStart && customDateEnd) {
      setPeriod('custom');
      setShowDatePicker(false);
      hapticFeedback?.('success');
    }
  };

  return (
    <div className="">
      {/* ============================================================================
          УНИКАЛЬНЫЙ ФОН СТРАНИЦЫ ФИНАНСОВ
          Тема: Богатство, рост, премиум
          Золотое свечение с эффектом роскоши
          ============================================================================ */}
      <div className="">
        {/* Основной градиент золота */}
        <div 
          className="absolute top-0 right-0 w-[80%] h-[60%]"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 100% 0%, rgba(201, 169, 98, 0.15) 0%, transparent 60%)',
          }}
        />
        
        {/* Зелёное свечение для дохода */}
        <div 
          className="absolute bottom-20 left-0 w-1/2 h-1/3"
          style={{
            background: 'radial-gradient(ellipse at bottom left, rgba(74, 222, 128, 0.1) 0%, transparent 50%)',
          }}
        />
        
        {/* Красное свечение для расхода */}
        <div 
          className="absolute bottom-20 right-0 w-1/2 h-1/3"
          style={{
            background: 'radial-gradient(ellipse at bottom right, rgba(248, 113, 113, 0.1) 0%, transparent 50%)',
          }}
        />
        
        {/* Декоративные частицы */}
        <div className="absolute top-32 right-10 w-1 h-1 rounded-full bg-amber-400 opacity-40 animate-float" />
        <div className="absolute top-48 right-20 w-1.5 h-1.5 rounded-full bg-yellow-300 opacity-30 animate-float" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Date Picker Modal */}
      <AnimatePresence>
        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowDatePicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm p-5 rounded-2xl"
              style={{ background: 'var(--glass-bg-heavy)', border: '1px solid var(--glass-border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'Выберите период' : 'Select Period'}
                </h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowDatePicker(false)}>
                  <XMarkIcon className="w-6 h-6" style={{ color: 'var(--text-tertiary)' }} />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'ru' ? 'От' : 'From'}
                  </label>
                  <input
                    type="date"
                    value={customDateStart}
                    onChange={(e) => setCustomDateStart(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'ru' ? 'До' : 'To'}
                  </label>
                  <input
                    type="date"
                    value={customDateEnd}
                    onChange={(e) => setCustomDateEnd(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                  />
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={applyCustomDate}
                  disabled={!customDateStart || !customDateEnd}
                  className="w-full py-3 rounded-xl font-semibold"
                  style={{
                    background: customDateStart && customDateEnd 
                      ? 'linear-gradient(135deg, var(--primary) 0%, #E8D5A3 100%)'
                      : 'var(--surface-dim)',
                    color: customDateStart && customDateEnd ? '#0A0A0A' : 'var(--text-tertiary)',
                  }}
                >
                  {language === 'ru' ? 'Применить' : 'Apply'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Scrollable Content */}
      <div className="page-scrollable">
        {/* Header */}
        <header className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BanknotesIcon className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'Финансы' : 'Finance'}
                </h1>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {format(new Date(), 'MMMM yyyy', { locale: dateLocale })}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('light');
                router.push('/history');
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}
            >
              <ClockIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </motion.button>
          </div>
        </header>
        
        <main className="px-4 space-y-4 pb-8">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.2) 0%, rgba(22, 22, 22, 0.95) 50%, rgba(22, 22, 22, 0.98) 100%)',
              border: '1px solid rgba(201, 169, 98, 0.3)',
              boxShadow: '0 8px 32px rgba(201, 169, 98, 0.15)',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <SparklesIcon className="w-full h-full" style={{ color: 'var(--primary)' }} />
            </div>
            
            <div className="relative z-10">
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' ? 'Текущий баланс' : 'Current Balance'}
              </p>
              <p className="text-3xl font-bold text-gradient-gold mb-4">
                {formatCurrency(balance, currency)}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowTrendingUpIcon className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Доход' : 'Income'}</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>+{formatCurrency(stats.income, currency, true)}</p>
                </div>
                
                <div className="p-3 rounded-xl" style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowTrendingDownIcon className="w-4 h-4" style={{ color: 'var(--error)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Расход' : 'Expenses'}</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: 'var(--error)' }}>-{formatCurrency(stats.expenses, currency, true)}</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            <div className="flex-1 flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--surface-dim)' }}>
              {(['week', 'month', 'year'] as const).map((p) => (
                <motion.button
                  key={p}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    hapticFeedback?.('selection');
                    setPeriod(p);
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: period === p ? 'var(--primary)' : 'transparent',
                    color: period === p ? '#0A0A0A' : 'var(--text-secondary)',
                  }}
                >
                  {periodLabels[p]}
                </motion.button>
              ))}
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('light');
                setShowDatePicker(true);
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ 
                background: period === 'custom' ? 'var(--primary)' : 'var(--surface)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <CalendarDaysIcon className="w-5 h-5" style={{ color: period === 'custom' ? '#0A0A0A' : 'var(--text-secondary)' }} />
            </motion.button>
          </div>
          
          {/* Filter Type */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: 'all', label: language === 'ru' ? 'Все' : 'All', icon: ChartBarIcon },
              { id: 'income', label: language === 'ru' ? 'Доходы' : 'Income', icon: ArrowTrendingUpIcon, color: '#22C55E' },
              { id: 'expense', label: language === 'ru' ? 'Расходы' : 'Expenses', icon: ArrowTrendingDownIcon, color: '#F87171' },
            ].map((f) => (
              <motion.button
                key={f.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  hapticFeedback?.('selection');
                  setFilterType(f.id as any);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap"
                style={{
                  background: filterType === f.id ? (f.color ? `${f.color}20` : 'var(--primary-subtle)') : 'var(--surface)',
                  border: `1px solid ${filterType === f.id ? (f.color || 'var(--primary)') : 'var(--border)'}`,
                  color: filterType === f.id ? (f.color || 'var(--primary)') : 'var(--text-secondary)',
                }}
              >
                <f.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{f.label}</span>
              </motion.button>
            ))}
          </div>
          
          {/* Period Balance */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl"
            style={{
              background: stats.balance >= 0 
                ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, var(--surface) 100%)'
                : 'linear-gradient(135deg, rgba(248, 113, 113, 0.15) 0%, var(--surface) 100%)',
              border: `1px solid ${stats.balance >= 0 ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'ru' ? 'Баланс за период' : 'Period Balance'}
                </p>
                <p className="text-2xl font-bold" style={{ color: stats.balance >= 0 ? 'var(--success)' : 'var(--error)' }}>
                  {stats.balance >= 0 ? '+' : ''}{formatCurrency(stats.balance, currency, true)}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: stats.balance >= 0 ? 'var(--success-subtle)' : 'var(--error-subtle)' }}
              >
                {stats.balance >= 0 
                  ? <ArrowTrendingUpIcon className="w-6 h-6" style={{ color: 'var(--success)' }} />
                  : <ArrowTrendingDownIcon className="w-6 h-6" style={{ color: 'var(--error)' }} />
                }
              </div>
            </div>
          </motion.div>
          
          {/* Categories */}
          {stats.categories.length > 0 && filterType !== 'income' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'По категориям' : 'By Category'}
                </h3>
                <FunnelIcon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              
              <div className="space-y-3">
                {stats.categories.map((cat, index) => (
                  <motion.div 
                    key={cat.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ background: CATEGORY_COLORS[cat.name] || CATEGORY_COLORS.other }}
                        />
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {CATEGORY_LABELS[cat.name]?.[language as 'ru' | 'en'] || cat.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(cat.amount, currency, true)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percent}%` }}
                        transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: CATEGORY_COLORS[cat.name] || CATEGORY_COLORS.other }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Recent Transactions */}
          {stats.recent.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'Последние операции' : 'Recent Transactions'}
                </h3>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/history')}
                  className="text-xs font-medium"
                  style={{ color: 'var(--primary)' }}
                >
                  {language === 'ru' ? 'Все' : 'All'}
                </motion.button>
              </div>
              
              <div className="space-y-2">
                {stats.recent.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-2.5 rounded-xl"
                    style={{ background: 'var(--surface-secondary)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: tx.type === 'income' ? 'var(--success-subtle)' : 'var(--error-subtle)' }}
                      >
                        {tx.type === 'income' 
                          ? <ArrowTrendingUpIcon className="w-4 h-4" style={{ color: 'var(--success)' }} />
                          : <ArrowTrendingDownIcon className="w-4 h-4" style={{ color: 'var(--error)' }} />
                        }
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                          {tx.description || CATEGORY_LABELS[tx.category]?.[language as 'ru' | 'en'] || tx.category}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                          {format(parseISO(tx.date), 'd MMM', { locale: dateLocale })}
                        </p>
                      </div>
                    </div>
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--error)' }}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency, true)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Quick Links */}
          <div className="space-y-2">
            {[
              { label: language === 'ru' ? 'История транзакций' : 'Transaction History', route: '/history', icon: ClockIcon, color: '#60A5FA' },
              { label: language === 'ru' ? 'Цели накоплений' : 'Saving Goals', route: '/goals', icon: FlagIcon, color: '#F97316' },
            ].map((item, index) => (
              <motion.button
                key={item.route}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  hapticFeedback?.('light');
                  router.push(item.route);
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}
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
                <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
              </motion.button>
            ))}
          </div>
          
          {/* Empty State */}
          {transactions.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-xl text-center"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <div 
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--primary-subtle)', boxShadow: '0 8px 30px rgba(201, 169, 98, 0.2)' }}
              >
                <BanknotesIcon className="w-10 h-10" style={{ color: 'var(--primary)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {language === 'ru' ? 'Нет транзакций' : 'No Transactions'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' 
                  ? 'Добавьте первую транзакцию, чтобы начать отслеживать финансы' 
                  : 'Add your first transaction to start tracking finances'
                }
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}