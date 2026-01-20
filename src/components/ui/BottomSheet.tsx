// src/components/ui/BottomSheet.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { useTelegram } from '@/hooks/useTelegram';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const { hapticFeedback } = useTelegram();
  const dragControls = useDragControls();

  // Блокируем скролл body когда открыт
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 80 || info.velocity.y > 400) {
      onClose();
      hapticFeedback?.('selection');
    }
  };

  const handleClose = () => {
    onClose();
    hapticFeedback?.('selection');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={handleClose}
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 400 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-hidden flex flex-col"
            style={{ 
              background: 'var(--glass-bg-heavy)',
              backdropFilter: 'blur(var(--glass-blur-heavy))',
              WebkitBackdropFilter: 'blur(var(--glass-blur-heavy))',
              borderTopLeftRadius: 'var(--radius-2xl)',
              borderTopRightRadius: 'var(--radius-2xl)',
              border: '1px solid var(--glass-border)',
              borderBottom: 'none',
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Gradient overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background: 'linear-gradient(180deg, var(--primary-subtle) 0%, transparent 30%)',
                borderTopLeftRadius: 'var(--radius-2xl)',
                borderTopRightRadius: 'var(--radius-2xl)',
              }}
            />

            {/* Handle */}
            <div 
              className="relative flex justify-center pt-2.5 pb-2 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div 
                className="w-9 h-1 rounded-full"
                style={{ backgroundColor: 'var(--border-hover)' }}
              />
            </div>

            {/* Header */}
            {title && (
              <div 
                className="relative flex items-center justify-between px-4 pb-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h2 
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="w-7 h-7 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--surface-dim)' }}
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            )}

            {/* Content */}
            <div className="relative flex-1 overflow-y-auto px-4 pt-3 pb-safe scrollbar-hide">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}