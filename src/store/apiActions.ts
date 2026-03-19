// src/store/apiActions.ts
// ============================================================================
// LIFELEDGER — ASYNC API ACTIONS ДЛЯ ZUSTAND СТОРА
// ============================================================================
// Подключается к основному store/index.ts как дополнительный слой.
// Паттерн: вызов API → обновление стора → return данных.
// При ошибке — пробрасывает ApiError, который ловится в компоненте.
// ============================================================================

import { useAppStore } from './index'; // твой основной стор
import {
  authService,
  onboardingService,
  profileService,
  transactionService,
  goalService,
  metaService,
  ApiError,
  setApiToken,
  clearApiToken,
  tokenStorage,
} from '@/services';
import type {
  CreateTransactionPayload,
  UpdateTransactionPayload,
  CreateGoalPayload,
  UpdateGoalPayload,
  OnboardingPayload,
  Lang,
} from '@/services/types';

// ─── ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ─────────────────────────────────────────────────

/**
 * Вызывается один раз при старте приложения (в layout.tsx или providers.tsx).
 * Последовательность:
 *   1. Загружаем meta/bootstrap (справочники для UI)
 *   2. Аутентифицируемся через Telegram
 *   3. Если isOnboarded=false → редирект на онбординг
 *   4. Если isOnboarded=true → загружаем профиль + данные
 */
export async function initApp(): Promise<void> {
  const store = useAppStore.getState();

  try {
    // 1. Bootstrap справочников (не требует auth)
    const lang = store.profile?.settings?.language ?? 'ru';
    const bootstrap = await metaService.bootstrap(lang as Lang);
    store.setBootstrap?.(bootstrap); // если в сторе есть такой экшн

    // 2. Авторизация
    const existingToken = tokenStorage.get();

    if (existingToken) {
      // Уже есть токен — проверяем через /auth/me
      try {
        const { user } = await authService.me();
        store.setUser?.(user);
      } catch (e) {
        if (e instanceof ApiError && e.code === 'UNAUTHORIZED') {
          // Токен протух → переавторизуемся
          await loginViaTelegram();
        } else {
          throw e;
        }
      }
    } else {
      await loginViaTelegram();
    }

    // 3. Проверяем онбординг
    const currentUser = useAppStore.getState().profile;
    if (!currentUser?.isOnboarded) {
      // Редирект обрабатывается в компоненте через useEffect + router.push
      return;
    }

    // 4. Загружаем рабочие данные параллельно
    await Promise.all([
      syncTransactions(),
      syncGoals(),
    ]);
  } catch (error) {
    console.error('[initApp] Ошибка инициализации:', error);
    throw error;
  }
}

// ─── AUTH ACTIONS ─────────────────────────────────────────────────────────────

export async function loginViaTelegram(): Promise<void> {
  const store = useAppStore.getState();

  // Получаем initData из Telegram WebApp
  const initData = typeof window !== 'undefined'
    ? window.Telegram?.WebApp?.initData
    : undefined;

  const result = await authService.loginTelegram(
    initData
      ? { initData }
      : { testUser: { id: 10001, username: 'dev_user', first_name: 'Dev' } }
  );

  setApiToken(result.token);
  store.setUser?.(result.user);
}

export async function logout(): Promise<void> {
  const store = useAppStore.getState();
  await authService.logout();
  clearApiToken();
  store.resetAll?.();
}

// ─── ONBOARDING ACTIONS ───────────────────────────────────────────────────────

export async function completeOnboarding(payload: OnboardingPayload): Promise<void> {
  const { user } = await onboardingService.complete(payload);
  useAppStore.getState().setUser?.(user);
}

// ─── PROFILE ACTIONS ──────────────────────────────────────────────────────────

export async function updateSettings(
  settings: Partial<Parameters<typeof profileService.updateSettings>[0]>
): Promise<void> {
  const { settings: updated } = await profileService.updateSettings(settings);
  useAppStore.getState().updateSettings?.(updated);
}

export async function changeLanguage(language: Lang): Promise<void> {
  const store = useAppStore.getState();

  // 1. Меняем язык на сервере
  await profileService.updateLanguage(language);
  store.setLanguage?.(language);

  // 2. Перезагружаем справочники для нового языка
  const bootstrap = await metaService.bootstrap(language);
  store.setBootstrap?.(bootstrap);
}

// ─── TRANSACTION ACTIONS ──────────────────────────────────────────────────────

/**
 * Синхронизирует транзакции с API → записывает в стор.
 * Вызывать при загрузке страницы Finance и после изменений.
 */
export async function syncTransactions(
  filters?: Parameters<typeof transactionService.list>[0]
): Promise<void> {
  const result = await transactionService.list(filters);
  useAppStore.getState().setTransactions?.(result.items);
  useAppStore.getState().setTransactionSummary?.(result.summary);
}

/**
 * Создать транзакцию с optimistic UI.
 * Сразу обновляем стор (оптимистично), потом подтверждаем/откатываем.
 */
export async function createTransaction(payload: CreateTransactionPayload): Promise<void> {
  const store = useAppStore.getState();

  // Optimistic update: временная транзакция с placeholder ID
  const tempId = `temp_${Date.now()}`;
  const optimistic = {
    ...payload,
    id: tempId,
    userId: store.profile?.id ?? '',
    isRecurring: payload.isRecurring ?? false,
    tags: payload.tags ?? [],
    notes: payload.notes ?? '',
    description: payload.description ?? '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addTransactionOptimistic?.(optimistic);

  try {
    const real = await transactionService.create(payload);
    // Заменяем временную транзакцию реальной
    store.replaceTransaction?.(tempId, real);
    // Обновляем статистику (баланс)
    await syncTransactions();
  } catch (error) {
    // Откат optimistic update
    store.removeTransaction?.(tempId);
    throw error;
  }
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionPayload
): Promise<void> {
  const updated = await transactionService.update(id, payload);
  useAppStore.getState().updateTransactionInStore?.(id, updated);
  await syncTransactions();
}

export async function deleteTransaction(id: string): Promise<void> {
  // Optimistic: сразу убираем из UI
  useAppStore.getState().removeTransaction?.(id);
  try {
    await transactionService.delete(id);
    await syncTransactions();
  } catch (error) {
    // Откат: перезагружаем список
    await syncTransactions();
    throw error;
  }
}

// ─── GOAL ACTIONS ─────────────────────────────────────────────────────────────

export async function syncGoals(): Promise<void> {
  const goals = await goalService.list();
  useAppStore.getState().setGoals?.(goals);
}

export async function createGoal(payload: CreateGoalPayload): Promise<void> {
  const goal = await goalService.create(payload);
  useAppStore.getState().addGoal?.(goal);
}

export async function updateGoal(id: string, payload: UpdateGoalPayload): Promise<void> {
  const updated = await goalService.update(id, payload);
  useAppStore.getState().updateGoalInStore?.(id, updated);
}

export async function deleteGoal(id: string): Promise<void> {
  useAppStore.getState().removeGoal?.(id); // optimistic
  try {
    await goalService.delete(id);
  } catch {
    await syncGoals(); // откат
    throw new Error('Не удалось удалить цель');
  }
}

export async function contributeToGoal(id: string, amount: number): Promise<void> {
  const updated = await goalService.contribute(id, amount);
  useAppStore.getState().updateGoalInStore?.(id, updated);
}