// src/components/layout/FAB.tsx
'use client';

import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useTelegram } from '@/hooks/useTelegram';

export default function FAB() {
  const openBottomSheet = useUIStore((state) => state.openBottomSheet);
  const { hapticFeedback } = useTelegram();

  const handleClick = () => {
    hapticFeedback('impact', 'medium');
    openBottomSheet('addTask');
  };

  return (
    <motion.button
      onClick={handleClick}
      className="fixed z-40 flex items-center justify-center w-12 h-12 rounded-2xl"
      style={{
        right: '16px',
        bottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 20px)',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
        boxShadow: '0 4px 20px var(--primary-glow), 0 0 40px var(--primary-glow)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 20,
        delay: 0.3,
      }}
    >
      {/* Animated glow ring */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          opacity: 0.4,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Plus Icon */}
      <svg 
        className="w-6 h-6 relative z-10" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        style={{ color: 'white' }}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2.5} 
          d="M12 4v16m8-8H4" 
        />
      </svg>
    </motion.button>
  );
}