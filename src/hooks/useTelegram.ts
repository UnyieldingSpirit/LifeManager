// src/hooks/useTelegram.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    start_param?: string;
  };
  version: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showPopup: (params: any, callback?: (id: string) => void) => void;
  sendData: (data: string) => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  BackButton?: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback?: () => void) => void;
  };
  MainButton?: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback?: () => void) => void;
  };
  platform: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
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
            tg.HapticFeedback.impactOccurred((style as any) || 'medium');
            break;
          case 'notification':
            tg.HapticFeedback.notificationOccurred((style as any) || 'success');
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