// src/app/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format, isToday, parseISO, startOfMonth } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  PlusIcon, ChevronRightIcon, SparklesIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  FireIcon, CheckCircleIcon, CalendarDaysIcon,
  BanknotesIcon, ClipboardDocumentListIcon,
  FlagIcon, UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import { getCategoryConfig, getCategoryLabel } from '@/lib/categoryConfig';
import { syncTransactions, syncGoals } from '@/store/apiActions';
import type { EnabledModule, Transaction, Task, Habit, SavingGoal } from '@/types';

// ─── Приветствие ─────────────────────────────────────────────────────────────

function getGreeting(language: string) {
  const h = new Date().getHours();
  const t = { ru: { m: 'Доброе утро', d: 'Добрый день', e: 'Добрый вечер', n: 'Доброй ночи' }, en: { m: 'Good morning', d: 'Good afternoon', e: 'Good evening', n: 'Good night' } };
  const l = language === 'ru' ? 'ru' : 'en';
  if (h >= 5  && h < 12) return { text: t[l].m, emoji: '☀️' };
  if (h >= 12 && h < 17) return { text: t[l].d, emoji: '🌤️' };
  if (h >= 17 && h < 22) return { text: t[l].e, emoji: '🌅' };
  return { text: t[l].n, emoji: '🌙' };
}

// ─── Виджет: Баланс ───────────────────────────────────────────────────────────

