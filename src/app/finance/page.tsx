// src/app/finance/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ClockIcon,
  ChevronRightIcon,
  FunnelIcon,
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
};

export default function FinancePage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();
  
  const profile = useStore((s) => s.profile);
  const transactions = useStore((s) => s.transactions);
  
  const language = profile?.settings?.language || 'ru';
  const currency = profile?.finance?.currency || 'UZS';
  const dateLocale = language === 'ru' ? ru : enUS;
  
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  // Расчёт статистики
  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    const filtered = transactions.filter(t => new Date(t.date) >= startDate);
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
    
    return { income, expenses, balance: income - expenses, categories };
  }, [transactions, period]);
  
  const periodLabels = {
    week: language === 'ru' ? 'Неделя' : 'Week',
    month: language === 'ru' ? 'Месяц' : 'Month',
    year: language === 'ru' ? 'Год' : 'Year',
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="px-4 pt-safe">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {language === 'ru' ? 'Финансы' : 'Finance'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {format(new Date(), 'MMMM yyyy', { locale: dateLocale })}
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('light');
                router.push('/history');
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface)' }}
            >
              <ClockIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </motion.button>
          </div>
        </div>
      </header>
      
      <main className="px-4 space-y-4">
        {/* Period Selector */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--surface)' }}>
          {(['week', 'month', 'year'] as const).map((p) => (
            <motion.button
              key={p}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('selection');
                setPeriod(p);
              }}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: period === p ? 'var(--primary)' : 'transparent',
                color: period === p ? '#0A0A0A' : 'var(--text-secondary)',
              }}
            >
              {periodLabels[p]}
            </motion.button>
          ))}
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--success-subtle)' }}>
                <ArrowTrendingUpIcon className="w-4 h-4" style={{ color: 'var(--success)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' ? 'Доходы' : 'Income'}
              </span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--success)' }}>
              +{formatCurrency(stats.income, currency, true)}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--error-subtle)' }}>
                <ArrowTrendingDownIcon className="w-4 h-4" style={{ color: 'var(--error)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' ? 'Расходы' : 'Expenses'}
              </span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--error)' }}>
              -{formatCurrency(stats.expenses, currency, true)}
            </p>
          </motion.div>
        </div>
        
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
          style={{
            background: stats.balance >= 0 
              ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, var(--surface) 100%)'
              : 'linear-gradient(135deg, rgba(248, 113, 113, 0.1) 0%, var(--surface) 100%)',
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
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-subtle)' }}>
              <ChartBarIcon className="w-6 h-6" style={{ color: 'var(--primary)' }} />
            </div>
          </div>
        </motion.div>
        
        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {language === 'ru' ? 'По категориям' : 'By Category'}
            </h3>
            <button className="p-1">
              <FunnelIcon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </div>
          
          {stats.categories.length > 0 ? (
            <div className="space-y-3">
              {stats.categories.map((cat, index) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
                      {cat.name}
                    </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {language === 'ru' ? 'Нет данных за период' : 'No data for this period'}
            </p>
          )}
        </motion.div>
        
        {/* Quick Links */}
        <div className="space-y-2">
          {[
            { label: language === 'ru' ? 'История транзакций' : 'Transaction History', route: '/history', icon: '📋' },
            { label: language === 'ru' ? 'Цели накоплений' : 'Saving Goals', route: '/goals', icon: '🎯' },
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
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {item.label}
                </span>
              </div>
              <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}