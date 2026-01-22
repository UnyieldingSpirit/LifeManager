// src/components/features/AddTransactionForm.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { useTransactionStore } from '@/store/transactionStore';
import { useTelegram } from '@/hooks/useTelegram';
import { Button } from '@/components/ui/Button';
import { formatMoney } from '@/lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, QUICK_AMOUNTS, getCategoryById } from '@/lib/constants';
import { TransactionType } from '@/types/finance';

interface AddTransactionFormProps {
  onSuccess?: () => void;
  initialType?: TransactionType;
}

export const AddTransactionForm = ({ onSuccess, initialType = 'expense' }: AddTransactionFormProps) => {
  const { hapticFeedback } = useTelegram();
  
  const profile = useUserStore((s) => s.profile);
  const updateBalance = useUserStore((s) => s.updateBalance);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  
  const currency = profile?.finance.currency || 'UZS';
  const userExpenseCategories = profile?.finance.expenseCategories || [];
  const userIncomeCategories = profile?.finance.incomeCategories || [];
  
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isExpense = type === 'expense';
  
  const availableCategories = useMemo(() => {
    const allCategories = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const userCategories = isExpense ? userExpenseCategories : userIncomeCategories;
    if (userCategories.length === 0) return allCategories.slice(0, 12);
    return allCategories.filter(c => userCategories.includes(c.id));
  }, [isExpense, userExpenseCategories, userIncomeCategories]);
  
  const quickAmounts = QUICK_AMOUNTS[currency] || QUICK_AMOUNTS.USD;
  
  const handleTypeChange = (newType: TransactionType) => {
    hapticFeedback?.('selection');
    setType(newType);
    setCategory('');
  };
  
  const handleQuickAmount = (value: number) => {
    hapticFeedback?.('light');
    setAmount(value.toString());
  };
  
  const handleCategorySelect = (catId: string) => {
    hapticFeedback?.('selection');
    setCategory(catId);
  };
  
  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || !category) return;
    
    setIsSubmitting(true);
    hapticFeedback?.('medium');
    
    try {
      addTransaction({ type, amount: numAmount, category, description: description.trim() || getCategoryById(category)?.name.ru || '' });
      updateBalance(numAmount, type);
      hapticFeedback?.('success');
      onSuccess?.();
    } catch (error) {
      console.error('Error adding transaction:', error);
      hapticFeedback?.('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isValid = parseFloat(amount) > 0 && category;
  
  return (
    <div className="pb-4">
      <div className="flex gap-2 mb-6">
        <button onClick={() => handleTypeChange('expense')} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all" style={{
          background: isExpense ? 'var(--error-subtle)' : 'var(--surface)',
          color: isExpense ? 'var(--error)' : 'var(--text-tertiary)',
          border: isExpense ? '1px solid var(--error)' : '1px solid var(--border)',
        }}>
          💸 Расход
        </button>
        <button onClick={() => handleTypeChange('income')} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all" style={{
          background: !isExpense ? 'var(--success-subtle)' : 'var(--surface)',
          color: !isExpense ? 'var(--success)' : 'var(--text-tertiary)',
          border: !isExpense ? '1px solid var(--success)' : '1px solid var(--border)',
        }}>
          💰 Доход
        </button>
      </div>
      
      <div className="mb-6">
        <div className="rounded-2xl p-4 text-center" style={{ background: 'var(--surface)' }}>
          <input type="text" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} placeholder="0" className="w-full text-center text-4xl font-bold bg-transparent outline-none" style={{ color: 'var(--text-primary)' }} />
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{currency}</p>
        </div>
        
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {quickAmounts.map((value) => (
            <motion.button key={value} whileTap={{ scale: 0.95 }} onClick={() => handleQuickAmount(value)} className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium" style={{
              background: amount === value.toString() ? 'var(--primary-subtle)' : 'var(--surface)',
              color: amount === value.toString() ? 'var(--primary)' : 'var(--text-secondary)',
              border: amount === value.toString() ? '1px solid var(--primary)' : '1px solid var(--border)',
            }}>
              {formatMoney(value, currency, { compact: true, showCurrency: false })}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Категория</p>
        <div className="grid grid-cols-4 gap-2">
          <AnimatePresence mode="popLayout">
            {availableCategories.map((cat, index) => {
              const isSelected = category === cat.id;
              return (
                <motion.button key={cat.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.02 }} whileTap={{ scale: 0.95 }} onClick={() => handleCategorySelect(cat.id)} className="p-3 rounded-xl text-center transition-all" style={{
                  background: isSelected ? `${cat.color}20` : 'var(--surface)',
                  border: isSelected ? `1px solid ${cat.color}` : '1px solid var(--border)',
                }}>
                  <span className="text-xl block mb-1">{cat.icon}</span>
                  <span className="text-[10px] block truncate" style={{ color: isSelected ? cat.color : 'var(--text-secondary)' }}>{cat.name.ru}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="mb-6">
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание (опционально)" className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none" style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
      </div>
      
      <Button variant="primary" size="lg" isFullWidth isLoading={isSubmitting} disabled={!isValid} onClick={handleSubmit}>
        {isExpense ? '💸 Добавить расход' : '💰 Добавить доход'}
      </Button>
    </div>
  );
};

export default AddTransactionForm;