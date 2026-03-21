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
          {/* Backdrop — только затемнение, БЕЗ blur чтобы не глючило при фокусе инпута */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              // backdropFilter намеренно убран — на iOS при открытии клавиатуры
              // blur на backdrop вызывает глитч и пропадание эффекта
            }}
            onClick={handleClose}
          />

          {/* Sheet — НЕПРОЗРАЧНЫЙ фон, никакого backdropFilter */}
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
              // Полностью непрозрачный фон — решает проблему blur при открытии клавиатуры
              background: '#161616',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderBottom: 'none',
              boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.5), 0 -1px 0 rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* Тонкий золотой градиент сверху для премиум-ощущения */}
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(201,169,98,0.4) 50%, transparent 100%)',
              }}
            />

            {/* Handle */}
            <div
              className="relative flex justify-center pt-2.5 pb-2 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div
                className="w-9 h-1 rounded-full"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)' }}
              />
            </div>

            {/* Header */}
            {title && (
              <div
                className="relative flex items-center justify-between px-4 pb-3"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}
              >
                <h2
                  className="text-base font-semibold"
                  style={{ color: '#F5F5F5' }}
                >
                  {title}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="w-7 h-7 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: '#A3A3A3' }}
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