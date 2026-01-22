// src/components/features/TransactionList.tsx
'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/Card';
import { Transaction } from '@/types/finance';
import { formatMoney, formatDate, groupByDate } from '@/lib/utils';
import { getCategoryById } from '@/lib/constants';

interface TransactionCardProps {
  transaction: Transaction;
  currency: string;
  locale?: 'ru' | 'en' | 'uz';
  onClick?: () => void;
}

export const TransactionCard = ({ transaction, currency, locale = 'ru', onClick }: TransactionCardProps) => {
  const category = getCategoryById(transaction.category);
  const isExpense = transaction.type === 'expense';
  
  return (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} whileTap={{ scale: 0.98 }} onClick={onClick} className="cursor-pointer">
      <GlassCard intensity="light" noPadding className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: category?.color ? `${category.color}20` : 'var(--surface)' }}>
            <span className="text-lg">{category?.icon || '📦'}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {category?.name[locale] || transaction.category}
            </p>
            {transaction.description && (
              <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{transaction.description}</p>
            )}
          </div>
          
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold" style={{ color: isExpense ? 'var(--error)' : 'var(--success)' }}>
              {isExpense ? '-' : '+'}{formatMoney(transaction.amount, currency)}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{formatDate(transaction.date, 'time', locale)}</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

interface TransactionListProps {
  transactions: Transaction[];
  currency: string;
  locale?: 'ru' | 'en' | 'uz';
  groupBy?: 'day' | 'none';
  maxItems?: number;
  showEmpty?: boolean;
  emptyMessage?: string;
  onTransactionClick?: (transaction: Transaction) => void;
  className?: string;
}

export const TransactionList = ({ transactions, currency, locale = 'ru', groupBy = 'day', maxItems, showEmpty = true, emptyMessage = 'Нет транзакций', onTransactionClick, className }: TransactionListProps) => {
  const displayTransactions = maxItems ? transactions.slice(0, maxItems) : transactions;
  const groupedTransactions = useMemo(() => groupBy === 'none' ? new Map([['all', displayTransactions]]) : groupByDate(displayTransactions), [displayTransactions, groupBy]);
  
  if (transactions.length === 0 && showEmpty) {
    return (
      <div className={className}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{emptyMessage}</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Добавьте первую транзакцию</p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {Array.from(groupedTransactions.entries()).map(([dateKey, items]) => (
          <div key={dateKey} className="mb-4 last:mb-0">
            {groupBy === 'day' && (
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">📅</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(dateKey).toDateString() === new Date().toDateString() ? 'Сегодня' : formatDate(dateKey, 'short', locale)}
                  </span>
                </div>
                <span className="text-xs font-medium" style={{ color: items.reduce((s, t) => s + (t.type === 'expense' ? -t.amount : t.amount), 0) >= 0 ? 'var(--success)' : 'var(--error)' }}>
                  {formatMoney(items.reduce((s, t) => s + (t.type === 'expense' ? -t.amount : t.amount), 0), currency, { compact: true, showSign: true })}
                </span>
              </div>
            )}
            <div className="space-y-2">
              {items.map((transaction, index) => (
                <motion.div key={transaction.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <TransactionCard transaction={transaction} currency={currency} locale={locale} onClick={() => onTransactionClick?.(transaction)} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency: string;
  locale?: 'ru' | 'en' | 'uz';
  onViewAll?: () => void;
  onTransactionClick?: (transaction: Transaction) => void;
  maxItems?: number;
}

export const RecentTransactions = ({ transactions, currency, locale = 'ru', onViewAll, onTransactionClick, maxItems = 5 }: RecentTransactionsProps) => {
  const hasMore = transactions.length > maxItems;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📝</span>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Последние транзакции</h2>
        </div>
        {hasMore && onViewAll && (
          <button onClick={onViewAll} className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Все →</button>
        )}
      </div>
      <TransactionList transactions={transactions.slice(0, maxItems)} currency={currency} locale={locale} groupBy="none" showEmpty emptyMessage="Пока нет транзакций" onTransactionClick={onTransactionClick} />
    </div>
  );
};

export default TransactionList;