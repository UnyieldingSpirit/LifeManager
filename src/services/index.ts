// src/services/index.ts
// ============================================================================
// LIFELEDGER — API SERVICES
// Все сервисы в одном файле: импортируй что нужно, не тащи лишнее.
// ============================================================================

import { apiGet, apiPost, apiPatch, apiPut, apiDelete, setApiToken, clearApiToken } from '@/lib/api';
import type {
  AuthResult,
  BootstrapData,
  CreateGoalPayload,
  CreateTransactionPayload,
  GoalDto,
  Lang,
  LocalizedMetaItem,
  OnboardingPayload,
  OnboardingStatus,
  TransactionDto,
  TransactionFilters,
  TransactionListResult,
  UpdateGoalPayload,
  UpdateTransactionPayload,
  UserDto,
  OnboardingPayload as ProfilePayload,
} from './types';

// ─── AUTH SERVICE ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Авторизация через Telegram WebApp.
   * initData берётся из window.Telegram.WebApp.initData (production)
   * или передаётся testUser (dev-режим).
   */
  async loginTelegram(params: {
    initData?: string;
    testUser?: { id: number; username?: string; first_name?: string; last_name?: string };
  }): Promise<AuthResult> {
    const result = await apiPost<AuthResult>('/auth/telegram', params);
    // Сохраняем токен сразу после успешного логина
    setApiToken(result.token);
    return result;
  },

  /** Получить текущего авторизованного пользователя */
  async me(): Promise<{ user: UserDto }> {
    return apiGet<{ user: UserDto }>('/auth/me');
  },

  /** Логаут (stateless JWT — чистим только на клиенте) */
  async logout(): Promise<void> {
    try {
      await apiPost('/auth/logout');
    } finally {
      clearApiToken();
    }
  },
};

// ─── ONBOARDING SERVICE ──────────────────────────────────────────────────────

export const onboardingService = {
  /** Текущий статус онбординга */
  async getStatus(): Promise<OnboardingStatus> {
    return apiGet<OnboardingStatus>('/onboarding');
  },

  /**
   * Сохранить данные онбординга.
   * Если isOnboarded станет true — редирект на главную.
   */
  async complete(payload: OnboardingPayload): Promise<{ user: UserDto }> {
    return apiPut<{ user: UserDto }>('/onboarding', payload);
  },
};

// ─── PROFILE SERVICE ──────────────────────────────────────────────────────────

export const profileService = {
  /** Полный профиль пользователя */
  async get(): Promise<{ user: UserDto }> {
    return apiGet<{ user: UserDto }>('/profile');
  },

  /** Обновить базовые данные профиля (имя, телефон, день рождения, аватар, lifestyle) */
  async updateProfile(payload: Partial<UserDto['profile']>): Promise<{ user: UserDto }> {
    return apiPatch<{ user: UserDto }>('/profile', payload);
  },

  /** Обновить настройки (тема, язык, модули, уведомления...) */
  async updateSettings(payload: Partial<UserDto['settings']>): Promise<{ settings: UserDto['settings'] }> {
    return apiPatch<{ settings: UserDto['settings'] }>('/profile/settings', payload);
  },

  /** Обновить финансовые настройки (валюта, бюджет, день зарплаты...) */
  async updateFinance(payload: Partial<UserDto['finance']>): Promise<{ finance: UserDto['finance'] }> {
    return apiPatch<{ finance: UserDto['finance'] }>('/profile/finance', payload);
  },

  /** Быстрая смена языка (также нужен перезапрос meta/bootstrap) */
  async updateLanguage(language: Lang): Promise<{ language: Lang }> {
    return apiPatch<{ language: Lang }>('/profile/language', { language });
  },
};

// ─── TRANSACTION SERVICE ──────────────────────────────────────────────────────

