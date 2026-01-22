// src/components/ui/Button.tsx
'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// ТИПЫ
// ============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

// ============================================================================
// СТИЛИ
// ============================================================================

const baseStyles = `
  relative inline-flex items-center justify-center gap-2
  font-semibold rounded-xl
  transition-all duration-200
  touch-manipulation
  disabled:opacity-50 disabled:cursor-not-allowed
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
`;

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    text-[#0A0A0A]
    focus:ring-[var(--primary)]
  `,
  secondary: `
    bg-[var(--surface)] 
    text-[var(--text-primary)]
    border border-[var(--border)]
    hover:bg-[var(--surface-elevated)]
    focus:ring-[var(--border)]
  `,
  ghost: `
    bg-transparent
    text-[var(--text-primary)]
    hover:bg-[var(--surface)]
    focus:ring-[var(--border)]
  `,
  outline: `
    bg-transparent
    text-[var(--primary)]
    border border-[var(--primary)]
    hover:bg-[var(--primary-subtle)]
    focus:ring-[var(--primary)]
  `,
  danger: `
    bg-[var(--error)]
    text-white
    hover:opacity-90
    focus:ring-[var(--error)]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-12 px-6 text-base',
};

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isFullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isPrimary = variant === 'primary';
    
    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          isFullWidth && 'w-full',
          className
        )}
        style={
          isPrimary
            ? {
                background: 'linear-gradient(135deg, #C9A962 0%, #E8D5A3 50%, #C9A962 100%)',
                boxShadow: disabled ? 'none' : '0 4px 15px rgba(201, 169, 98, 0.35)',
              }
            : undefined
        }
        disabled={disabled || isLoading}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        
        {/* Content */}
        <span
          className={cn(
            'flex items-center gap-2',
            isLoading && 'invisible'
          )}
        >
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
        
        {/* Shimmer effect for primary */}
        {isPrimary && !disabled && !isLoading && (
          <motion.span
            className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
            initial={false}
          >
            <motion.span
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'linear',
              }}
            />
          </motion.span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// ICON BUTTON
// ============================================================================

interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: ReactNode;
  variant?: 'default' | 'ghost' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = 'default', size = 'md', className, ...props }, ref) => {
    const sizeMap = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };
    
    const variantMap = {
      default: 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]',
      ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]',
      primary: 'bg-[var(--primary)] text-[var(--bg-primary)]',
    };
    
    return (
      <motion.button
        ref={ref}
        className={cn(
          'flex items-center justify-center rounded-xl transition-colors',
          sizeMap[size],
          variantMap[variant],
          className
        )}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {icon}
      </motion.button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default Button;