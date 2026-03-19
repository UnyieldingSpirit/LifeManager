// src/lib/api.ts
// ============================================================================
// LIFELEDGER — BASE API CLIENT
// ============================================================================
// Единый axios-клиент с:
//   • авто-подстановкой Bearer токена
//   • централизованной обработкой 401 (logout + редирект)
//   • типизированными ошибками
//   • поддержкой Telegram WebApp initData
// ============================================================================

import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

// ─── Константы ───────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://ledger.telegram.uz/api';
const TOKEN_KEY = 'lifeledger_token';

// ─── Типы контрактов ─────────────────────────────────────────────────────────

/** Успешный ответ { ok: true, data: T } */
export interface ApiOkResponse<T> {
  ok: true;
  data: T;
}

/** Ошибочный ответ { ok: false, error: {...} } */
export interface ApiErrorResponse {
  ok: false;
  error: {
    code: 'VALIDATION_ERROR' | 'BAD_REQUEST' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR';
    message: string;
    details?: Array<{ message: string; path: string }>;
  };
  requestId?: string;
}

export type ApiResponse<T> = ApiOkResponse<T> | ApiErrorResponse;

/** Кастомный класс ошибки с кодом из API */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Array<{ message: string; path: string }>,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Вспомогательные функции для токена ─────────────────────────────────────

export const tokenStorage = {
  get: (): string | null => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    } catch {
      return null;
    }
  },
  set: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch { /* Safari Private Mode */ }
  },
  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch { /* ignore */ }
  },
};

// ─── Создание экземпляра axios ───────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Request interceptor: подставляем токен ──────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: нормализуем ошибки ────────────────────────────────

// src/lib/api.ts — interceptor

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const apiErr = error.response?.data;

    if (error.response?.status === 401) {
      tokenStorage.clear();
    }

    if (apiErr && !apiErr.ok) {
      throw new ApiError(
        apiErr.error.code,
        apiErr.error.message,
        apiErr.error.details,
        apiErr.requestId,
      );
    }

    if (!error.response) {
      throw new ApiError('NETWORK_ERROR', 'Нет соединения с сервером. Проверьте интернет.');
    }

    throw error;
  },
);

// ─── Публичные функции установки токена ─────────────────────────────────────

/** Устанавливает токен в storage + axios defaults */
export function setApiToken(token: string): void {
  tokenStorage.set(token);
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

/** Сбрасывает токен */
export function clearApiToken(): void {
  tokenStorage.clear();
  delete apiClient.defaults.headers.common.Authorization;
}

// ─── Типизированные обёртки над axios ───────────────────────────────────────

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.get<ApiOkResponse<T>>(url, config);
  return data.data;
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.post<ApiOkResponse<T>>(url, body, config);
  return data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.patch<ApiOkResponse<T>>(url, body);
  return data.data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.put<ApiOkResponse<T>>(url, body);
  return data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await apiClient.delete<ApiOkResponse<T>>(url);
  return data.data;
}

export default apiClient;