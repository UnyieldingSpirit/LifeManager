// src/store/apiActions.ts
// ============================================================================
// LIFELEDGER — ASYNC API ACTIONS
// ============================================================================
// Правила:
//   1. НЕТ optimistic UI для создания — только после ответа сервера
//   2. После любого CUD (create/update/delete) → sync с сервера (источник правды)
//   3. setTransactions/setGoals — атомарная замена (один set, без циклов)
//   4. Баланс берётся из summary сервера, не считается вручную
// ============================================================================

import { useStore } from './index';
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
} from '@/services';
import { tokenStorage } from '@/lib/api';
import type {
  CreateTransactionPayload,
  UpdateTransactionPayload,
  CreateGoalPayload,
  UpdateGoalPayload,
  OnboardingPayload,
  Lang,
  UserDto,
} from '@/services/types';

// ─── УТИЛИТА: маппинг UserDto → стор ─────────────────────────────────────────

export function applyUserToStore(user: UserDto) {
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
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function loginViaTelegram(): Promise<void> {
  const initData = typeof window !== 'undefined'
    ? window.Telegram?.WebApp?.initData
    : undefined;

  const result = await authService.loginTelegram(
    initData
      ? { initData }
      : { testUser: { id: 10001, username: 'dev_user', first_name: 'Dev' } }
  );

  setApiToken(result.token);
  applyUserToStore(result.user);
}

export async function logout(): Promise<void> {
  await authService.logout();
  clearApiToken();
  useStore.getState().resetStore();
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

export async function completeOnboarding(payload: OnboardingPayload): Promise<void> {
  const { user } = await onboardingService.complete(payload);
  applyUserToStore(user);
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export async function updateProfileSettings(
  settings: Parameters<typeof profileService.updateSettings>[0]
): Promise<void> {
  const { settings: updated } = await profileService.updateSettings(settings);
  useStore.getState().updateSettings(updated as any);
}

export async function updateProfileFinance(
  finance: Parameters<typeof profileService.updateFinance>[0]
): Promise<void> {
  const { finance: updated } = await profileService.updateFinance(finance);
  useStore.getState().updateFinance(updated);
}

export async function changeLanguage(language: Lang): Promise<void> {
  await profileService.updateLanguage(language);
  useStore.getState().setLanguage(language as any);
  try { await metaService.bootstrap(language); } catch { /* ok */ }
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

/**
 * Загружает/синхронизирует транзакции с сервера → стор.
 * Атомарная замена через setTransactions — один ре-рендер.
 */
export async function syncTransactions(
  filters?: Parameters<typeof transactionService.list>[0]
): Promise<void> {
  const result = await transactionService.list(filters);
  const store  = useStore.getState();

  // Один вызов set() — один ре-рендер, никаких дублей
  store.setTransactions(result.items as any);

  if (result.summary) {
    store.updateStats({
      currentBalance: result.summary.balance,
      totalIncome:    result.summary.income,
      totalExpenses:  result.summary.expenses,
    });
  }
}

/**
 * Создать транзакцию.
 * НЕТ optimistic UI — ждём ответа сервера, потом синхронизируем список.
 * Это исключает дубли.
 */
export async function createTransactionApi(payload: CreateTransactionPayload): Promise<void> {
  await transactionService.create(payload);
  // После создания — берём свежий список с сервера (источник правды)
  await syncTransactions({ limit: 200 });
}

/**
 * Удалить транзакцию.
 * Optimistic: убираем из UI сразу, при ошибке — восстанавливаем sync.
 */
export async function deleteTransactionApi(id: string): Promise<void> {
  const store = useStore.getState();

  // Optimistic: убираем сразу для мгновенного отклика
  const backup = store.transactions.find(t => t.id === id);
  store.deleteTransaction(id);

  try {
    await transactionService.delete(id);
    // После удаления синхронизируем summary (баланс)
    const result = await transactionService.list({ limit: 200 });
    store.setTransactions(result.items as any);
    if (result.summary) {
      store.updateStats({
        currentBalance: result.summary.balance,
        totalIncome:    result.summary.income,
        totalExpenses:  result.summary.expenses,
      });
    }
  } catch (error) {
    // Откат: возвращаем удалённую запись
    if (backup) {
      store.addTransaction(backup as any);
    }
    throw error;
  }
}

// ─── GOALS ────────────────────────────────────────────────────────────────────

/**
 * Загружает/синхронизирует цели с сервера → стор.
 * Атомарная замена через setGoals.
 */
export async function syncGoals(): Promise<void> {
  const goals = await goalService.list();
  useStore.getState().setGoals(goals as any);
}

/**
 * Создать цель — ждём сервер, потом синхронизируем.
 */
export async function createGoalApi(payload: CreateGoalPayload): Promise<void> {
  await goalService.create(payload);
  await syncGoals();
}

export async function updateGoalApi(id: string, payload: UpdateGoalPayload): Promise<void> {
  const updated = await goalService.update(id, payload);
  useStore.getState().updateGoal(id, updated as any);
}

/**
 * Удалить цель — optimistic, при ошибке sync.
 */
export async function deleteGoalApi(id: string): Promise<void> {
  const store  = useStore.getState();
  const backup = store.goals.find(g => g.id === id);
  store.deleteGoal(id); // optimistic

  try {
    await goalService.delete(id);
  } catch (error) {
    if (backup) store.addGoal(backup as any); // откат
    throw error;
  }
}

/**
 * Пополнить цель — сервер возвращает обновлённую цель, применяем точечно.
 */
export async function contributeToGoalApi(id: string, amount: number): Promise<void> {
  const updated = await goalService.contribute(id, amount);
  useStore.getState().updateGoal(id, updated as any);
}

// Re-exports
export { ApiError, setApiToken, clearApiToken, tokenStorage };