export const transactionService = {
  /** Список транзакций с фильтрами и пагинацией */
  async list(filters?: TransactionFilters): Promise<TransactionListResult> {
    return apiGet<TransactionListResult>('/transactions', { params: filters });
  },

  /** Создать транзакцию */
  async create(payload: CreateTransactionPayload): Promise<TransactionDto> {
    return apiPost<TransactionDto>('/transactions', payload);
  },

  /** Получить транзакцию по ID */
  async get(id: string): Promise<TransactionDto> {
    return apiGet<TransactionDto>(`/transactions/${id}`);
  },

  /** Обновить транзакцию */
  async update(id: string, payload: UpdateTransactionPayload): Promise<TransactionDto> {
    return apiPatch<TransactionDto>(`/transactions/${id}`, payload);
  },

  /** Удалить транзакцию */
  async delete(id: string): Promise<{ deleted: boolean }> {
    return apiDelete<{ deleted: boolean }>(`/transactions/${id}`);
  },

  // ─── Хелперы для часто используемых фильтров ─────────────────────────────

  /** Транзакции текущего месяца */
  async currentMonth(): Promise<TransactionListResult> {
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;
    return transactionService.list({ startDate, endDate, limit: 200 });
  },

  /** Последние N транзакций для отображения на главной */
  async recent(limit = 10): Promise<TransactionListResult> {
    return transactionService.list({ limit, page: 1 });
  },
};

// ─── GOAL SERVICE ─────────────────────────────────────────────────────────────

export const goalService = {
  /** Все цели пользователя */
  async list(): Promise<GoalDto[]> {
    return apiGet<GoalDto[]>('/goals');
  },

  /** Создать цель накопления */
  async create(payload: CreateGoalPayload): Promise<GoalDto> {
    return apiPost<GoalDto>('/goals', payload);
  },

  /** Получить цель по ID */
  async get(id: string): Promise<GoalDto> {
    return apiGet<GoalDto>(`/goals/${id}`);
  },

  /** Обновить цель */
  async update(id: string, payload: UpdateGoalPayload): Promise<GoalDto> {
    return apiPatch<GoalDto>(`/goals/${id}`, payload);
  },

  /** Удалить цель */
  async delete(id: string): Promise<{ deleted: boolean }> {
    return apiDelete<{ deleted: boolean }>(`/goals/${id}`);
  },

  /** Пополнить накопление цели */
  async contribute(id: string, amount: number): Promise<GoalDto> {
    return apiPost<GoalDto>(`/goals/${id}/contribute`, { amount });
  },
};

// ─── META SERVICE ─────────────────────────────────────────────────────────────

export const metaService = {
  /**
   * Bootstrap — все справочники за один запрос.
   * Вызывать при старте приложения и при смене языка.
   */
  async bootstrap(lang: Lang = 'ru'): Promise<BootstrapData> {
    return apiGet<BootstrapData>('/meta/bootstrap', { params: { lang } });
  },

  async languages(): Promise<LocalizedMetaItem[]> {
    return apiGet<LocalizedMetaItem[]>('/meta/languages');
  },

  async currencies(lang?: Lang): Promise<LocalizedMetaItem[]> {
    return apiGet<LocalizedMetaItem[]>('/meta/currencies', { params: { lang } });
  },

  async categories(params?: { type?: 'income' | 'expense'; lang?: Lang }): Promise<
    LocalizedMetaItem[] | { expense: LocalizedMetaItem[]; income: LocalizedMetaItem[] }
  > {
    return apiGet('/meta/categories', { params });
  },

  async goalTemplates(lang?: Lang): Promise<LocalizedMetaItem[]> {
    return apiGet<LocalizedMetaItem[]>('/meta/goal-templates', { params: { lang } });
  },

  async lifestyles(lang?: Lang): Promise<LocalizedMetaItem[]> {
    return apiGet<LocalizedMetaItem[]>('/meta/lifestyles', { params: { lang } });
  },

  async notificationOptions(lang?: Lang): Promise<LocalizedMetaItem[]> {
    return apiGet<LocalizedMetaItem[]>('/meta/notification-options', { params: { lang } });
  },
};

// ─── Re-exports ───────────────────────────────────────────────────────────────

export * from './types';
export { setApiToken, clearApiToken, ApiError } from '@/lib/api';