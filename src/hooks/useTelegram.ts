// src/hooks/useTelegram.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TelegramWebApp, TelegramUser } from '@/types/telegram';

export function useTelegram() {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp as TelegramWebApp;
      setTg(webApp);

      if (webApp.initDataUnsafe?.user) {
        setUser(webApp.initDataUnsafe.user);
      }

      // Tell Telegram the app is ready
      webApp.ready();
      
      // Expand to full height
      webApp.expand();

      setIsReady(true);
    } else {
      setIsReady(true); // Ready but without Telegram
    }
  }, []);

  const isTelegram = !!tg;

  const hapticFeedback = useCallback(
    (type: 'impact' | 'notification' | 'selection', style?: string) => {
      if (!tg?.HapticFeedback) return false;

      try {
        switch (type) {
          case 'impact':
            tg.HapticFeedback.impactOccurred((style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') || 'medium');
            break;
          case 'notification':
            tg.HapticFeedback.notificationOccurred((style as 'error' | 'success' | 'warning') || 'success');
            break;
          case 'selection':
            tg.HapticFeedback.selectionChanged();
            break;
        }
        return true;
      } catch {
        return false;
      }
    },
    [tg]
  );

  const showAlert = useCallback(
    (message: string, callback?: () => void) => {
      if (tg) {
        tg.showAlert(message, callback);
        return true;
      }
      alert(message);
      callback?.();
      return false;
    },
    [tg]
  );

  const showConfirm = useCallback(
    (message: string, callback?: (confirmed: boolean) => void) => {
      if (tg) {
        tg.showConfirm(message, callback);
        return true;
      }
      const result = confirm(message);
      callback?.(result);
      return false;
    },
    [tg]
  );

  const colorScheme = tg?.colorScheme || 'light';

  return {
    tg,
    user,
    isReady,
    isTelegram,
    hapticFeedback,
    showAlert,
    showConfirm,
    colorScheme,
  };
}