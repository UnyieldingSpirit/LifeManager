// src/hooks/useAppInit.ts
// ============================================================================
// LIFELEDGER — ХУК ИНИЦИАЛИЗАЦИИ ПРИЛОЖЕНИЯ
// ============================================================================

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  authService,
  metaService,
  ApiError,
  setApiToken,
} from '@/services';
import { tokenStorage } from '@/lib/api';
import type { UserDto } from '@/services/types';
import { useStore } from '@/store';

export type InitStatus = 'loading' | 'ready' | 'error';

// Маппинг UserDto (API) → поля стора
function applyUserToStore(user: UserDto) {
  const store = useStore.getState();

  store.updateProfile({
    id:        user.id,
    name:      user.profile.name,
    phone:     user.profile.phone,
    birthday:  user.profile.birthday,
    lifestyle: user.profile.lifestyle as any,
  });

  store.updateSettings(user.settings as any);
  store.updateFinance(user.finance);
  store.updateStats(user.stats);
  store.setOnboarded(user.isOnboarded);
  store.setTheme(user.settings.theme as any);
}

export function useAppInit() {
  const router = useRouter();
  const initialized = useRef(false);

  const [status, setStatus]             = useState<InitStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    init().catch((e) => {
      const msg = e instanceof ApiError ? e.message : 'Не удалось запустить приложение';
      setErrorMessage(msg);
      setStatus('error');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init() {
    // 1. Bootstrap справочников (некритично)
    try { await metaService.bootstrap('ru'); } catch { /* ok */ }

    // 2. Проверяем существующий токен
    const existingToken = tokenStorage.get();
    let user: UserDto | null = null;

    if (existingToken) {
      setApiToken(existingToken);
      try {
        const result = await authService.me();
        user = result.user;
      } catch (e) {
        if (!(e instanceof ApiError && e.code === 'UNAUTHORIZED')) throw e;
      }
    }

    // 3. Авторизация через Telegram
    if (!user) {
      const tg       = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
      const initData = tg?.initData;

      const authResult = await authService.loginTelegram(
        initData
          ? { initData }
          : { testUser: { id: 10001, first_name: 'Test', username: 'devuser' } }
      );
      user = authResult.user;

      if (user.settings.language !== 'ru') {
        try { await metaService.bootstrap(user.settings.language as any); } catch { /* ok */ }
      }
    }

    // 4. Применяем к стору
    applyUserToStore(user);

    // 5. Редирект
    if (!user.isOnboarded) {
      router.replace('/onboarding');
    } else {
      setStatus('ready');
    }
  }

  return { status, errorMessage };
}