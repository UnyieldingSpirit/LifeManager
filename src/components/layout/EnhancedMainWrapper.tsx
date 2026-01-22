// src/components/layout/EnhancedMainWrapper.tsx
'use client';

import { ReactNode, useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import TelegramWebAppInitializer from './TelegramWebAppInitializer';
import OnboardingProvider from '@/components/providers/OnboardingProvider';

// === TaskFlow импорты ===
import BottomNav from './BottomNav';
import FAB from './FAB';
import ToastContainer from '@/components/ui/Toast';
import BottomSheet from '@/components/ui/BottomSheet';
import AddTaskForm from '@/components/tasks/AddTaskForm';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { useTelegram } from '@/hooks/useTelegram';
import { useTranslation } from '@/hooks/useTranslation';

interface EnhancedMainWrapperProps {
  children: ReactNode;
}

export default function EnhancedMainWrapper({ children }: EnhancedMainWrapperProps) {
  const mainRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prevPath, setPrevPath] = useState('');
  const pathname = usePathname();

  // === TaskFlow hooks ===
  const { t } = useTranslation();
  const { colorScheme, isReady } = useTelegram();
  const setTheme = useUserStore((state) => state.setTheme);
  const theme = useUserStore((state) => state.profile?.settings.theme || 'system');
  const isBottomSheetOpen = useUIStore((state) => state.isBottomSheetOpen);
  const bottomSheetContent = useUIStore((state) => state.bottomSheetContent);
  const closeBottomSheet = useUIStore((state) => state.closeBottomSheet);

  // === TaskFlow: Sync Telegram theme ===
  useEffect(() => {
    if (isReady && theme === 'system') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(colorScheme);
    }
  }, [colorScheme, isReady, theme]);

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  // === Оригинальная логика: Отслеживаем изменение пути ===
  useEffect(() => {
    if (prevPath && prevPath !== pathname) {
      handleRouteChange();
    }
    
    setPrevPath(pathname);
    
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    
    document.addEventListener('click', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [pathname]);

  // Функция для обработки клика по ссылке или кнопке навигации
  const handleUserInteraction = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' || 
        target.tagName === 'BUTTON' ||
        target.closest('a') || 
        target.closest('button')) {
      
      const link = target.closest('a');
      if (link && link.href && !link.href.startsWith('#') && 
          !link.href.includes('mailto:') && !link.href.includes('tel:') &&
          link.target !== '_blank') {
        handleRouteChange();
      }
    }
  };

  // Функция для обработки изменения маршрута
  const handleRouteChange = () => {
    setIsLoading(true);
    
    // Сбрасываем скролл вверх
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    
    // Скрываем лоадер после перехода
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  // === TaskFlow: Bottom sheet helpers ===
  const getBottomSheetTitle = () => {
    switch (bottomSheetContent) {
      case 'addTask':
        return t('tasks.newTask');
      case 'taskDetails':
        return t('tasks.title');
      case 'filters':
        return 'Фильтры';
      default:
        return undefined;
    }
  };

  const renderBottomSheetContent = () => {
    switch (bottomSheetContent) {
      case 'addTask':
        return <AddTaskForm />;
      default:
        return null;
    }
  };

  // Проверяем, находимся ли на странице онбординга
  const isOnboardingPage = pathname.startsWith('/onboarding') || pathname.startsWith('/welcome');

  return (
    <OnboardingProvider>
      {/* Основной контент с поддержкой скроллинга */}
      <main 
        ref={mainRef}
        className="main-content scrollbar-none relative"
        style={{ 
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          height: '100vh',
        }}
      >
        <TelegramWebAppInitializer />
        {children}
        
        {/* Минималистичный лоадер переходов между страницами */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="loader">
              <svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="loaderGradient">
                    <stop stopColor="#C9A962" stopOpacity="0" offset="0%"/>
                    <stop stopColor="#C9A962" stopOpacity=".631" offset="63.146%"/>
                    <stop stopColor="#C9A962" offset="100%"/>
                  </linearGradient>
                </defs>
                <g fill="none" fillRule="evenodd">
                  <g transform="translate(1 1)">
                    <path d="M36 18c0-9.94-8.06-18-18-18" stroke="url(#loaderGradient)" strokeWidth="3">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 18 18"
                        to="360 18 18"
                        dur="0.9s"
                        repeatCount="indefinite" />
                    </path>
                  </g>
                </g>
              </svg>
            </div>
          </div>
        )}
      </main>

      {/* === TaskFlow компоненты (скрываем на онбординге) === */}
      {!isOnboardingPage && (
        <>
          <BottomNav />
          <FAB />
        </>
      )}
      
      <ToastContainer />
      
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={closeBottomSheet}
        title={getBottomSheetTitle()}
      >
        {renderBottomSheetContent()}
      </BottomSheet>
    </OnboardingProvider>
  );
}