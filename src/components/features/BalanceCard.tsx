// src/components/features/BalanceCard.tsx
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/Card';
import { BudgetProgress } from '@/components/ui/ProgressBar';
import { formatMoney, getBalanceState, getDaysUntilSalary, getDailyBudget, balanceStateColors } from '@/lib/utils';
import { BalanceState } from '@/types/finance';

// ============================================================================
// ТИПЫ
// ============================================================================

interface BalanceCardProps {
  balance: number;
  currency: string;
  monthlyBudget: number;
  spent: number;
  salaryDay: number;
  showDetails?: boolean;
  className?: string;
}

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export const BalanceCard = ({
  balance,
  currency,
  monthlyBudget,
  spent,
  salaryDay,
  showDetails = true,
  className,
}: BalanceCardProps) => {
  // Вычисляем состояние
  const state = useMemo(() => 
    getBalanceState(spent, monthlyBudget, balance),
    [spent, monthlyBudget, balance]
  );
  
  const colors = balanceStateColors[state];
  const remaining = monthlyBudget - spent;
  const daysUntilSalary = getDaysUntilSalary(salaryDay);
  const dailyBudget = getDailyBudget(remaining > 0 ? remaining : 0, daysUntilSalary);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <GlassCard
        intensity="medium"
        className="relative overflow-hidden"
        style={{ boxShadow: colors.glow }}
      >
        {/* Декоративный градиент сверху */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: state === 'normal'
              ? 'linear-gradient(90deg, #C9A962 0%, #E8D5A3 50%, #C9A962 100%)'
              : state === 'warning'
              ? 'linear-gradient(90deg, #FBBF24 0%, #FDE047 50%, #FBBF24 100%)'
              : 'linear-gradient(90deg, #F87171 0%, #FCA5A5 50%, #F87171 100%)',
          }}
        />

        {/* Основной контент */}
        <div className="pt-2">
          {/* Текущий баланс */}
          <div className="text-center mb-4">
            <p
              className="text-xs mb-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              Текущий баланс
            </p>
            <motion.p
              className="text-3xl font-bold tracking-tight"
              style={{ color: colors.text }}
              key={balance}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {formatMoney(balance, currency)}
            </motion.p>
          </div>

          {/* Прогресс бюджета */}
          <div className="mb-4">
            <BudgetProgress
              spent={spent}
              budget={monthlyBudget}
              size="sm"
            />
          </div>

          {/* Мини-карточки с деталями */}
          {showDetails && (
            <div className="grid grid-cols-2 gap-3">
              {/* До зарплаты */}
              <div
                className="p-3 rounded-xl text-center"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="text-base">📅</span>
                  <span
                    className="text-[10px]"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    До зарплаты
                  </span>
                </div>
                <p
                  className="text-lg font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {daysUntilSalary} {getDaysWord(daysUntilSalary)}
                </p>
              </div>

              {/* В день */}
              <div
                className="p-3 rounded-xl text-center"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="text-base">💰</span>
                  <span
                    className="text-[10px]"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    В день
                  </span>
                </div>
                <p
                  className="text-lg font-bold"
                  style={{ 
                    color: dailyBudget > 0 ? 'var(--success)' : 'var(--error)' 
                  }}
                >
                  {formatMoney(dailyBudget, currency, { compact: true })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Предупреждающий баннер при критическом состоянии */}
        {(state === 'danger' || state === 'negative') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-2 rounded-lg flex items-center gap-2"
            style={{ background: 'var(--error-subtle)' }}
          >
            <span className="text-base">⚠️</span>
            <span
              className="text-xs"
              style={{ color: 'var(--error)' }}
            >
              {state === 'negative' 
                ? 'Баланс отрицательный!'
                : 'Бюджет превышен!'
              }
            </span>
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
};

// Склонение слова "день"
const getDaysWord = (days: number): string => {
  const lastTwo = days % 100;
  const lastOne = days % 10;
  
  if (lastTwo >= 11 && lastTwo <= 14) return 'дней';
  if (lastOne === 1) return 'день';
  if (lastOne >= 2 && lastOne <= 4) return 'дня';
  return 'дней';
};

// ============================================================================
// COMPACT BALANCE CARD (для виджетов)
// ============================================================================

interface CompactBalanceCardProps {
  balance: number;
  currency: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const CompactBalanceCard = ({
  balance,
  currency,
  trend,
  className,
}: CompactBalanceCardProps) => {
  return (
    <GlassCard intensity="light" className={className}>
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-xs mb-0.5"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Баланс
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatMoney(balance, currency, { compact: true })}
          </p>
        </div>
        {trend && (
          <div
            className="px-2 py-1 rounded-lg text-xs font-medium"
            style={{
              background: trend.isPositive ? 'var(--success-subtle)' : 'var(--error-subtle)',
              color: trend.isPositive ? 'var(--success)' : 'var(--error)',
            }}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default BalanceCard;