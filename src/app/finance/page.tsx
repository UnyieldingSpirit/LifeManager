// src/app/finance/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  format, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isWithinInterval, parseISO,
} from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChartBarIcon,
  ClockIcon, ChevronRightIcon, FunnelIcon, CalendarDaysIcon,
  BanknotesIcon, XMarkIcon, FlagIcon, PencilSquareIcon,
  CheckIcon, TrashIcon,
} from '@heroicons/react/24/outline';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import {
  getCategoryConfig, getCategoryLabel, getCategoryIcon,
  EXPENSE_CATEGORIES, INCOME_CATEGORIES,
} from '@/lib/categoryConfig';
import { syncTransactions, deleteTransactionApi } from '@/store/apiActions';
import { transactionService } from '@/services';
import type { TransactionDto } from '@/services/types';

// ─── Типы ────────────────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'year' | 'custom';
type FilterType = 'all' | 'income' | 'expense';

// ─── Хелперы ─────────────────────────────────────────────────────────────────

const periodLabels = (lang: string) => ({
  week:   lang === 'ru' ? 'Неделя' : 'Week',
  month:  lang === 'ru' ? 'Месяц'  : 'Month',
  year:   lang === 'ru' ? 'Год'    : 'Year',
  custom: lang === 'ru' ? 'Период' : 'Custom',
});

// ─── Компонент редактирования транзакции ─────────────────────────────────────

interface EditSheetProps {
  tx: TransactionDto;
  currency: string;
  language: string;
  onClose: () => void;
  onSaved: () => void;
}

