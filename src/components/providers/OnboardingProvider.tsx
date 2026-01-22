// src/components/providers/OnboardingProvider.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';

interface OnboardingProviderProps {
  children: ReactNode;
}

// Страницы, которые не требуют проверки онбординга
const PUBLIC_ROUTES = ['/onboarding', '/welcome'];

export default function OnboardingProvider({ children }: OnboardingProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isChecking, setIsChecking] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const isOnboarded = useUserStore((state) => state.isOnboarded);

  // Ждём гидратацию Zustand store
  useEffect(() => {
    // Небольшая задержка для гидратации persist store
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Проверка онбординга после гидратации
  useEffect(() => {
    if (!isHydrated) return;

    const checkOnboarding = async () => {
      // Минимальная задержка для плавности UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
      
      if (!isOnboarded && !isPublicRoute) {
        // Пользователь не прошёл онбординг - редиректим
        router.replace('/onboarding');
      } else if (isOnboarded && isPublicRoute) {
        // Пользователь уже прошёл онбординг, но на странице онбординга - на главную
        router.replace('/');
      }
      
      setIsChecking(false);
    };

    checkOnboarding();
  }, [isHydrated, isOnboarded, pathname, router]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isChecking && (
          <PremiumLoader key="loader" />
        )}
      </AnimatePresence>
      
      {/* Контент показываем только после проверки */}
      <div style={{ 
        opacity: isChecking ? 0 : 1,
        transition: 'opacity 0.3s ease-out',
        pointerEvents: isChecking ? 'none' : 'auto'
      }}>
        {children}
      </div>
    </>
  );
}

// Премиальный лоадер в карбоновой стилистике
function PremiumLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        // Нелинейный прогресс для более натурального вида
        const increment = Math.max(1, (100 - prev) * 0.1);
        return Math.min(100, prev + increment);
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ 
        background: 'linear-gradient(135deg, #0A0A0A 0%, #0D0D0D 50%, #111111 100%)',
      }}
    >
      {/* Фоновый паттерн */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(201, 169, 98, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(201, 169, 98, 0.05) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* Центральный контент */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Логотип / Иконка */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          className="relative mb-8"
        >
          {/* Внешнее свечение */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl"
            style={{ 
              background: 'rgba(201, 169, 98, 0.2)',
              transform: 'scale(1.5)',
            }}
          />
          
          {/* Кольцо-лоадер */}
          <div className="relative w-20 h-20">
            <svg className="w-full h-full" viewBox="0 0 80 80">
              {/* Фоновое кольцо */}
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="3"
              />
              
              {/* Прогресс кольцо */}
              <motion.circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={220}
                strokeDashoffset={220 - (220 * progress) / 100}
                transform="rotate(-90 40 40)"
                initial={{ strokeDashoffset: 220 }}
                animate={{ strokeDashoffset: 220 - (220 * progress) / 100 }}
                transition={{ duration: 0.1 }}
              />
              
              {/* Градиент для кольца */}
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C9A962" />
                  <stop offset="50%" stopColor="#E8D5A3" />
                  <stop offset="100%" stopColor="#C9A962" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Центральная иконка */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <svg 
                  className="w-8 h-8" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  style={{ color: '#C9A962' }}
                >
                  <path 
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Название приложения */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 
            className="text-2xl font-bold tracking-tight mb-1"
            style={{ 
              background: 'linear-gradient(135deg, #C9A962 0%, #E8D5A3 50%, #C9A962 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            LifeLedger
          </h1>
          <p 
            className="text-sm"
            style={{ color: 'rgba(163, 163, 163, 0.8)' }}
          >
            Ваш персональный ассистент
          </p>
        </motion.div>

        {/* Прогресс бар */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 200 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div 
            className="h-1 rounded-full overflow-hidden"
            style={{ 
              background: 'rgba(255, 255, 255, 0.06)',
              width: 200 
            }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ 
                background: 'linear-gradient(90deg, #C9A962 0%, #E8D5A3 50%, #C9A962 100%)',
                width: `${progress}%`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          
          {/* Процент */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-center mt-3"
            style={{ color: 'rgba(102, 102, 102, 0.8)' }}
          >
            {Math.round(progress)}%
          </motion.p>
        </motion.div>

        {/* Статус текст */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs mt-4"
          style={{ color: 'rgba(102, 102, 102, 0.6)' }}
        >
          {progress < 30 && 'Инициализация...'}
          {progress >= 30 && progress < 60 && 'Загрузка данных...'}
          {progress >= 60 && progress < 90 && 'Подготовка интерфейса...'}
          {progress >= 90 && 'Почти готово...'}
        </motion.p>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#C9A962' }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}