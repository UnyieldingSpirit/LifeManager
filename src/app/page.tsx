// src/app/page.tsx
// ============================================================================
// LIFELEDGER - ГЛАВНАЯ СТРАНИЦА (Dashboard)
// Адаптивный дашборд с виджетами на основе включённых модулей
// ============================================================================

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { 
  PlusIcon,
  ChevronRightIcon,
  BellIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FireIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import type { EnabledModule, Transaction, Task, Event, Habit, SavingGoal } from '@/types';

// ============================================================================
// ТИПЫ
// ============================================================================

interface WidgetProps {
  onAction?: () => void;
}

// ============================================================================
// УТИЛИТЫ
// ============================================================================

const getGreeting = (language: string) => {
  const hour = new Date().getHours();
  const greetings = {
    ru: {
      morning: 'Доброе утро',
      day: 'Добрый день',
      evening: 'Добрый вечер',
      night: 'Доброй ночи',
    },
    en: {
      morning: 'Good morning',
      day: 'Good afternoon',
      evening: 'Good evening',
      night: 'Good night',
    },
  };
  
  const lang = language === 'ru' ? 'ru' : 'en';
  
  if (hour >= 5 && hour < 12) return { text: greetings[lang].morning, emoji: '☀️' };
  if (hour >= 12 && hour < 17) return { text: greetings[lang].day, emoji: '🌤️' };
  if (hour >= 17 && hour < 22) return { text: greetings[lang].evening, emoji: '🌅' };
  return { text: greetings[lang].night, emoji: '🌙' };
};

// ============================================================================
// КОМПОНЕНТЫ ВИДЖЕТОВ
// ============================================================================

// --- Balance Card Widget ---
function BalanceWidget({ 
  balance, 
  currency, 
  spent, 
  budget, 
  income,
  language,
  onPress 
}: { 
  balance: number; 
  currency: string; 
  spent: number;
  budget: number;
  income: number;
  language: string;
  onPress: () => void;
}) {
  const budgetPercent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOverBudget = spent > budget && budget > 0;
  
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className="glass-card p-5 cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.15) 0%, rgba(22, 22, 22, 0.9) 50%, rgba(22, 22, 22, 0.95) 100%)',
        border: '1px solid rgba(201, 169, 98, 0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {language === 'ru' ? 'Текущий баланс' : 'Current Balance'}
        </span>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'var(--primary-subtle)' }}>
          <SparklesIcon className="w-3 h-3" style={{ color: 'var(--primary)' }} />
          <span className="text-[10px] font-medium" style={{ color: 'var(--primary)' }}>Premium</span>
        </div>
      </div>
      
      {/* Balance */}
      <div className="mb-4">
        <span className="text-3xl font-bold text-gradient-gold">
          {formatCurrency(balance, currency)}
        </span>
      </div>
      
      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--success-subtle)' }}>
            <ArrowTrendingUpIcon className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
          </div>
          <div>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              {language === 'ru' ? 'Доход' : 'Income'}
            </p>
            <p className="text-xs font-semibold" style={{ color: 'var(--success)' }}>
              +{formatCurrency(income, currency, true)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--error-subtle)' }}>
            <ArrowTrendingDownIcon className="w-3.5 h-3.5" style={{ color: 'var(--error)' }} />
          </div>
          <div>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              {language === 'ru' ? 'Расход' : 'Expenses'}
            </p>
            <p className="text-xs font-semibold" style={{ color: 'var(--error)' }}>
              -{formatCurrency(spent, currency, true)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Budget Progress */}
      {budget > 0 && (
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              {language === 'ru' ? 'Бюджет на месяц' : 'Monthly Budget'}
            </span>
            <span className="text-[10px] font-medium" style={{ color: isOverBudget ? 'var(--error)' : 'var(--text-primary)' }}>
              {Math.round(budgetPercent)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${budgetPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ 
                background: isOverBudget 
                  ? 'linear-gradient(90deg, var(--error), #ff8a80)' 
                  : 'linear-gradient(90deg, var(--primary), #E8D5A3)' 
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// --- Quick Actions Widget ---
function QuickActionsWidget({ 
  enabledModules, 
  language,
  onAction 
}: { 
  enabledModules: EnabledModule[];
  language: string;
  onAction: (type: string) => void;
}) {
  const actions = useMemo(() => {
    const items = [];
    
    if (enabledModules.includes('finance')) {
      items.push({ id: 'expense', icon: '💸', label: language === 'ru' ? 'Расход' : 'Expense', color: '#F87171' });
      items.push({ id: 'income', icon: '💰', label: language === 'ru' ? 'Доход' : 'Income', color: '#4ADE80' });
    }
    if (enabledModules.includes('tasks')) {
      items.push({ id: 'task', icon: '✅', label: language === 'ru' ? 'Задача' : 'Task', color: '#60A5FA' });
    }
    if (enabledModules.includes('events')) {
      items.push({ id: 'event', icon: '📅', label: language === 'ru' ? 'Событие' : 'Event', color: '#A855F7' });
    }
    if (enabledModules.includes('habits')) {
      items.push({ id: 'habit', icon: '🔥', label: language === 'ru' ? 'Привычка' : 'Habit', color: '#F97316' });
    }
    if (enabledModules.includes('notes')) {
      items.push({ id: 'note', icon: '📝', label: language === 'ru' ? 'Заметка' : 'Note', color: '#FACC15' });
    }
    
    return items.slice(0, 4); // Max 4 quick actions
  }, [enabledModules, language]);
  
  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((action, index) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction(action.id)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
          style={{ background: 'var(--surface)' }}
        >
          <span className="text-xl">{action.icon}</span>
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// --- Tasks Today Widget ---
function TasksTodayWidget({ 
  tasks, 
  language,
  onViewAll,
  onToggle
}: { 
  tasks: Task[];
  language: string;
  onViewAll: () => void;
  onToggle: (id: string) => void;
}) {
  const todayTasks = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return tasks.filter(t => t.dueDate === today).slice(0, 3);
  }, [tasks]);
  
  const completedCount = todayTasks.filter(t => t.completed).length;
  
  if (todayTasks.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--info-subtle)' }}>
            <ClipboardDocumentListIcon className="w-4 h-4" style={{ color: 'var(--info)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {language === 'ru' ? 'Задачи на сегодня' : 'Today\'s Tasks'}
            </h3>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              {completedCount}/{todayTasks.length} {language === 'ru' ? 'выполнено' : 'completed'}
            </p>
          </div>
        </div>
        <button onClick={onViewAll} className="p-1">
          <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </div>
      
      <div className="space-y-2">
        {todayTasks.map(task => (
          <motion.div
            key={task.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggle(task.id)}
            className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer"
            style={{ background: task.completed ? 'var(--success-subtle)' : 'var(--surface-secondary)' }}
          >
            <div 
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{ 
                borderColor: task.completed ? 'var(--success)' : 'var(--border)',
                background: task.completed ? 'var(--success)' : 'transparent'
              }}
            >
              {task.completed && <CheckCircleIcon className="w-3 h-3 text-white" />}
            </div>
            <span 
              className={`text-sm flex-1 ${task.completed ? 'line-through' : ''}`}
              style={{ color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
            >
              {task.title}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// --- Habits Today Widget ---
function HabitsTodayWidget({ 
  habits,
  habitLogs,
  language,
  onViewAll,
  onLog
}: { 
  habits: Habit[];
  habitLogs: any[];
  language: string;
  onViewAll: () => void;
  onLog: (id: string) => void;
}) {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todayHabits = useMemo(() => {
    return habits.slice(0, 3).map(habit => {
      const todayLog = habitLogs.find(l => l.habitId === habit.id && l.date === today);
      return { ...habit, completedToday: !!todayLog?.completed };
    });
  }, [habits, habitLogs, today]);
  
  if (todayHabits.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249, 115, 22, 0.15)' }}>
            <FireIcon className="w-4 h-4" style={{ color: '#F97316' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {language === 'ru' ? 'Привычки' : 'Habits'}
          </h3>
        </div>
        <button onClick={onViewAll} className="p-1">
          <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </div>
      
      <div className="space-y-2">
        {todayHabits.map(habit => (
          <motion.div
            key={habit.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onLog(habit.id)}
            className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer"
            style={{ background: habit.completedToday ? 'var(--success-subtle)' : 'var(--surface-secondary)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{habit.icon}</span>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{habit.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                🔥 {habit.currentStreak}
              </span>
              {habit.completedToday && (
                <CheckCircleIcon className="w-5 h-5" style={{ color: 'var(--success)' }} />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// --- Goals Widget ---
function GoalsWidget({ 
  goals, 
  currency,
  language,
  onViewAll,
  onGoalPress
}: { 
  goals: SavingGoal[];
  currency: string;
  language: string;
  onViewAll: () => void;
  onGoalPress: (id: string) => void;
}) {
  const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount).slice(0, 2);
  
  if (activeGoals.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {language === 'ru' ? 'Цели накоплений' : 'Saving Goals'}
          </h3>
        </div>
        <button onClick={onViewAll} className="p-1">
          <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </div>
      
      <div className="space-y-3">
        {activeGoals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <motion.div
              key={goal.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onGoalPress(goal.id)}
              className="p-3 rounded-xl cursor-pointer"
              style={{ background: 'var(--surface-secondary)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{goal.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {goal.name}
                  </span>
                </div>
                <span className="text-xs font-semibold" style={{ color: goal.color }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full"
                  style={{ background: goal.color }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {formatCurrency(goal.currentAmount, currency, true)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {formatCurrency(goal.targetAmount, currency, true)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// --- Recent Transactions Widget ---
function RecentTransactionsWidget({ 
  transactions, 
  currency,
  language,
  onViewAll
}: { 
  transactions: Transaction[];
  currency: string;
  language: string;
  onViewAll: () => void;
}) {
  const recent = transactions.slice(0, 5);
  
  if (recent.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-subtle)' }}>
            <BanknotesIcon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {language === 'ru' ? 'Последние операции' : 'Recent Transactions'}
          </h3>
        </div>
        <button onClick={onViewAll} className="p-1">
          <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </div>
      
      <div className="space-y-2">
        {recent.map(tx => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-2 rounded-lg"
            style={{ background: 'var(--surface-secondary)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{tx.type === 'income' ? '📈' : '📉'}</span>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {tx.description || tx.category}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {tx.category}
                </p>
              </div>
            </div>
            <span 
              className="text-sm font-semibold"
              style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--error)' }}
            >
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency, true)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// --- Empty State ---
function EmptyState({ language, onAddFirst }: { language: string; onAddFirst: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 text-center"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--primary-subtle)' }}>
        <SparklesIcon className="w-8 h-8" style={{ color: 'var(--primary)' }} />
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {language === 'ru' ? 'Добро пожаловать!' : 'Welcome!'}
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        {language === 'ru' 
          ? 'Начните вести учёт, добавив первую транзакцию' 
          : 'Start tracking by adding your first transaction'
        }
      </p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onAddFirst}
        className="px-6 py-3 rounded-xl font-semibold"
        style={{
          background: 'linear-gradient(135deg, #C9A962 0%, #E8D5A3 50%, #C9A962 100%)',
          color: '#0A0A0A',
        }}
      >
        <span className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          {language === 'ru' ? 'Добавить транзакцию' : 'Add Transaction'}
        </span>
      </motion.button>
    </motion.div>
  );
}

// ============================================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ============================================================================

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const { user: telegramUser, hapticFeedback } = useTelegram();
  
  // Store data
  const profile = useStore((s) => s.profile);
  const isOnboarded = useStore((s) => s.isOnboarded);
  const transactions = useStore((s) => s.transactions);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const goals = useStore((s) => s.goals);
  const toggleTaskComplete = useStore((s) => s.toggleTaskComplete);
  const logHabit = useStore((s) => s.logHabit);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  
  // Derived data
  const language = profile?.settings?.language || 'ru';
  const currency = profile?.finance?.currency || 'UZS';
  const enabledModules = profile?.settings?.enabledModules || ['finance'];
  const balance = profile?.stats?.currentBalance || profile?.finance?.initialBalance || 0;
  const monthlyBudget = profile?.finance?.monthlyBudget || 0;
  const userName = telegramUser?.first_name || profile?.name || 'User';
  
  const dateLocale = language === 'ru' ? ru : enUS;
  const greeting = getGreeting(language);
  
  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthTransactions = transactions.filter(t => new Date(t.date) >= monthStart);
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses };
  }, [transactions]);
  
  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (mounted && !isOnboarded) {
      router.push('/onboarding');
    }
  }, [mounted, isOnboarded, router]);
  
  // Handlers
  const handleQuickAction = (type: string) => {
    hapticFeedback?.('medium');
    openBottomSheet(type === 'expense' || type === 'income' ? 'add-transaction' : `add-${type}` as any);
  };
  
  const handleToggleTask = (id: string) => {
    hapticFeedback?.('selection');
    toggleTaskComplete(id);
  };
  
  const handleLogHabit = (id: string) => {
    hapticFeedback?.('medium');
    logHabit(id, 1);
  };
  
  if (!mounted || !isOnboarded) return null;
  
  return (
    <div 
      className="min-h-screen pb-28 scrollbar-hide"
      style={{ background: 'var(--background)' }}
    >
      {/* Header */}
      <header className="px-4 pt-safe">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between py-4"
        >
          <div className="flex items-center gap-3">
            <motion.span 
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {greeting.emoji}
            </motion.span>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {greeting.text}, {userName}!
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {format(new Date(), 'EEEE, d MMMM', { locale: dateLocale })}
              </p>
            </div>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => hapticFeedback?.('light')}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--surface)' }}
          >
            <BellIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            {/* Notification dot */}
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: 'var(--error)' }} />
          </motion.button>
        </motion.div>
      </header>
      
      {/* Content */}
      <main className="px-4 space-y-4">
        {/* Balance Card - Always show if finance module enabled */}
        {enabledModules.includes('finance') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BalanceWidget
              balance={balance}
              currency={currency}
              spent={monthlyStats.expenses}
              budget={monthlyBudget}
              income={monthlyStats.income}
              language={language}
              onPress={() => {
                hapticFeedback?.('light');
                router.push('/finance');
              }}
            />
          </motion.div>
        )}
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuickActionsWidget
            enabledModules={enabledModules}
            language={language}
            onAction={handleQuickAction}
          />
        </motion.div>
        
        {/* Tasks Widget */}
        {enabledModules.includes('tasks') && tasks.length > 0 && (
          <TasksTodayWidget
            tasks={tasks}
            language={language}
            onViewAll={() => {
              hapticFeedback?.('light');
              router.push('/tasks');
            }}
            onToggle={handleToggleTask}
          />
        )}
        
        {/* Habits Widget */}
        {enabledModules.includes('habits') && habits.length > 0 && (
          <HabitsTodayWidget
            habits={habits}
            habitLogs={habitLogs}
            language={language}
            onViewAll={() => {
              hapticFeedback?.('light');
              router.push('/habits');
            }}
            onLog={handleLogHabit}
          />
        )}
        
        {/* Goals Widget */}
        {enabledModules.includes('finance') && goals.length > 0 && (
          <GoalsWidget
            goals={goals}
            currency={currency}
            language={language}
            onViewAll={() => {
              hapticFeedback?.('light');
              router.push('/goals');
            }}
            onGoalPress={(id) => {
              hapticFeedback?.('light');
              router.push(`/goals/${id}`);
            }}
          />
        )}
        
        {/* Recent Transactions */}
        {enabledModules.includes('finance') && transactions.length > 0 && (
          <RecentTransactionsWidget
            transactions={transactions}
            currency={currency}
            language={language}
            onViewAll={() => {
              hapticFeedback?.('light');
              router.push('/history');
            }}
          />
        )}
        
        {/* Empty State */}
        {transactions.length === 0 && tasks.length === 0 && habits.length === 0 && (
          <EmptyState
            language={language}
            onAddFirst={() => {
              hapticFeedback?.('medium');
              openBottomSheet('add-transaction');
            }}
          />
        )}
      </main>
    </div>
  );
}