function EditTransactionSheet({ tx, currency, language, onClose, onSaved }: EditSheetProps) {
  const [amount, setAmount]       = useState(String(tx.amount));
  const [category, setCategory]   = useState(tx.category);
  const [description, setDesc]    = useState(tx.description || '');
  const [date, setDate]           = useState(tx.date);
  const [saving, setSaving]       = useState(false);
  const addToast = useStore(s => s.addToast);

  const categories = tx.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSave = async () => {
    const num = parseFloat(amount.replace(/\s/g, '').replace(',', '.'));
    if (!num || num <= 0) return;
    setSaving(true);
    try {
      await transactionService.update(tx.id, {
        amount: num, category, description, date,
      });
      await syncTransactions({ limit: 200 });
      addToast({ type: 'success', message: language === 'ru' ? 'Сохранено' : 'Saved' });
      onSaved();
    } catch {
      addToast({ type: 'error', message: language === 'ru' ? 'Ошибка сохранения' : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-5"
        style={{ background: '#111', border: '1px solid var(--glass-border)', maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {language === 'ru' ? 'Редактировать' : 'Edit Transaction'}
          </h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
            <XMarkIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          </motion.button>
        </div>

        {/* Amount */}
        <div className="mb-3">
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            {language === 'ru' ? 'Сумма' : 'Amount'}
          </label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full h-12 rounded-xl px-4 text-lg font-semibold outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-focus)', color: 'var(--text-primary)', fontSize: 16 }}
            autoFocus />
        </div>

        {/* Category */}
        <div className="mb-3">
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            {language === 'ru' ? 'Категория' : 'Category'}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(cat => (
              <motion.button key={cat.id} whileTap={{ scale: 0.9 }}
                onClick={() => setCategory(cat.id)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl"
                style={{
                  background: category === cat.id ? `${cat.color}25` : 'var(--surface)',
                  border: `1px solid ${category === cat.id ? cat.color : 'var(--border)'}`,
                }}>
                <span className="text-lg">{cat.icon}</span>
                <span className="text-[9px] font-medium leading-tight text-center" style={{ color: category === cat.id ? cat.color : 'var(--text-tertiary)' }}>
                  {cat.label[language as 'ru' | 'en'] ?? cat.label.ru}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            {language === 'ru' ? 'Описание' : 'Description'}
          </label>
          <input type="text" value={description} onChange={e => setDesc(e.target.value)}
            placeholder={language === 'ru' ? 'Необязательно' : 'Optional'}
            className="w-full h-11 rounded-xl px-4 text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 16 }} />
        </div>

        {/* Date */}
        <div className="mb-5">
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            {language === 'ru' ? 'Дата' : 'Date'}
          </label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full h-11 rounded-xl px-4 text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark', fontSize: 16 }} />
        </div>

        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
            className="flex-1 h-12 rounded-xl font-medium text-sm"
            style={{ background: 'var(--surface-dim)', color: 'var(--text-secondary)' }}>
            {language === 'ru' ? 'Отмена' : 'Cancel'}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave}
            disabled={saving || !amount}
            className="flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #D4B86A 100%)', color: '#0A0A0A', opacity: saving ? 0.7 : 1 }}>
            {saving ? (
              <motion.div className="w-4 h-4 rounded-full border-2 border-[#0A0A0A] border-t-transparent"
                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
            ) : (
              <><CheckIcon className="w-4 h-4" />{language === 'ru' ? 'Сохранить' : 'Save'}</>
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function FinancePage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();

  const profile      = useStore(s => s.profile);
  const transactions = useStore(s => s.transactions);
  const addToast     = useStore(s => s.addToast);

  const language   = profile?.settings?.language || 'ru';
  const currency   = profile?.finance?.currency || 'UZS';
  const dateLocale = language === 'ru' ? ru : enUS;
  const balance    = profile?.stats?.currentBalance || 0;
  const monthlyBudget = profile?.finance?.monthlyBudget || 0;

  const [period, setPeriod]             = useState<Period>('month');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateStart, setCustomStart]   = useState('');
  const [customDateEnd, setCustomEnd]       = useState('');
  const [filterType, setFilterType]     = useState<FilterType>('all');
  const [editingTx, setEditingTx]       = useState<TransactionDto | null>(null);
  const [isLoading, setIsLoading]       = useState(true);

  // ─── Загрузка при монтировании ──────────────────────────────────────────
  useEffect(() => {
    const now = new Date();
    syncTransactions({
      startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
      endDate:   format(endOfMonth(now), 'yyyy-MM-dd'),
      limit:     200,
    })
      .catch(e => console.warn('[Finance]', e?.message))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Диапазон дат ────────────────────────────────────────────────────────
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'week':   return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month':  return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':   return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31) };
      case 'custom': return customDateStart && customDateEnd
        ? { start: parseISO(customDateStart), end: parseISO(customDateEnd) }
        : { start: startOfMonth(now), end: endOfMonth(now) };
      default:       return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [period, customDateStart, customDateEnd]);

  // ─── Статистика ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const filtered = transactions.filter(t => {
      try {
        const d = parseISO(t.date);
        return isWithinInterval(d, dateRange) && (filterType === 'all' || t.type === filterType);
      } catch { return false; }
    });

    const income   = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const catMap = new Map<string, number>();
    filtered.filter(t => t.type === 'expense').forEach(t => {
      catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
    });
    const categories = Array.from(catMap.entries())
      .map(([id, amount]) => ({ id, amount, pct: expenses > 0 ? (amount / expenses) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount).slice(0, 5);

    const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { income, expenses, net: income - expenses, categories, recent: sorted.slice(0, 8), all: sorted };
  }, [transactions, dateRange, filterType]);

  // Прогресс бюджета
  const budgetProgress = monthlyBudget > 0
    ? Math.min(100, (stats.expenses / monthlyBudget) * 100)
    : 0;
  const budgetOver = monthlyBudget > 0 && stats.expenses > monthlyBudget;

  const handleDelete = async (id: string) => {
    hapticFeedback?.('notification', 'warning');
    try {
      await deleteTransactionApi(id);
      addToast({ type: 'info', message: language === 'ru' ? 'Удалено' : 'Deleted' });
    } catch {
      addToast({ type: 'error', message: language === 'ru' ? 'Ошибка удаления' : 'Delete failed' });
    }
  };

  const labs = periodLabels(language);

  return (
    <div>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[80%] h-[50%]" style={{ background: 'radial-gradient(ellipse 60% 50% at 100% 0%, rgba(201,169,98,0.12) 0%, transparent 60%)' }} />
        <div className="absolute bottom-20 left-0 w-1/2 h-1/3" style={{ background: 'radial-gradient(ellipse at bottom left, rgba(74,222,128,0.08) 0%, transparent 50%)' }} />
        <div className="absolute bottom-20 right-0 w-1/2 h-1/3" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(248,113,113,0.08) 0%, transparent 50%)' }} />
      </div>

      {/* Edit Transaction Sheet */}
      <AnimatePresence>
        {editingTx && (
          <EditTransactionSheet
            tx={editingTx as TransactionDto}
            currency={currency}
            language={language}
            onClose={() => setEditingTx(null)}
            onSaved={() => setEditingTx(null)}
          />
        )}
      </AnimatePresence>

      {/* Date Picker Modal */}
      <AnimatePresence>
        {showDatePicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowDatePicker(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm p-5 rounded-2xl"
              style={{ background: 'var(--glass-bg-heavy)', border: '1px solid var(--glass-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'Выберите период' : 'Select Period'}
                </h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowDatePicker(false)}>
                  <XMarkIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                </motion.button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'От' : 'From'}</label>
                  <input type="date" value={customDateStart} onChange={e => setCustomStart(e.target.value)}
                    className="w-full h-11 rounded-xl px-4 text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark', fontSize: 16 }} />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'До' : 'To'}</label>
                  <input type="date" value={customDateEnd} onChange={e => setCustomEnd(e.target.value)}
                    className="w-full h-11 rounded-xl px-4 text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark', fontSize: 16 }} />
                </div>
                <motion.button whileTap={{ scale: 0.98 }}
                  onClick={() => { if (customDateStart && customDateEnd) { setPeriod('custom'); setShowDatePicker(false); }}}
                  disabled={!customDateStart || !customDateEnd}
                  className="w-full h-11 rounded-xl font-semibold text-sm"
                  style={{
                    background: customDateStart && customDateEnd ? 'linear-gradient(135deg, var(--primary) 0%, #D4B86A 100%)' : 'var(--surface-dim)',
                    color: customDateStart && customDateEnd ? '#0A0A0A' : 'var(--text-tertiary)',
                  }}>
                  {language === 'ru' ? 'Применить' : 'Apply'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {format(new Date(), 'MMMM yyyy', { locale: dateLocale })}
              </p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { hapticFeedback?.('light'); router.push('/history'); }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
              <ClockIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </motion.button>
          </div>
        </header>

        <main className="px-4 pb-8 space-y-4">
          {/* Balance Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(201,169,98,0.18) 0%, rgba(22,22,22,0.97) 60%)',
              border: '1px solid rgba(201,169,98,0.25)',
              boxShadow: '0 8px 32px rgba(201,169,98,0.12)',
            }}>
            {/* Декор */}
            <div className="absolute top-0 right-0 w-28 h-28 opacity-5" style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-20 h-20 opacity-5" style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />

            <div className="relative z-10">
              <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(201,169,98,0.7)' }}>
                {language === 'ru' ? 'Текущий баланс' : 'Current Balance'}
              </p>
              <p className="text-3xl font-bold mb-4" style={{ color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                {formatCurrency(balance, currency)}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ArrowTrendingUpIcon className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Доход' : 'Income'}</span>
                  </div>
                  <p className="text-base font-bold" style={{ color: 'var(--success)' }}>+{formatCurrency(stats.income, currency, true)}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ArrowTrendingDownIcon className="w-3.5 h-3.5" style={{ color: 'var(--error)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Расход' : 'Expenses'}</span>
                  </div>
                  <p className="text-base font-bold" style={{ color: 'var(--error)' }}>-{formatCurrency(stats.expenses, currency, true)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Budget progress */}
          {monthlyBudget > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4"
              style={{
                background: budgetOver
                  ? 'linear-gradient(135deg, rgba(248,113,113,0.12) 0%, var(--glass-bg) 100%)'
                  : 'linear-gradient(135deg, rgba(201,169,98,0.1) 0%, var(--glass-bg) 100%)',
                border: `1px solid ${budgetOver ? 'rgba(248,113,113,0.3)' : 'rgba(201,169,98,0.2)'}`,
              }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'ru' ? 'Бюджет месяца' : 'Monthly Budget'}
                </span>
                <span className="text-xs font-bold" style={{ color: budgetOver ? 'var(--error)' : 'var(--primary)' }}>
                  {Math.round(budgetProgress)}%
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${budgetProgress}%` }} transition={{ duration: 0.7 }}
                  className="h-full rounded-full"
                  style={{ background: budgetOver ? 'var(--error)' : 'linear-gradient(90deg, var(--primary), #D4B86A)' }} />
              </div>
              <div className="flex justify-between text-[10px]">
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {language === 'ru' ? 'Потрачено' : 'Spent'}: <span style={{ color: budgetOver ? 'var(--error)' : 'var(--text-secondary)' }}>{formatCurrency(stats.expenses, currency, true)}</span>
                </span>
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {language === 'ru' ? 'Лимит' : 'Limit'}: {formatCurrency(monthlyBudget, currency, true)}
                </span>
              </div>
              {budgetOver && (
                <p className="text-[10px] mt-1.5 font-medium" style={{ color: 'var(--error)' }}>
                  {language === 'ru' ? `⚠️ Превышен на ${formatCurrency(stats.expenses - monthlyBudget, currency, true)}` : `⚠️ Over by ${formatCurrency(stats.expenses - monthlyBudget, currency, true)}`}
                </p>
              )}
            </motion.div>
          )}

          {/* Period selector */}
          <div className="flex gap-2">
            <div className="flex-1 flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-dim)' }}>
              {(['week', 'month', 'year'] as Period[]).map(p => (
                <motion.button key={p} whileTap={{ scale: 0.95 }}
                  onClick={() => { hapticFeedback?.('selection'); setPeriod(p); }}
                  className="flex-1 py-2 rounded-lg text-xs font-medium"
                  style={{
                    background: period === p ? 'var(--primary)' : 'transparent',
                    color: period === p ? '#0A0A0A' : 'var(--text-secondary)',
                  }}>
                  {labs[p]}
                </motion.button>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { hapticFeedback?.('light'); setShowDatePicker(true); }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: period === 'custom' ? 'var(--primary)' : 'var(--surface)', border: '1px solid var(--glass-border)' }}>
              <CalendarDaysIcon className="w-5 h-5" style={{ color: period === 'custom' ? '#0A0A0A' : 'var(--text-secondary)' }} />
            </motion.button>
          </div>

          {/* Type filter chips */}
          <div className="flex gap-2">
            {[
              { id: 'all',     label: language === 'ru' ? 'Все' : 'All',          icon: ChartBarIcon,       color: 'var(--primary)' },
              { id: 'income',  label: language === 'ru' ? 'Доходы' : 'Income',     icon: ArrowTrendingUpIcon, color: '#22C55E' },
              { id: 'expense', label: language === 'ru' ? 'Расходы' : 'Expenses',  icon: ArrowTrendingDownIcon, color: '#F87171' },
            ].map(f => (
              <motion.button key={f.id} whileTap={{ scale: 0.95 }}
                onClick={() => { hapticFeedback?.('selection'); setFilterType(f.id as FilterType); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl"
                style={{
                  background: filterType === f.id ? `${f.color}20` : 'var(--surface)',
                  border: `1px solid ${filterType === f.id ? f.color : 'var(--border)'}`,
                  color: filterType === f.id ? f.color : 'var(--text-secondary)',
                }}>
                <f.icon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{f.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Period balance */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 flex items-center justify-between"
            style={{
              background: stats.net >= 0 ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
              border: `1px solid ${stats.net >= 0 ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
            }}>
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Итог за период' : 'Period Net'}</p>
              <p className="text-xl font-bold" style={{ color: stats.net >= 0 ? 'var(--success)' : 'var(--error)' }}>
                {stats.net >= 0 ? '+' : ''}{formatCurrency(stats.net, currency, true)}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: stats.net >= 0 ? 'var(--success-subtle)' : 'var(--error-subtle)' }}>
              {stats.net >= 0
                ? <ArrowTrendingUpIcon className="w-5 h-5" style={{ color: 'var(--success)' }} />
                : <ArrowTrendingDownIcon className="w-5 h-5" style={{ color: 'var(--error)' }} />}
            </div>
          </motion.div>

          {/* Category breakdown */}
          {stats.categories.length > 0 && filterType !== 'income' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'По категориям' : 'By Category'}</h3>
                <FunnelIcon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <div className="space-y-3">
                {stats.categories.map((cat, i) => {
                  const cfg = getCategoryConfig(cat.id);
                  return (
                    <motion.div key={cat.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cfg.icon}</span>
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{getCategoryLabel(cat.id, language as 'ru' | 'en')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{Math.round(cat.pct)}%</span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(cat.amount, currency, true)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${cat.pct}%` }}
                          transition={{ delay: 0.2 + i * 0.04, duration: 0.5 }}
                          className="h-full rounded-full" style={{ background: cfg.color }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Recent transactions */}
          {stats.recent.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Последние операции' : 'Recent'}</h3>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => router.push('/history')}
                  className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                  {language === 'ru' ? 'Все →' : 'All →'}
                </motion.button>
              </div>
              <div className="space-y-2">
                {stats.recent.map((tx, i) => {
                  const cfg = getCategoryConfig(tx.category);
                  return (
                    <motion.div key={tx.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-2.5 rounded-xl group"
                      style={{ background: 'var(--surface-secondary)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}>
                          {cfg.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)', maxWidth: 140 }}>
                            {tx.description || getCategoryLabel(tx.category, language as 'ru' | 'en')}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                            {format(parseISO(tx.date), 'd MMM', { locale: dateLocale })} · {getCategoryLabel(tx.category, language as 'ru' | 'en')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-sm font-semibold" style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--error)' }}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency, true)}
                        </span>
                        {/* Edit */}
                        <motion.button whileTap={{ scale: 0.85 }}
                          onClick={() => { hapticFeedback?.('light'); setEditingTx(tx as any); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'var(--primary-subtle)' }}>
                          <PencilSquareIcon className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                        </motion.button>
                        {/* Delete */}
                        <motion.button whileTap={{ scale: 0.85 }}
                          onClick={() => handleDelete(tx.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'var(--error-subtle)' }}>
                          <TrashIcon className="w-3.5 h-3.5" style={{ color: 'var(--error)' }} />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Quick links */}
          <div className="space-y-2">
            {[
              { label: language === 'ru' ? 'История транзакций' : 'Transaction History', route: '/history', icon: ClockIcon,  color: '#60A5FA' },
              { label: language === 'ru' ? 'Цели накоплений'    : 'Saving Goals',        route: '/goals',   icon: FlagIcon,   color: '#F97316' },
            ].map((item, i) => (
              <motion.button key={item.route} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { hapticFeedback?.('light'); router.push(item.route); }}
                className="w-full flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}18` }}>
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                </div>
                <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
              </motion.button>
            ))}
          </div>

          {/* Empty state */}
          {transactions.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-xl text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl"
                style={{ background: 'var(--primary-subtle)', boxShadow: '0 8px 24px var(--primary-glow)' }}>
                💸
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {language === 'ru' ? 'Нет транзакций' : 'No Transactions'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' ? 'Нажмите + чтобы добавить первую операцию' : 'Tap + to add your first transaction'}
              </p>
            </motion.div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--surface-secondary)' }} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}