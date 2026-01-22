// src/app/history/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format, parseISO, startOfDay, endOfDay, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  ArrowLeftIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TrashIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import { formatCurrency } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔', transport: '🚗', shopping: '🛒', entertainment: '🎬',
  health: '💊', bills: '📄', education: '📚', other: '📦',
  salary: '💼', freelance: '💻', investment: '📈', gift: '🎁',
};

const CATEGORY_LABELS: Record<string, { ru: string; en: string }> = {
  food: { ru: 'Еда', en: 'Food' },
  transport: { ru: 'Транспорт', en: 'Transport' },
  shopping: { ru: 'Покупки', en: 'Shopping' },
  entertainment: { ru: 'Развлечения', en: 'Entertainment' },
  health: { ru: 'Здоровье', en: 'Health' },
  bills: { ru: 'Счета', en: 'Bills' },
  education: { ru: 'Образование', en: 'Education' },
  other: { ru: 'Другое', en: 'Other' },
  salary: { ru: 'Зарплата', en: 'Salary' },
  freelance: { ru: 'Фриланс', en: 'Freelance' },
  investment: { ru: 'Инвестиции', en: 'Investment' },
  gift: { ru: 'Подарок', en: 'Gift' },
};

export default function HistoryPage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();
  
  const profile = useStore((s) => s.profile);
  const transactions = useStore((s) => s.transactions);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const addToast = useStore((s) => s.addToast);
  
  const language = profile?.settings?.language || 'ru';
  const currency = profile?.finance?.currency || 'UZS';
  const dateLocale = language === 'ru' ? ru : enUS;
  
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [period, setPeriod] = useState<'all' | 'month' | 'last3' | 'custom'>('all');
  
  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    
    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }
    
    // Filter by category
    if (filterCategory) {
      result = result.filter(t => t.category === filterCategory);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.description?.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.amount.toString().includes(query)
      );
    }
    
    // Filter by date
    if (period === 'month') {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      result = result.filter(t => {
        const date = parseISO(t.date);
        return isWithinInterval(date, { start, end });
      });
    } else if (period === 'last3') {
      const start = startOfMonth(subMonths(new Date(), 2));
      const end = endOfMonth(new Date());
      result = result.filter(t => {
        const date = parseISO(t.date);
        return isWithinInterval(date, { start, end });
      });
    } else if (period === 'custom' && dateStart && dateEnd) {
      const start = startOfDay(parseISO(dateStart));
      const end = endOfDay(parseISO(dateEnd));
      result = result.filter(t => {
        const date = parseISO(t.date);
        return isWithinInterval(date, { start, end });
      });
    }
    
    // Sort by date descending
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterCategory, searchQuery, period, dateStart, dateEnd]);
  
  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof filteredTransactions } = {};
    
    filteredTransactions.forEach(t => {
      const dateKey = t.date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    
    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
      total: items.reduce((sum, t) => sum + (t.type === 'expense' ? -t.amount : t.amount), 0),
    }));
  }, [filteredTransactions]);
  
  // Stats
  const stats = useMemo(() => ({
    total: filteredTransactions.length,
    income: filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  }), [filteredTransactions]);
  
  // Categories for filter
  const availableCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats);
  }, [transactions]);
  
  const handleDelete = (id: string) => {
   hapticFeedback?.('notification', 'warning')
    deleteTransaction(id);
    addToast({ type: 'info', message: language === 'ru' ? 'Транзакция удалена' : 'Transaction deleted' });
  };
  
  const clearFilters = () => {
    setFilterType('all');
    setFilterCategory(null);
    setSearchQuery('');
    setPeriod('all');
    setDateStart('');
    setDateEnd('');
    setShowFilters(false);
  };

  return (
    <div className="" >
      {/* ============================================================================
          УНИКАЛЬНЫЙ ФОН СТРАНИЦЫ ИСТОРИИ
          Тема: Время, хронология, записи
          Приглушённое сине-серое свечение
          ============================================================================ */}
      <div className="">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[40%]"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(100, 116, 139, 0.12) 0%, transparent 60%)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-1/2 h-1/3"
          style={{
            background: 'radial-gradient(ellipse at bottom left, rgba(74, 222, 128, 0.08) 0%, transparent 50%)',
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-1/2 h-1/3"
          style={{
            background: 'radial-gradient(ellipse at bottom right, rgba(248, 113, 113, 0.08) 0%, transparent 50%)',
          }}
        />
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
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
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
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                  />
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (dateStart && dateEnd) {
                      setPeriod('custom');
                      setShowDatePicker(false);
                    }
                  }}
                  className="w-full py-3 rounded-xl font-semibold"
                  style={{
                    background: dateStart && dateEnd ? 'var(--primary)' : 'var(--surface-dim)',
                    color: dateStart && dateEnd ? '#0A0A0A' : 'var(--text-tertiary)',
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
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'История' : 'History'}
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {stats.total} {language === 'ru' ? 'операций' : 'transactions'}
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('light');
                setShowFilters(!showFilters);
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center relative"
              style={{ 
                background: showFilters ? 'var(--primary)' : 'var(--surface)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <FunnelIcon className="w-5 h-5" style={{ color: showFilters ? '#0A0A0A' : 'var(--text-secondary)' }} />
              {(filterType !== 'all' || filterCategory || period !== 'all') && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" />
              )}
            </motion.button>
          </div>
        </header>
        
        <main className="px-4 space-y-4 pb-8">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ru' ? 'Поиск транзакций...' : 'Search transactions...'}
              className="w-full pl-10 pr-10 py-3 rounded-xl text-sm"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            {searchQuery && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <XMarkIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
              </motion.button>
            )}
          </div>
          
          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3 p-4 rounded-xl"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
              >
                {/* Type Filter */}
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'ru' ? 'Тип операции' : 'Transaction Type'}
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'all', label: language === 'ru' ? 'Все' : 'All' },
                      { id: 'income', label: language === 'ru' ? 'Доходы' : 'Income', color: '#22C55E' },
                      { id: 'expense', label: language === 'ru' ? 'Расходы' : 'Expenses', color: '#F87171' },
                    ].map((t) => (
                      <motion.button
                        key={t.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilterType(t.id as any)}
                        className="flex-1 py-2 rounded-lg text-xs font-medium"
                        style={{
                          background: filterType === t.id ? (t.color ? `${t.color}20` : 'var(--primary-subtle)') : 'var(--surface-dim)',
                          border: `1px solid ${filterType === t.id ? (t.color || 'var(--primary)') : 'var(--border)'}`,
                          color: filterType === t.id ? (t.color || 'var(--primary)') : 'var(--text-secondary)',
                        }}
                      >
                        {t.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Period Filter */}
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'ru' ? 'Период' : 'Period'}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { id: 'all', label: language === 'ru' ? 'Всё время' : 'All time' },
                      { id: 'month', label: language === 'ru' ? 'Этот месяц' : 'This month' },
                      { id: 'last3', label: language === 'ru' ? '3 месяца' : '3 months' },
                    ].map((p) => (
                      <motion.button
                        key={p.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPeriod(p.id as any)}
                        className="px-3 py-2 rounded-lg text-xs font-medium"
                        style={{
                          background: period === p.id ? 'var(--primary-subtle)' : 'var(--surface-dim)',
                          border: `1px solid ${period === p.id ? 'var(--primary)' : 'var(--border)'}`,
                          color: period === p.id ? 'var(--primary)' : 'var(--text-secondary)',
                        }}
                      >
                        {p.label}
                      </motion.button>
                    ))}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDatePicker(true)}
                      className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1"
                      style={{
                        background: period === 'custom' ? 'var(--primary-subtle)' : 'var(--surface-dim)',
                        border: `1px solid ${period === 'custom' ? 'var(--primary)' : 'var(--border)'}`,
                        color: period === 'custom' ? 'var(--primary)' : 'var(--text-secondary)',
                      }}
                    >
                      <CalendarDaysIcon className="w-3.5 h-3.5" />
                      {language === 'ru' ? 'Выбрать' : 'Custom'}
                    </motion.button>
                  </div>
                </div>
                
                {/* Category Filter */}
                {availableCategories.length > 0 && (
                  <div>
                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                      {language === 'ru' ? 'Категория' : 'Category'}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilterCategory(null)}
                        className="px-3 py-2 rounded-lg text-xs font-medium"
                        style={{
                          background: !filterCategory ? 'var(--primary-subtle)' : 'var(--surface-dim)',
                          border: `1px solid ${!filterCategory ? 'var(--primary)' : 'var(--border)'}`,
                          color: !filterCategory ? 'var(--primary)' : 'var(--text-secondary)',
                        }}
                      >
                        {language === 'ru' ? 'Все' : 'All'}
                      </motion.button>
                      {availableCategories.slice(0, 6).map((cat) => (
                        <motion.button
                          key={cat}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                          className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1"
                          style={{
                            background: filterCategory === cat ? 'var(--primary-subtle)' : 'var(--surface-dim)',
                            border: `1px solid ${filterCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                            color: filterCategory === cat ? 'var(--primary)' : 'var(--text-secondary)',
                          }}
                        >
                          <span>{CATEGORY_ICONS[cat] || '📦'}</span>
                          {CATEGORY_LABELS[cat]?.[language as 'ru' | 'en'] || cat}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Clear Filters */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={clearFilters}
                  className="w-full py-2.5 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--error-subtle)', color: 'var(--error)' }}
                >
                  {language === 'ru' ? 'Сбросить фильтры' : 'Clear Filters'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Stats Summary */}
          {filteredTransactions.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowTrendingUpIcon className="w-4 h-4" style={{ color: 'var(--success)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Доходы' : 'Income'}</span>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>+{formatCurrency(stats.income, currency, true)}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowTrendingDownIcon className="w-4 h-4" style={{ color: 'var(--error)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Расходы' : 'Expenses'}</span>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--error)' }}>-{formatCurrency(stats.expense, currency, true)}</p>
              </div>
            </div>
          )}
          
          {/* Transactions List */}
          <AnimatePresence mode="wait">
            <motion.div
              key={filterType + filterCategory + period + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {groupedTransactions.map((group, groupIndex) => (
                <motion.div
                  key={group.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.05 }}
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {format(parseISO(group.date), 'd MMMM, EEEE', { locale: dateLocale })}
                    </p>
                    <p 
                      className="text-xs font-semibold"
                      style={{ color: group.total >= 0 ? 'var(--success)' : 'var(--error)' }}
                    >
                      {group.total >= 0 ? '+' : ''}{formatCurrency(group.total, currency, true)}
                    </p>
                  </div>
                  
                  {/* Transactions */}
                  <div className="space-y-2">
                    {group.items.map((tx, txIndex) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: txIndex * 0.02 }}
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                            style={{ 
                              background: tx.type === 'income' ? 'var(--success-subtle)' : 'var(--error-subtle)',
                            }}
                          >
                            {CATEGORY_ICONS[tx.category] || (tx.type === 'income' ? '💰' : '💸')}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {tx.description || CATEGORY_LABELS[tx.category]?.[language as 'ru' | 'en'] || tx.category}
                            </p>
                            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                              {CATEGORY_LABELS[tx.category]?.[language as 'ru' | 'en'] || tx.category}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-sm font-semibold"
                            style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--error)' }}
                          >
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency, true)}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(tx.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100"
                            style={{ background: 'var(--error-subtle)' }}
                          >
                            <TrashIcon className="w-4 h-4" style={{ color: 'var(--error)' }} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          
          {/* Empty State */}
          {filteredTransactions.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-xl text-center"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--surface-dim)' }}
              >
                <ClockIcon className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {transactions.length === 0 
                  ? (language === 'ru' ? 'Нет транзакций' : 'No transactions')
                  : (language === 'ru' ? 'Ничего не найдено' : 'Nothing found')
                }
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {transactions.length === 0 
                  ? (language === 'ru' ? 'Добавьте первую транзакцию' : 'Add your first transaction')
                  : (language === 'ru' ? 'Попробуйте изменить фильтры' : 'Try changing filters')
                }
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}