function BalanceWidget({ balance, currency, spent, budget, income, language, onPress }: {
  balance: number; currency: string; spent: number; budget: number; income: number; language: string; onPress: () => void;
}) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const over = budget > 0 && spent > budget;

  return (
    <motion.div whileTap={{ scale: 0.98 }} onClick={onPress} className="rounded-2xl p-5 cursor-pointer relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(201,169,98,0.18) 0%, rgba(18,18,18,0.97) 60%)', border: '1px solid rgba(201,169,98,0.22)', boxShadow: '0 8px 32px rgba(201,169,98,0.1)' }}>
      {/* Декор */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full" style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(201,169,98,0.65)' }}>{language === 'ru' ? 'Текущий баланс' : 'Balance'}</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--primary)', letterSpacing: '-0.5px' }}>{formatCurrency(balance, currency)}</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(201,169,98,0.12)', border: '1px solid rgba(201,169,98,0.2)' }}>
          <SparklesIcon className="w-3 h-3" style={{ color: 'var(--primary)' }} />
          <span className="text-[9px] font-semibold tracking-wide" style={{ color: 'var(--primary)' }}>PREMIUM</span>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--success-subtle)' }}>
            <ArrowTrendingUpIcon className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Доход' : 'Income'}</p>
            <p className="text-xs font-bold" style={{ color: 'var(--success)' }}>+{formatCurrency(income, currency, true)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--error-subtle)' }}>
            <ArrowTrendingDownIcon className="w-3.5 h-3.5" style={{ color: 'var(--error)' }} />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Расход' : 'Expenses'}</p>
            <p className="text-xs font-bold" style={{ color: 'var(--error)' }}>-{formatCurrency(spent, currency, true)}</p>
          </div>
        </div>
      </div>

      {budget > 0 && (
        <div>
          <div className="flex justify-between text-[10px] mb-1.5">
            <span style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Бюджет месяца' : 'Monthly budget'}</span>
            <span style={{ color: over ? 'var(--error)' : 'var(--text-tertiary)' }}>
              {over ? `⚠️ ${language === 'ru' ? 'Превышен' : 'Over'}` : `${Math.round(pct)}%`}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ background: over ? 'var(--error)' : 'linear-gradient(90deg, var(--primary), #D4B86A)' }} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Виджет: Быстрые действия ─────────────────────────────────────────────────

function QuickActionsWidget({ enabledModules, language, onAction }: {
  enabledModules: EnabledModule[]; language: string; onAction: (type: string) => void;
}) {
  const actions = useMemo(() => {
    const items: { id: string; icon: string; label: string; color: string; bg: string }[] = [];
    if (enabledModules.includes('finance')) {
      items.push({ id: 'expense', icon: '💸', label: language === 'ru' ? 'Расход' : 'Expense', color: '#F87171', bg: 'rgba(248,113,113,0.12)' });
      items.push({ id: 'income',  icon: '💰', label: language === 'ru' ? 'Доход'  : 'Income',  color: '#4ADE80', bg: 'rgba(74,222,128,0.12)' });
    }
    if (enabledModules.includes('tasks'))  items.push({ id: 'task',  icon: '✅', label: language === 'ru' ? 'Задача'   : 'Task',  color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' });
    if (enabledModules.includes('habits')) items.push({ id: 'habit', icon: '🔥', label: language === 'ru' ? 'Привычка' : 'Habit', color: '#F97316', bg: 'rgba(249,115,22,0.12)' });
    if (enabledModules.includes('notes'))  items.push({ id: 'note',  icon: '📝', label: language === 'ru' ? 'Заметка'  : 'Note',  color: '#FACC15', bg: 'rgba(250,204,21,0.12)' });
    if (enabledModules.includes('events')) items.push({ id: 'event', icon: '📅', label: language === 'ru' ? 'Событие'  : 'Event', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' });
    return items.slice(0, 4);
  }, [enabledModules, language]);

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((a, i) => (
        <motion.button key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          whileTap={{ scale: 0.93 }} onClick={() => onAction(a.id)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
          style={{ background: a.bg, border: `1px solid ${a.color}28` }}>
          <span className="text-xl">{a.icon}</span>
          <span className="text-[10px] font-medium" style={{ color: a.color }}>{a.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Виджет: Задачи ───────────────────────────────────────────────────────────

function TasksWidget({ tasks, language, onViewAll, onToggle }: {
  tasks: Task[]; language: string; onViewAll: () => void; onToggle: (id: string) => void;
}) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter(t => t.dueDate === today).slice(0, 4);
  const done = todayTasks.filter(t => t.completed).length;

  if (todayTasks.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.25)' }}>
            <ClipboardDocumentListIcon className="w-4 h-4" style={{ color: '#60A5FA' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Задачи сегодня' : "Today's Tasks"}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{done}/{todayTasks.length} {language === 'ru' ? 'выполнено' : 'done'}</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onViewAll}>
          <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
        </motion.button>
      </div>
      <div className="space-y-2">
        {todayTasks.map(task => (
          <motion.div key={task.id} whileTap={{ scale: 0.98 }} onClick={() => onToggle(task.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
            style={{ background: task.completed ? 'var(--success-subtle)' : 'var(--surface-secondary)' }}>
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{ borderColor: task.completed ? 'var(--success)' : 'var(--border)', background: task.completed ? 'var(--success)' : 'transparent' }}>
              {task.completed && <CheckCircleIcon className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-sm flex-1 ${task.completed ? 'line-through' : ''}`}
              style={{ color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
              {task.title}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Виджет: Привычки ─────────────────────────────────────────────────────────

function HabitsWidget({ habits, habitLogs, language, onViewAll, onLog }: {
  habits: Habit[]; habitLogs: any[]; language: string; onViewAll: () => void; onLog: (id: string) => void;
}) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayHabits = useMemo(() =>
    habits.slice(0, 3).map(h => ({ ...h, done: !!habitLogs.find(l => l.habitId === h.id && l.date === today)?.completed })),
    [habits, habitLogs, today]
  );
  const doneCount = todayHabits.filter(h => h.done).length;

  if (todayHabits.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}>
            <FireIcon className="w-4 h-4" style={{ color: '#F97316' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Привычки' : 'Habits'}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{doneCount}/{todayHabits.length} {language === 'ru' ? 'сегодня' : 'today'}</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onViewAll}>
          <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
        </motion.button>
      </div>
      <div className="space-y-2">
        {todayHabits.map(h => (
          <motion.div key={h.id} whileTap={{ scale: 0.98 }} onClick={() => onLog(h.id)}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer"
            style={{ background: h.done ? 'var(--success-subtle)' : 'var(--surface-secondary)', border: `1px solid ${h.done ? 'rgba(74,222,128,0.2)' : 'transparent'}` }}>
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{h.icon}</span>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{h.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>🔥 {h.currentStreak}</span>
              {h.done && <CheckCircleIcon className="w-4 h-4" style={{ color: 'var(--success)' }} />}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Виджет: Цели ─────────────────────────────────────────────────────────────

function GoalsWidget({ goals, currency, language, onViewAll }: {
  goals: SavingGoal[]; currency: string; language: string; onViewAll: () => void;
}) {
  const active = goals.filter(g => g.currentAmount < g.targetAmount).slice(0, 2);
  if (active.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}>
            <FlagIcon className="w-4 h-4" style={{ color: '#F97316' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Цели накоплений' : 'Saving Goals'}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{goals.length} {language === 'ru' ? 'целей' : 'goals'}</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onViewAll}>
          <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
        </motion.button>
      </div>
      <div className="space-y-3">
        {active.map(goal => {
          const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
          return (
            <motion.div key={goal.id} whileTap={{ scale: 0.98 }}
              className="p-3 rounded-xl cursor-pointer" onClick={onViewAll}
              style={{ background: 'var(--surface-secondary)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{goal.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{goal.name}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: goal.color }}>{Math.round(pct)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                  className="h-full rounded-full" style={{ background: goal.color }} />
              </div>
              <div className="flex justify-between text-[10px]">
                <span style={{ color: 'var(--text-tertiary)' }}>{formatCurrency(goal.currentAmount, currency, true)}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>{formatCurrency(goal.targetAmount, currency, true)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Виджет: Последние транзакции ─────────────────────────────────────────────

function RecentTransactionsWidget({ transactions, currency, language, onViewAll }: {
  transactions: Transaction[]; currency: string; language: string; onViewAll: () => void;
}) {
  // Сортируем по дате и берём 5 последних
  const recent = useMemo(() =>
    [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
    [transactions]
  );

  if (recent.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-subtle)', border: '1px solid rgba(201,169,98,0.2)' }}>
            <BanknotesIcon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Последние операции' : 'Recent'}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{transactions.length} {language === 'ru' ? 'транзакций' : 'transactions'}</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--primary)' }}>
          {language === 'ru' ? 'Все' : 'All'} <ChevronRightIcon className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="space-y-2">
        {recent.map((tx, i) => {
          const cfg = getCategoryConfig(tx.category);
          return (
            <motion.div key={tx.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between px-2.5 py-2 rounded-xl"
              style={{ background: 'var(--surface-secondary)' }}>
              <div className="flex items-center gap-2.5">
                {/* Категорийная иконка */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}25` }}>
                  {cfg.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)', maxWidth: 130 }}>
                    {tx.description || getCategoryLabel(tx.category, language as 'ru' | 'en')}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    {getCategoryLabel(tx.category, language as 'ru' | 'en')}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold shrink-0 ml-2" style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--error)' }}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency, true)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ language, onAddFirst }: { language: string; onAddFirst: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-8 text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl"
        style={{ background: 'var(--primary-subtle)', boxShadow: '0 8px 24px var(--primary-glow)' }}>
        ✨
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        {language === 'ru' ? 'Добро пожаловать!' : 'Welcome!'}
      </h3>
      <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
        {language === 'ru' ? 'Начните вести учёт, добавив первую транзакцию' : 'Start by adding your first transaction'}
      </p>
      <motion.button whileTap={{ scale: 0.95 }} onClick={onAddFirst}
        className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #D4B86A 100%)', color: '#0A0A0A' }}>
        <PlusIcon className="w-5 h-5" />
        {language === 'ru' ? 'Добавить транзакцию' : 'Add Transaction'}
      </motion.button>
    </motion.div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user: telegramUser, hapticFeedback } = useTelegram();

  const profile         = useStore(s => s.profile);
  const isOnboarded     = useStore(s => s.isOnboarded);
  const transactions    = useStore(s => s.transactions);
  const tasks           = useStore(s => s.tasks);
  const habits          = useStore(s => s.habits);
  const habitLogs       = useStore(s => s.habitLogs);
  const goals           = useStore(s => s.goals);
  const toggleTask      = useStore(s => s.toggleTaskComplete);
  const logHabit        = useStore(s => s.logHabit);
  const openBottomSheet = useStore(s => s.openBottomSheet);

  const language      = profile?.settings?.language || 'ru';
  const currency      = profile?.finance?.currency || 'UZS';
  const enabledModules = profile?.settings?.enabledModules || ['finance'];
  const balance       = profile?.stats?.currentBalance || profile?.finance?.initialBalance || 0;
  const monthlyBudget = profile?.finance?.monthlyBudget || 0;
  const userName      = telegramUser?.first_name || profile?.name || '';
  const dateLocale    = language === 'ru' ? ru : enUS;
  const greeting      = getGreeting(language);

  // Месячная статистика из транзакций стора
  const monthlyStats = useMemo(() => {
    const start = startOfMonth(new Date());
    const monthTx = transactions.filter(t => { try { return parseISO(t.date) >= start; } catch { return false; }});
    return {
      income:   monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  }, [transactions]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isOnboarded) router.push('/onboarding');
  }, [mounted, isOnboarded, router]);

  // Синхронизация при загрузке главной
  useEffect(() => {
    if (!mounted || !isOnboarded) return;
    if (enabledModules.includes('finance')) {
      // Синхронизируем и транзакции и цели
      syncTransactions({ limit: 50 }).catch(() => {});
      syncGoals().catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isOnboarded]);

  if (!mounted || !isOnboarded) return null;

  const handleQuickAction = (type: string) => {
    hapticFeedback?.('medium');
    openBottomSheet(
      type === 'expense' || type === 'income' ? 'add-transaction' : (`add-${type}` as any)
    );
  };

  const hasContent = transactions.length > 0 || tasks.length > 0 || habits.length > 0 || goals.length > 0;

  return (
    <div>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-[45%]" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,169,98,0.12) 0%, transparent 60%)' }} />
        <div className="absolute top-1/4 left-0 w-1/3 h-1/3" style={{ background: 'radial-gradient(ellipse at left, rgba(74,222,128,0.06) 0%, transparent 50%)' }} />
        <div className="absolute top-1/2 right-0 w-1/3 h-1/3" style={{ background: 'radial-gradient(ellipse at right, rgba(96,165,250,0.06) 0%, transparent 50%)' }} />
        <div className="absolute top-24 right-8 w-1.5 h-1.5 rounded-full bg-amber-400 opacity-25 animate-float" />
        <div className="absolute top-40 left-10 w-1 h-1 rounded-full bg-green-400 opacity-20 animate-float" style={{ animationDelay: '0.7s' }} />
      </div>

      <div className="page-scrollable">
        {/* Header */}
        <header className="px-4 mb-4">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar / emoji по времени */}
              <motion.div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'linear-gradient(135deg, var(--primary-subtle) 0%, rgba(201,169,98,0.25) 100%)', boxShadow: '0 4px 16px rgba(201,169,98,0.15)' }}
                animate={{ rotate: [0, 4, -4, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}>
                {greeting.emoji}
              </motion.div>
              <div>
                <h1 className="text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {greeting.text}{userName ? `, ${userName}` : ''}!
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {format(new Date(), 'EEEE, d MMMM', { locale: dateLocale })}
                </p>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => { hapticFeedback?.('light'); router.push('/profile'); }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
              <UserCircleIcon className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
            </motion.button>
          </motion.div>
        </header>

        <main className="px-4 space-y-4 pb-8">
          {/* Баланс */}
          {enabledModules.includes('finance') && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <BalanceWidget
                balance={balance} currency={currency}
                spent={monthlyStats.expenses} budget={monthlyBudget} income={monthlyStats.income}
                language={language}
                onPress={() => { hapticFeedback?.('light'); router.push('/finance'); }}
              />
            </motion.div>
          )}

          {/* Быстрые действия */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <QuickActionsWidget enabledModules={enabledModules} language={language} onAction={handleQuickAction} />
          </motion.div>

          {/* Задачи */}
          {enabledModules.includes('tasks') && (
            <TasksWidget tasks={tasks} language={language}
              onViewAll={() => { hapticFeedback?.('light'); router.push('/tasks'); }}
              onToggle={id => { hapticFeedback?.('selection'); toggleTask(id); }}
            />
          )}

          {/* Привычки */}
          {enabledModules.includes('habits') && (
            <HabitsWidget habits={habits} habitLogs={habitLogs} language={language}
              onViewAll={() => { hapticFeedback?.('light'); router.push('/habits'); }}
              onLog={id => { hapticFeedback?.('medium'); logHabit(id, 1); }}
            />
          )}

          {/* Цели */}
          {enabledModules.includes('finance') && (
            <GoalsWidget goals={goals} currency={currency} language={language}
              onViewAll={() => { hapticFeedback?.('light'); router.push('/goals'); }}
            />
          )}

          {/* Последние транзакции */}
          {enabledModules.includes('finance') && (
            <RecentTransactionsWidget transactions={transactions} currency={currency} language={language}
              onViewAll={() => { hapticFeedback?.('light'); router.push('/history'); }}
            />
          )}

          {/* Empty state */}
          {!hasContent && (
            <EmptyState language={language}
              onAddFirst={() => { hapticFeedback?.('medium'); openBottomSheet('add-transaction'); }}
            />
          )}
        </main>
      </div>
    </div>
  );
}