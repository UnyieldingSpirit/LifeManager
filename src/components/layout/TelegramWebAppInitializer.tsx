'use client';

import { JSX, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function TelegramWebAppInitializer(): JSX.Element | null {
  const pathname = usePathname();
  const router = useRouter();
  const tgInitialized = useRef(false);
  const handleBackRef = useRef(() => router.back());
  const viewportSetterRef = useRef<(() => void) | null>(null);

  // Улучшенная функция для определения десктопного клиента
  const isDesktopClient = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return false;
    
    // Явное определение десктопных платформ
    const desktopPlatforms = ['tdesktop', 'webk', 'web', 'webz'];
    const isTgDesktop = desktopPlatforms.includes(tg.platform);
    
    // Дополнительная проверка User-Agent для десктопных браузеров
    const isDesktopUA = !(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) ||
                        (/Windows|Macintosh|Linux/i.test(navigator.userAgent));
    
    // Консоль для отладки
    console.log('Telegram Platform:', tg.platform);
    console.log('User Agent:', navigator.userAgent);
    console.log('Is Desktop Client:', isTgDesktop || isDesktopUA);
    
    return isTgDesktop || isDesktopUA;
  };

  // Функция для применения стилей десктопа
  const applyDesktopStyles = () => {
    // Находим элемент с классом main-content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      // Убираем мобильные классы
      mainContent.classList.remove('mobile-padding');
      // Добавляем классы для десктопа
      mainContent.classList.add('desktop-padding');
      
      // Явно указываем отсутствие падингов
      (mainContent as HTMLElement).style.paddingTop = '0';
      (mainContent as HTMLElement).style.paddingBottom = '0';
      
      console.log('Desktop styles applied to main-content');
    } else {
      console.warn('main-content element not found for desktop styling');
      
      // Пробуем применить повторно через секунду, если элемент еще не создан
      setTimeout(() => {
        const retryMainContent = document.querySelector('.main-content');
        if (retryMainContent) {
          retryMainContent.classList.remove('mobile-padding');
          retryMainContent.classList.add('desktop-padding');
          (retryMainContent as HTMLElement).style.paddingTop = '0';
          (retryMainContent as HTMLElement).style.paddingBottom = '0';
          console.log('Desktop styles applied on retry');
        }
      }, 1000);
    }
    
    // Применяем стили к body для десктопа
    document.body.classList.add('tg-desktop');
    
    // Добавляем CSS-переменную для использования в стилях
    document.documentElement.style.setProperty('--is-desktop', '1');
  };

  // Основная инициализация - выполняется один раз
  useEffect(() => {
    if (!tgInitialized.current && typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        const tg = window.Telegram.WebApp;
        
        // Используем улучшенную функцию определения десктопа
        const isDesktop = isDesktopClient();
        
        console.log('Device detection:', {
          isDesktop,
          platform: tg.platform,
          userAgent: navigator.userAgent,
        });
        
        // Сообщаем Telegram, что приложение готово
        if (typeof tg.ready === 'function') {
          tg.ready();
        }

        // Общие настройки (применяются всегда)
        if (typeof tg.enableClosingConfirmation === 'function') {
          tg.enableClosingConfirmation(true);
        }
        
        // НЕ вызываем полноэкранный режим для десктопа
        if (!isDesktop && typeof tg.requestFullscreen === 'function') {
          console.log('Activating fullscreen (mobile only)');
          tg.requestFullscreen();
        } else {
          console.log('Skipping fullscreen (desktop client detected)');
        }

        // Настройка кнопки "Назад" (работает на всех устройствах)
        if (tg.BackButton && typeof tg.BackButton.onClick === 'function') {
          tg.BackButton.onClick(handleBackRef.current);
          
          if (pathname === '/') {
            if (typeof tg.BackButton.hide === 'function') {
              tg.BackButton.hide();
            }
          } else {
            if (typeof tg.BackButton.show === 'function') {
              tg.BackButton.show();
            }
          }
        }

        // Мобильно-специфичные методы только для мобильных устройств
        if (!isDesktop) {
          console.log('Applying mobile-specific settings');
          
          // Расширение на всю высоту
          if (typeof tg.expand === 'function') {
            tg.expand();
          }

          // Отключение вертикальных свайпов
          if (typeof tg.disableVerticalSwipes === 'function') {
            tg.disableVerticalSwipes(true);
          }
          
          // Настройка viewport для мобильных устройств
          const setViewportHeight = () => {
            if (typeof tg.viewportStableHeight === 'number') {
              document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportStableHeight}px`);
              document.documentElement.style.setProperty('--vh', `${tg.viewportStableHeight * 0.01}px`);
              document.documentElement.style.minHeight = `${tg.viewportStableHeight}px`;
              document.body.style.minHeight = `${tg.viewportStableHeight}px`;
            }
          };

          viewportSetterRef.current = setViewportHeight;
          
          setViewportHeight();
          window.addEventListener('resize', setViewportHeight);
          
          // Добавляем класс для мобильной версии
          document.body.classList.add('tg-mobile');
        } else {
          console.log('Applying desktop-specific settings');
          
          // Применяем стили для десктопа
          applyDesktopStyles();
        }

        tgInitialized.current = true;
      } catch (error) {
        console.error('Ошибка при инициализации Telegram WebApp:', error);
      }
    }
  }, [pathname, router]);

  // Эффект для управления кнопкой "Назад" при изменении маршрута
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.BackButton) {
      try {
        const backButton = window.Telegram.WebApp.BackButton;
        
        if (pathname === '/') {
          if (typeof backButton.hide === 'function') {
            backButton.hide();
          }
        } else {
          if (typeof backButton.show === 'function') {
            backButton.show();
          }
        }
      } catch (error) {
        console.error('Ошибка при обработке BackButton:', error);
      }
    }
  }, [pathname]);

  // Очистка ресурсов при размонтировании
  useEffect(() => {
    return () => {
      try {
        // Удаляем обработчик изменения размера, если он был добавлен
        if (viewportSetterRef.current) {
          window.removeEventListener('resize', viewportSetterRef.current);
        }
        
        // Отключаем обработчик кнопки "Назад"
        const backButton = window.Telegram?.WebApp?.BackButton;
        if (backButton && typeof backButton.offClick === 'function') {
          backButton.offClick();
        }
      } catch (error) {
        console.error('Ошибка при очистке ресурсов:', error);
      }
    };
  }, []);

  return null; // Компонент не рендерит ничего в DOM
}