// src/hooks/useAppInit.ts
// ============================================================================
// LIFELEDGER — ХУК ИНИЦИАЛИЗАЦИИ ПРИЛОЖЕНИЯ
// ============================================================================
// Вызывается один раз в корневом layout.
// Последовательность:
//   1. meta/bootstrap (справочники без авторизации)
//   2. auth/telegram (Telegram initData → JWT)
//   3. auth/me (проверка существующего токена)
//   4. Редирект: onboarding | home
// ============================================================================

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  authService,
  metaService,
  onboardingService,
  ApiError,
  setApiToken,
  tokenStorage,
} from '@/services';
import { useAppStore } from '@/store';

export type InitStatus = 'loading' | 'ready' | 'error';

export function useAppInit() {
  const router = useRouter();
  const initialized = useRef(false);

  const setUser = useAppStore((s) => s.setUser);
  const setBootstrap = useAppStore((s) => s.setBootstrap);

  const [status, setStatus] = useState<InitStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Запускаем только один раз (StrictMode defence)
    if (initialized.current) return;
    initialized.current = true;

    init().catch((e) => {
      const msg = e instanceof ApiError ? e.message : 'Не удалось запустить приложение';
      setErrorMessage(msg);
      setStatus('error');
    });
  }, []);

  async function init() {
    // ── 1. Bootstrap справочников (без авторизации, быстро) ──
    try {
      const bootstrap = await metaService.bootstrap('ru');
      setBootstrap?.(bootstrap);
    } catch {
      // Продолжаем без bootstrap — некритично
    }

    // ── 2. Пробуем существующий токен ──
    const existingToken = tokenStorage.get();
    let user = null;

    if (existingToken) {
      setApiToken(existingToken);
      try {
        const result = await authService.me();
        user = result.user;
      } catch (e) {
        // Токен невалиден — идём на полную авторизацию
        if (!(e instanceof ApiError && e.code === 'UNAUTHORIZED')) throw e;
      }
    }

    // ── 3. Авторизация через Telegram ──
    if (!user) {
      const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
      const initData = tg?.initData;

      const authResult = await authService.loginTelegram(
        initData
          ? { initData }
          // Dev fallback — только если initData нет (не в Telegram)
          : { testUser: { id: 10001, first_name: 'Test', username: 'devuser' } }
      );

      user = authResult.user;

      // Перезапрашиваем bootstrap с языком пользователя
      if (user.settings.language !== 'ru') {
        const bootstrap = await metaService.bootstrap(user.settings.language);
        setBootstrap?.(bootstrap);
      }
    }

    setUser?.(user);

    // ── 4. Редирект ──
    if (!user.isOnboarded) {
      router.replace('/onboarding');
    } else {
      setStatus('ready');
    }
  }

  return { status, errorMessage };
}