// src/components/ui/ProgressBar.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// ТИПЫ
// ============================================================================

type ProgressVariant = 'default' | 'gradient' | 'success' | 'warning' | 'danger';
type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside' | 'none';
  animated?: boolean;
  className?: string;
}

// ============================================================================
// СТИЛИ
// ============================================================================

const sizeStyles: Record<ProgressSize, { height: string; fontSize: string }> = {
  xs: { height: 'h-1', fontSize: 'text-[8px]' },
  sm: { height: 'h-2', fontSize: 'text-[10px]' },
  md: { height: 'h-3', fontSize: 'text-xs' },
  lg: { height: 'h-4', fontSize: 'text-sm' },
};

const variantColors: Record<ProgressVariant, string> = {
  default: 'var(--primary)',
  gradient: 'linear-gradient(90deg, #C9A962 0%, #E8D5A3 50%, #C9A962 100%)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--error)',
};

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export const ProgressBar = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  labelPosition = 'outside',
  animated = true,
  className,
}: ProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const { height, fontSize } = sizeStyles[size];
  const color = variantColors[variant];
  const isGradient = variant === 'gradient';

  return (
    <div className={cn('w-full', className)}>
      {/* Label outside (top) */}
      {showLabel && labelPosition === 'outside' && (
        <div className="flex justify-between items-center mb-1">
          <span
            className={cn(fontSize, 'font-medium')}
            style={{ color: 'var(--text-secondary)' }}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden relative',
          height
        )}
        style={{ background: 'rgba(255, 255, 255, 0.1)' }}
      >
        {/* Progress Fill */}
        <motion.div
          className={cn('h-full rounded-full relative', height)}
          style={{
            background: isGradient ? color : undefined,
            backgroundColor: !isGradient ? color : undefined,
          }}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          {animated && percentage > 0 && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'linear',
              }}
            />
          )}

          {/* Label inside */}
          {showLabel && labelPosition === 'inside' && size !== 'xs' && size !== 'sm' && (
            <span
              className={cn(
                'absolute inset-0 flex items-center justify-center font-semibold',
                fontSize
              )}
              style={{ color: 'var(--text-inverse)' }}
            >
              {Math.round(percentage)}%
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// ============================================================================
// BUDGET PROGRESS (специальный для бюджета)
// ============================================================================

interface BudgetProgressProps {
  spent: number;
  budget: number;
  currency?: string;
  showLabels?: boolean;
  size?: ProgressSize;
  className?: string;
}

export const BudgetProgress = ({
  spent,
  budget,
  showLabels = true,
  size = 'md',
  className,
}: BudgetProgressProps) => {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  
  // Определяем состояние
  let variant: ProgressVariant = 'gradient';
  if (percentage >= 100) variant = 'danger';
  else if (percentage >= 80) variant = 'warning';

  return (
    <div className={cn('w-full', className)}>
      <ProgressBar
        value={percentage}
        variant={variant}
        size={size}
        animated
      />
      {showLabels && (
        <div className="flex justify-between mt-1.5">
          <span
            className="text-xs"
            style={{ 
              color: percentage >= 100 ? 'var(--error)' : 'var(--text-secondary)' 
            }}
          >
            {Math.round(percentage)}% использовано
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {percentage < 100 
              ? `Осталось ${Math.round(100 - percentage)}%`
              : 'Превышен'
            }
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// GOAL PROGRESS (для целей накоплений)
// ============================================================================

interface GoalProgressProps {
  current: number;
  target: number;
  deadline?: string;
  showAmount?: boolean;
  formatAmount?: (value: number) => string;
  size?: ProgressSize;
  className?: string;
}

export const GoalProgress = ({
  current,
  target,
  deadline,
  showAmount = true,
  formatAmount = (v) => v.toLocaleString(),
  size = 'md',
  className,
}: GoalProgressProps) => {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const isCompleted = percentage >= 100;
  const isAlmost = percentage >= 90 && percentage < 100;

  // Проверяем просрочена ли цель
  const isOverdue = deadline && new Date(deadline) < new Date() && !isCompleted;

  let variant: ProgressVariant = 'gradient';
  if (isCompleted) variant = 'success';
  else if (isOverdue) variant = 'danger';
  else if (isAlmost) variant = 'warning';

  return (
    <div className={cn('w-full', className)}>
      <ProgressBar
        value={percentage}
        variant={variant}
        size={size}
        animated
      />
      {showAmount && (
        <div className="flex justify-between mt-1.5">
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatAmount(current)}
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            / {formatAmount(target)}
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CIRCULAR PROGRESS (круговой прогресс)
// ============================================================================

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  variant?: ProgressVariant;
  className?: string;
  children?: React.ReactNode;
}

export const CircularProgress = ({
  value,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
  variant = 'gradient',
  className,
  children,
}: CircularProgressProps) => {
  const percentage = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  const color = variant === 'gradient' ? '#C9A962' : variantColors[variant];

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ? (
          children
        ) : showLabel ? (
          <span
            className="text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {Math.round(percentage)}%
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default ProgressBar;