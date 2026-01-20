// src/components/ui/Toast.tsx
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { Toast } from '@/types';

const toastConfig: Record<Toast['type'], { emoji: string; bg: string; border: string }> = {
  success: {
    emoji: '✅',
    bg: 'var(--success-subtle)',
    border: 'var(--success)',
  },
  error: {
    emoji: '❌',
    bg: 'var(--error-subtle)',
    border: 'var(--error)',
  },
  warning: {
    emoji: '⚠️',
    bg: 'var(--warning-subtle)',
    border: 'var(--warning)',
  },
  info: {
    emoji: 'ℹ️',
    bg: 'var(--info-subtle)',
    border: 'var(--info)',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = toastConfig[toast.type];

  useEffect(() => {
    const duration = toast.duration || 3000;
    const timer = setTimeout(onRemove, duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl max-w-xs mx-auto"
      style={{
        background: 'var(--glass-bg-heavy)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        border: `1px solid ${config.border}`,
        boxShadow: 'var(--glass-shadow-lg)',
      }}
    >
      <span className="text-sm">{config.emoji}</span>
      <p 
        className="flex-1 text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {toast.message}
      </p>
      <button
        onClick={onRemove}
        className="p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--text-secondary)' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

export default function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  return (
    <div className="fixed top-4 left-3 right-3 z-[100] pointer-events-none pt-safe">
      <div className="flex flex-col gap-2 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}