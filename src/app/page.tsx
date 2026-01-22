// src/app/(main)/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru, enUS, uz } from 'date-fns/locale';
import type { Locale } from 'date-fns';

import { useUserStore } from '@/store/userStore';
import { useTransactionStore } from '@/store/transactionStore';
import { useGoalStore } from '@/store/goalStore';
import { BalanceCard } from '@/components/features/BalanceCard';
import { PeriodStats, GoalsWidget } from '@/components/features/QuickStats';
import { RecentTransactions } from '@/components/features/TransactionList';
import { useTelegram } from '@/hooks/useTelegram';

const localesMap: Record<string, Locale> = { ru, en: enUS, uz };

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const { user, hapticFeedback } = useTelegram();
  
  const profile = useUserStore((state) => state.profile);
  const isOnboarded = useUserStore((state) => state.isOnboarded);
  
  const transactions = useTransactionStore((state) => state.transactions);
  const getSpentThisMonth = useTransactionStore((state) => state.getSpentThisMonth);
  
  const goals = useGoalStore((state) => state.goals);
  
  const language = profile?.settings.language || 'ru';
  const locale = localesMap[language] || ru;
  const currency = profile?.finance.currency || 'UZS';
  const balance = profile?.stats.currentBalance || 0;
  const monthlyBudget = profile?.finance.monthlyBudget || 0;
  const salaryDay = profile?.finance.salaryDay || 1;
  const spentThisMonth = getSpentThisMonth();
  
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Доброе утро', emoji: '☀️' };
    if (hour >= 12 && hour < 17) return { text: 'Добрый день', emoji: '🌤️' };
    if (hour >= 17 && hour < 22) return { text: 'Добрый вечер', emoji: '🌅' };
    return { text: 'Доброй ночи', emoji: '🌙' };
  }, []);
  
  const userName = user?.first_name || profile?.name || 'User';
  
  const periodStats = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    
    const todayExpenses = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(todayStr))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= weekAgo && new Date(t.date) <= now)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { today: todayExpenses, week: weekExpenses, month: spentThisMonth };
  }, [transactions, spentThisMonth]);
  
  const activeGoals = useMemo(() => {
    return goals
      .filter(g => (g.currentAmount / g.targetAmount) * 100 < 100)
      .map(g => ({ id: g.id, name: g.name, icon: g.icon, color: g.color, currentAmount: g.currentAmount, targetAmount: g.targetAmount, deadline: g.deadline }));
  }, [goals]);
  
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);
  
  useEffect(() => { setMounted(true); }, []);
  
  useEffect(() => {
    if (mounted && !isOnboarded) router.push('/onboarding');
  }, [mounted, isOnboarded, router]);
  
  if (!mounted || !isOnboarded) return null;
  
  return (
    <div className="min-h-full px-4 pt-safe pb-24">
      <header className="pt-4 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{greeting.emoji}</span>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{greeting.text}, {userName}!</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{format(new Date(), 'EEEE, d MMMM', { locale })}</p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => hapticFeedback?.('light')} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)' }}>
            <span className="text-lg">🔔</span>
          </motion.button>
        </motion.div>
      </header>
      
      <section className="mb-5">
        <BalanceCard balance={balance} currency={currency} monthlyBudget={monthlyBudget} spent={spentThisMonth} salaryDay={salaryDay} />
      </section>
      
      <section className="mb-5">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm">📊</span>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Быстрая статистика</h2>
        </div>
        <PeriodStats today={periodStats.today} week={periodStats.week} month={periodStats.month} currency={currency} type="expense" />
      </section>
      
      {activeGoals.length > 0 && (
        <section className="mb-5">
          <GoalsWidget goals={activeGoals} currency={currency} maxItems={2} onViewAll={() => { hapticFeedback?.('light'); router.push('/more/goals'); }} onGoalClick={(goalId) => { hapticFeedback?.('light'); router.push(`/more/goals/${goalId}`); }} />
        </section>
      )}
      
      <section className="mb-5">
        <RecentTransactions transactions={recentTransactions} currency={currency} locale={language as 'ru' | 'en' | 'uz'} maxItems={5} onViewAll={() => { hapticFeedback?.('light'); router.push('/history'); }} />
      </section>
      
      {transactions.length === 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-5">
          <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--primary-subtle)', border: '1px solid var(--primary)' }}>
            <span className="text-3xl mb-2 block">💡</span>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Начните вести учёт</p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Добавьте первую транзакцию, чтобы увидеть статистику</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => hapticFeedback?.('medium')} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #C9A962 0%, #E8D5A3 50%, #C9A962 100%)', color: '#0A0A0A' }}>
              + Добавить транзакцию
            </motion.button>
          </div>
        </motion.section>
      )}
    </div>
  );
}