// src/components/ui/Card.tsx
'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// ТИПЫ
// ============================================================================

type CardVariant = 'default' | 'elevated' | 'outline' | 'glass' | 'premium';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  isInteractive?: boolean;
  noPadding?: boolean;
}

interface MotionCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  isInteractive?: boolean;
  noPadding?: boolean;
  children: ReactNode;
}

// ============================================================================
// СТИЛИ
// ============================================================================

const baseStyles = `
  rounded-2xl
  transition-all duration-200
`;

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-[var(--surface)]
    border border-[var(--border)]
  `,
  elevated: `
    bg-[var(--surface-elevated)]
    border border-[var(--border)]
    shadow-lg
  `,
  outline: `
    bg-transparent
    border border-[var(--border)]
  `,
  glass: `
    backdrop-blur-xl
    border border-[var(--glass-border)]
  `,
  premium: `
    backdrop-blur-xl
    border border-[rgba(201,169,98,0.2)]
  `,
};

const interactiveStyles = `
  cursor-pointer
  hover:border-[var(--border-hover)]
  active:scale-[0.98]
`;

// ============================================================================
// СТАТИЧНЫЙ CARD
// ============================================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', isInteractive, noPadding, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          isInteractive && interactiveStyles,
          !noPadding && 'p-4',
          className
        )}
        style={
          variant === 'glass'
            ? { background: 'var(--glass-bg)' }
            : variant === 'premium'
            ? {
                background: 'linear-gradient(135deg, rgba(201,169,98,0.08) 0%, rgba(18,18,18,0.9) 100%)',
                boxShadow: '0 0 30px rgba(201, 169, 98, 0.1)',
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// MOTION CARD (с анимацией)
// ============================================================================

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ variant = 'default', isInteractive, noPadding, className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          !noPadding && 'p-4',
          className
        )}
        style={
          variant === 'glass'
            ? { background: 'var(--glass-bg)' }
            : variant === 'premium'
            ? {
                background: 'linear-gradient(135deg, rgba(201,169,98,0.08) 0%, rgba(18,18,18,0.9) 100%)',
                boxShadow: '0 0 30px rgba(201, 169, 98, 0.1)',
              }
            : undefined
        }
        whileHover={isInteractive ? { scale: 1.01 } : undefined}
        whileTap={isInteractive ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

MotionCard.displayName = 'MotionCard';

// ============================================================================
// GLASS CARD (специальный стиль)
// ============================================================================

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  intensity?: 'light' | 'medium' | 'heavy';
  noPadding?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ intensity = 'medium', noPadding, className, children, ...props }, ref) => {
    const intensityStyles = {
      light: {
        background: 'rgba(28, 28, 28, 0.6)',
        blur: '12px',
      },
      medium: {
        background: 'rgba(18, 18, 18, 0.85)',
        blur: '20px',
      },
      heavy: {
        background: 'rgba(12, 12, 12, 0.95)',
        blur: '40px',
      },
    };

    const style = intensityStyles[intensity];

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-[var(--glass-border)]',
          !noPadding && 'p-4',
          className
        )}
        style={{
          background: style.background,
          backdropFilter: `blur(${style.blur})`,
          WebkitBackdropFilter: `blur(${style.blur})`,
          boxShadow: 'var(--glass-shadow)',
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// ============================================================================
// STAT CARD (для статистики)
// ============================================================================

interface StatCardProps {
  icon: ReactNode;
  iconBg?: string;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard = ({
  icon,
  iconBg = 'var(--primary-subtle)',
  value,
  label,
  trend,
  className,
}: StatCardProps) => {
  return (
    <GlassCard className={cn('text-center', className)}>
      <div
        className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <p
        className="text-xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>
      <p
        className="text-xs"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </p>
      {trend && (
        <p
          className="text-xs mt-1"
          style={{ color: trend.isPositive ? 'var(--success)' : 'var(--error)' }}
        >
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </p>
      )}
    </GlassCard>
  );
};

export default Card;