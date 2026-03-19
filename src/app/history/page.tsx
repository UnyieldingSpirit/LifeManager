// src/app/history/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  format, parseISO, startOfDay, endOfDay,
  isWithinInterval, startOfMonth, endOfMonth, subMonths,
} from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, FunnelIcon,
  CalendarDaysIcon, MagnifyingGlassIcon, XMarkIcon,
  TrashIcon, ClockIcon, PencilSquareIcon, CheckIcon,
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

// ─── Редактирование ────────────────────────────────────────────────────────

interface EditSheetProps {
  tx: TransactionDto;
  currency: string;
  language: string;
  onClose: () => void;
  onSaved: () => void;
}

function EditTransactionSheet({ tx, currency, language, onClose, onSaved }: EditSheetProps) {
  const [amount, setAmount]     = useState(String(tx.amount));
  const [category, setCategory] = useState(tx.category);
  const [description, setDesc]  = useState(tx.description || '');
  const [date, setDate]         = useState(tx.date);
  const [saving, setSaving]     = useState(false);
  const addToast = useStore(s => s.addToast);

  const cats = tx.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSave = async () => {
    const num = parseFloat(amount.replace(/\s/g, '').replace(',', '.'));
    if (!num || num <= 0) return;
    setSaving(true);
    try {
      await transactionService.update(tx.id, { amount: num, category, description, date });
      await syncTransactions({ limit: 200 });
      addToast({ type: 'success', message: language === 'ru' ? 'Сохранено' : 'Saved' });
      onSaved();
    } catch {
      addToast({ type: 'error', message: language === 'ru' ? 'Ошибка' : 'Error' });
    } finally { setSaving(false); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-5"
        style={{ background: '#111', border: '1px solid var(--glass-border)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {language === 'ru' ? 'Редактировать' : 'Edit'}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {tx.type === 'expense' ? (language === 'ru' ? 'Расход' : 'Expense') : (language === 'ru' ? 'Доход' : 'Income')}
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
            <XMarkIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          </motion.button>
        </div>

        {/* Amount */}
        <div className="mb-3">
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Сумма' : 'Amount'}</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} autoFocus
            className="w-full h-12 rounded-xl px-4 text-lg font-bold outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-focus)', color: 'var(--text-primary)', fontSize: 16 }} />
        </div>

        {/* Category */}
        <div className="mb-3">
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Категория' : 'Category'}</label>
          <div className="grid grid-cols-4 gap-2">
            {cats.map(cat => (
              <motion.button key={cat.id} whileTap={{ scale: 0.9 }}
                onClick={() => setCategory(cat.id)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl"
                style={{ background: category === cat.id ? `${cat.color}22` : 'var(--surface)', border: `1px solid ${category === cat.id ? cat.color : 'var(--border)'}` }}>
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[9px] font-medium text-center leading-tight" style={{ color: category === cat.id ? cat.color : 'var(--text-tertiary)' }}>
                  {cat.label[language as 'ru' | 'en'] ?? cat.label.ru}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Описание' : 'Description'}</label>
          <input type="text" value={description} onChange={e => setDesc(e.target.value)}
            placeholder={language === 'ru' ? 'Необязательно' : 'Optional'}
            className="w-full h-11 rounded-xl px-4 text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 16 }} />
        </div>

        {/* Date */}
        <div className="mb-5">
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Дата' : 'Date'}</label>
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
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={saving}
            className="flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #D4B86A 100%)', color: '#0A0A0A', opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <motion.div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              : <><CheckIcon className="w-4 h-4" />{language === 'ru' ? 'Сохранить' : 'Save'}</>}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function HistoryPage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();

  const profile      = useStore(s => s.profile);
  const transactions = useStore(s => s.transactions);
  const addToast     = useStore(s => s.addToast);

  const language   = profile?.settings?.language || 'ru';
  const currency   = profile?.finance?.currency || 'UZS';
  const dateLocale = language === 'ru' ? ru : enUS;

  const [filterType, setFilterType]   = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCat] = useState<string | null>(null);
  const [searchQuery, setSearch]       = useState('');
  const [showFilters, setShowFilters]  = useState(false);
  const [showDatePicker, setDatePicker] = useState(false);
  const [dateStart, setDateStart]      = useState('');
  const [dateEnd, setDateEnd]          = useState('');
  const [period, setPeriod]            = useState<'all' | 'month' | 'last3' | 'custom'>('all');
  const [editingTx, setEditingTx]      = useState<TransactionDto | null>(null);
  const [isLoading, setIsLoading]      = useState(true);

  useEffect(() => {
    syncTransactions({ limit: 200 })
      .catch(e => console.warn('[History]', e?.message))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let res = [...transactions];
    if (filterType !== 'all') res = res.filter(t => t.type === filterType);
    if (filterCategory) res = res.filter(t => t.category === filterCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      res = res.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      );
    }
    if (period === 'month') {
      const s = startOfMonth(new Date()), e = endOfMonth(new Date());
      res = res.filter(t => { try { return isWithinInterval(parseISO(t.date), { start: s, end: e }); } catch { return false; }});
    } else if (period === 'last3') {
      const s = startOfMonth(subMonths(new Date(), 2)), e = endOfMonth(new Date());
      res = res.filter(t => { try { return isWithinInterval(parseISO(t.date), { start: s, end: e }); } catch { return false; }});
    } else if (period === 'custom' && dateStart && dateEnd) {
      const s = startOfDay(parseISO(dateStart)), e = endOfDay(parseISO(dateEnd));
      res = res.filter(t => { try { return isWithinInterval(parseISO(t.date), { start: s, end: e }); } catch { return false; }});
    }
    return res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterCategory, searchQuery, period, dateStart, dateEnd]);

  const grouped = useMemo(() => {
    const m: Record<string, typeof filtered> = {};
    filtered.forEach(t => { m[t.date] = m[t.date] ? [...m[t.date], t] : [t]; });
    return Object.entries(m).map(([date, items]) => ({
      date, items,
      total: items.reduce((s, t) => s + (t.type === 'expense' ? -t.amount : t.amount), 0),
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filtered]);

  const summaryStats = useMemo(() => ({
    income:  filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    count:   filtered.length,
  }), [filtered]);

  const availableCats = useMemo(() => [...new Set(transactions.map(t => t.category))], [transactions]);

  const hasActiveFilter = filterType !== 'all' || !!filterCategory || period !== 'all';

  const handleDelete = async (id: string) => {
    hapticFeedback?.('notification', 'warning');
    try {
      await deleteTransactionApi(id);
      addToast({ type: 'info', message: language === 'ru' ? 'Удалено' : 'Deleted' });
    } catch {
      addToast({ type: 'error', message: language === 'ru' ? 'Ошибка' : 'Error' });
    }
  };

  const clearFilters = () => {
    setFilterType('all'); setFilterCat(null); setSearch('');
    setPeriod('all'); setDateStart(''); setDateEnd(''); setShowFilters(false);
  };

  return (
    <div>
      {/* Bg */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-40" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(100,116,139,0.1) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/3" style={{ background: 'radial-gradient(ellipse at bottom left, rgba(74,222,128,0.07) 0%, transparent 50%)' }} />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/3" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(248,113,113,0.07) 0%, transparent 50%)' }} />
      </div>

      {/* Edit sheet */}
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

      {/* Date picker modal */}
      <AnimatePresence>
        {showDatePicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setDatePicker(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm p-5 rounded-2xl"
              style={{ background: 'var(--glass-bg-heavy)', border: '1px solid var(--glass-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Период' : 'Period'}</h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setDatePicker(false)}>
                  <XMarkIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                </motion.button>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'from', val: dateStart, set: setDateStart, label: language === 'ru' ? 'От' : 'From' },
                  { id: 'to',   val: dateEnd,   set: setDateEnd,   label: language === 'ru' ? 'До' : 'To'   },
                ].map(f => (
                  <div key={f.id}>
                    <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                    <input type="date" value={f.val} onChange={e => f.set(e.target.value)}
                      className="w-full h-11 rounded-xl px-4 text-sm outline-none"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark', fontSize: 16 }} />
                  </div>
                ))}
                <motion.button whileTap={{ scale: 0.98 }}
                  onClick={() => { if (dateStart && dateEnd) { setPeriod('custom'); setDatePicker(false); }}}
                  disabled={!dateStart || !dateEnd}
                  className="w-full h-11 rounded-xl font-semibold text-sm"
                  style={{ background: dateStart && dateEnd ? 'var(--primary)' : 'var(--surface-dim)', color: dateStart && dateEnd ? '#0A0A0A' : 'var(--text-tertiary)' }}>
                  {language === 'ru' ? 'Применить' : 'Apply'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-scrollable">
        {/* Header */}
        <header className="px-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'История' : 'History'}</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {summaryStats.count} {language === 'ru' ? 'операций' : 'transactions'}
              </p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { hapticFeedback?.('light'); setShowFilters(!showFilters); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center relative"
              style={{ background: showFilters ? 'var(--primary)' : 'var(--surface)', border: '1px solid var(--glass-border)' }}>
              <FunnelIcon className="w-5 h-5" style={{ color: showFilters ? '#0A0A0A' : 'var(--text-secondary)' }} />
              {hasActiveFilter && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-[#0A0A0A]" />
              )}
            </motion.button>
          </div>
        </header>

        <main className="px-4 space-y-3 pb-8">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input type="text" value={searchQuery} onChange={e => setSearch(e.target.value)}
              placeholder={language === 'ru' ? 'Поиск...' : 'Search...'}
              className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 16 }} />
            {searchQuery && (
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2">
                <XMarkIcon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              </motion.button>
            )}
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden rounded-xl p-4 space-y-4"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>

                {/* Type */}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Тип' : 'Type'}</p>
                  <div className="flex gap-2">
                    {[
                      { id: 'all',     label: language === 'ru' ? 'Все' : 'All',          color: 'var(--primary)' },
                      { id: 'income',  label: language === 'ru' ? 'Доходы' : 'Income',    color: '#22C55E' },
                      { id: 'expense', label: language === 'ru' ? 'Расходы' : 'Expenses', color: '#F87171' },
                    ].map(t => (
                      <motion.button key={t.id} whileTap={{ scale: 0.95 }}
                        onClick={() => setFilterType(t.id as any)}
                        className="flex-1 py-2 rounded-lg text-xs font-medium"
                        style={{
                          background: filterType === t.id ? `${t.color}20` : 'var(--surface-dim)',
                          border: `1px solid ${filterType === t.id ? t.color : 'var(--border)'}`,
                          color: filterType === t.id ? t.color : 'var(--text-secondary)',
                        }}>
                        {t.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Period */}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Период' : 'Period'}</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all',    label: language === 'ru' ? 'Всё время' : 'All time' },
                      { id: 'month',  label: language === 'ru' ? 'Этот месяц' : 'This month' },
                      { id: 'last3',  label: language === 'ru' ? '3 месяца' : '3 months' },
                    ].map(p => (
                      <motion.button key={p.id} whileTap={{ scale: 0.95 }}
                        onClick={() => setPeriod(p.id as any)}
                        className="px-3 py-2 rounded-lg text-xs font-medium"
                        style={{
                          background: period === p.id ? 'var(--primary-subtle)' : 'var(--surface-dim)',
                          border: `1px solid ${period === p.id ? 'var(--primary)' : 'var(--border)'}`,
                          color: period === p.id ? 'var(--primary)' : 'var(--text-secondary)',
                        }}>
                        {p.label}
                      </motion.button>
                    ))}
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => setDatePicker(true)}
                      className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1"
                      style={{
                        background: period === 'custom' ? 'var(--primary-subtle)' : 'var(--surface-dim)',
                        border: `1px solid ${period === 'custom' ? 'var(--primary)' : 'var(--border)'}`,
                        color: period === 'custom' ? 'var(--primary)' : 'var(--text-secondary)',
                      }}>
                      <CalendarDaysIcon className="w-3.5 h-3.5" />
                      {language === 'ru' ? 'Выбрать' : 'Custom'}
                    </motion.button>
                  </div>
                </div>

                {/* Categories */}
                {availableCats.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Категория' : 'Category'}</p>
                    <div className="flex flex-wrap gap-2">
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => setFilterCat(null)}
                        className="px-3 py-2 rounded-lg text-xs font-medium"
                        style={{
                          background: !filterCategory ? 'var(--primary-subtle)' : 'var(--surface-dim)',
                          border: `1px solid ${!filterCategory ? 'var(--primary)' : 'var(--border)'}`,
                          color: !filterCategory ? 'var(--primary)' : 'var(--text-secondary)',
                        }}>
                        {language === 'ru' ? 'Все' : 'All'}
                      </motion.button>
                      {availableCats.slice(0, 8).map(cat => {
                        const cfg = getCategoryConfig(cat);
                        return (
                          <motion.button key={cat} whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterCat(filterCategory === cat ? null : cat)}
                            className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5"
                            style={{
                              background: filterCategory === cat ? `${cfg.color}20` : 'var(--surface-dim)',
                              border: `1px solid ${filterCategory === cat ? cfg.color : 'var(--border)'}`,
                              color: filterCategory === cat ? cfg.color : 'var(--text-secondary)',
                            }}>
                            <span>{cfg.icon}</span>
                            {getCategoryLabel(cat, language as 'ru' | 'en')}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <motion.button whileTap={{ scale: 0.98 }} onClick={clearFilters}
                  className="w-full py-2.5 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--error-subtle)', color: 'var(--error)' }}>
                  {language === 'ru' ? 'Сбросить' : 'Clear'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary */}
          {filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowTrendingUpIcon className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Доходы' : 'Income'}</span>
                </div>
                <p className="text-base font-bold" style={{ color: 'var(--success)' }}>+{formatCurrency(summaryStats.income, currency, true)}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowTrendingDownIcon className="w-3.5 h-3.5" style={{ color: 'var(--error)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Расходы' : 'Expenses'}</span>
                </div>
                <p className="text-base font-bold" style={{ color: 'var(--error)' }}>-{formatCurrency(summaryStats.expense, currency, true)}</p>
              </div>
            </div>
          )}

          {/* Transaction list */}
          <AnimatePresence mode="wait">
            <motion.div key={`${filterType}-${filterCategory}-${period}-${searchQuery}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-5">
              {grouped.map((group, gi) => (
                <motion.div key={group.date} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }}>
                  {/* Date header */}
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                      {format(parseISO(group.date), 'd MMMM, EEEE', { locale: dateLocale })}
                    </p>
                    <p className="text-xs font-bold" style={{ color: group.total >= 0 ? 'var(--success)' : 'var(--error)' }}>
                      {group.total >= 0 ? '+' : ''}{formatCurrency(group.total, currency, true)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {group.items.map((tx, ti) => {
                      const cfg = getCategoryConfig(tx.category);
                      return (
                        <motion.div key={tx.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ti * 0.02 }}
                          className="flex items-center justify-between p-3 rounded-xl group"
                          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                          {/* Left: icon + info */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                              style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}28` }}>
                              {cfg.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)', maxWidth: 150 }}>
                                {tx.description || getCategoryLabel(tx.category, language as 'ru' | 'en')}
                              </p>
                              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                {getCategoryLabel(tx.category, language as 'ru' | 'en')}
                                {tx.notes ? ` · ${tx.notes}` : ''}
                              </p>
                            </div>
                          </div>

                          {/* Right: amount + actions */}
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-sm font-bold" style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--error)' }}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency, true)}
                            </span>
                            {/* Edit btn */}
                            <motion.button whileTap={{ scale: 0.85 }}
                              onClick={() => { hapticFeedback?.('light'); setEditingTx(tx as any); }}
                              className="w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: 'var(--primary-subtle)' }}>
                              <PencilSquareIcon className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                            </motion.button>
                            {/* Delete btn */}
                            <motion.button whileTap={{ scale: 0.85 }}
                              onClick={() => handleDelete(tx.id)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: 'var(--error-subtle)' }}>
                              <TrashIcon className="w-3.5 h-3.5" style={{ color: 'var(--error)' }} />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty */}
          {filtered.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-10 rounded-xl text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'var(--surface-dim)' }}>
                {transactions.length === 0 ? '📭' : '🔍'}
              </div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {transactions.length === 0 ? (language === 'ru' ? 'Нет транзакций' : 'No transactions') : (language === 'ru' ? 'Ничего не найдено' : 'Nothing found')}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {transactions.length === 0 ? (language === 'ru' ? 'Добавьте первую операцию' : 'Add your first transaction') : (language === 'ru' ? 'Попробуйте изменить фильтры' : 'Try changing filters')}
              </p>
              {hasActiveFilter && (
                <motion.button whileTap={{ scale: 0.95 }} onClick={clearFilters}
                  className="mt-4 px-4 py-2 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                  {language === 'ru' ? 'Сбросить фильтры' : 'Clear filters'}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-[68px] rounded-xl animate-pulse" style={{ background: 'var(--surface-secondary)' }} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}