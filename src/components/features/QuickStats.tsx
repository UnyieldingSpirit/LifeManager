// src/components/features/QuickStats.tsx
'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/Card';
import { formatMoney } from '@/lib/utils';

interface StatItem {
  id: string;
  icon: string;
  label: string;
  value: number;
  formatted?: string;
  color?: string;
  bgColor?: string;
}

interface QuickStatsProps {
  stats: StatItem[];
  currency?: string;
  className?: string;
}

export const QuickStats = ({ stats, className }: QuickStatsProps) => {
  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat, index) => (
          <motion.div key={stat.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
            <GlassCard intensity="light" className="p-3 text-center">
              <div className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1.5" style={{ backgroundColor: stat.bgColor || 'var(--primary-subtle)' }}>
                <span className="text-base">{stat.icon}</span>
              </div>
              <p className="text-xl font-bold" style={{ color: stat.color || 'var(--text-primary)' }}>{stat.formatted || stat.value}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

interface PeriodStatsProps {
  today: number;
  week: number;
  month: number;
  currency: string;
  type?: 'expense' | 'income';
  className?: string;
}

export const PeriodStats = ({ today, week, month, currency, type = 'expense', className }: PeriodStatsProps) => {
  const isExpense = type === 'expense';
  const color = isExpense ? 'var(--error)' : 'var(--success)';
  const sign = isExpense ? '-' : '+';
  
  const stats: StatItem[] = [
    { id: 'today', icon: '📅', label: 'Сегодня', value: today, formatted: `${sign}${formatMoney(today, currency, { compact: true, showCurrency: false })}`, color, bgColor: isExpense ? 'var(--error-subtle)' : 'var(--success-subtle)' },
    { id: 'week', icon: '📆', label: 'Неделя', value: week, formatted: `${sign}${formatMoney(week, currency, { compact: true, showCurrency: false })}`, color, bgColor: isExpense ? 'var(--error-subtle)' : 'var(--success-subtle)' },
    { id: 'month', icon: '🗓️', label: 'Месяц', value: month, formatted: `${sign}${formatMoney(month, currency, { compact: true, showCurrency: false })}`, color, bgColor: isExpense ? 'var(--error-subtle)' : 'var(--success-subtle)' },
  ];
  
  return <QuickStats stats={stats} className={className} />;
};

interface GoalCardProps {
  name: string;
  icon: string;
  color: string;
  currentAmount: number;
  targetAmount: number;
  currency: string;
  onClick?: () => void;
}

export const GoalCard = ({ name, icon, color, currentAmount, targetAmount, currency, onClick }: GoalCardProps) => {
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  
  return (
    <motion.div whileTap={{ scale: 0.98 }} onClick={onClick}>
      <GlassCard intensity="light" noPadding className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
            <span className="text-lg">{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{name}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <motion.div className="h-full rounded-full" style={{ background: progress >= 100 ? 'var(--success)' : `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)` }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, progress)}%` }} />
              </div>
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

interface GoalsWidgetProps {
  goals: Array<{ id: string; name: string; icon: string; color: string; currentAmount: number; targetAmount: number; deadline?: string }>;
  currency: string;
  onViewAll?: () => void;
  onGoalClick?: (goalId: string) => void;
  maxItems?: number;
  className?: string;
}

export const GoalsWidget = ({ goals, currency, onViewAll, onGoalClick, maxItems = 2, className }: GoalsWidgetProps) => {
  const activeGoals = goals.filter(g => (g.currentAmount / g.targetAmount) * 100 < 100).slice(0, maxItems);
  
  if (activeGoals.length === 0) return null;
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🎯</span>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Цели</h2>
        </div>
        {goals.length > maxItems && onViewAll && (
          <button onClick={onViewAll} className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Все →</button>
        )}
      </div>
      <div className="space-y-2">
        {activeGoals.map((goal) => (
          <GoalCard key={goal.id} {...goal} currency={currency} onClick={() => onGoalClick?.(goal.id)} />
        ))}
      </div>
    </div>
  );
};

export default QuickStats;