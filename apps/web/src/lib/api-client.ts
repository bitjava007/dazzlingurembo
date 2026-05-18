import { buildApiUrl, buildQueryString } from '@dazzling/utils';
import type { ApiResponse, PaginatedResponse } from '@dazzling/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, unknown>;
  body?: unknown;
}

class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers, ...rest } = options;

  const url =
    buildApiUrl(API_BASE_URL, path) + (params ? buildQueryString(params) : '');

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Attach auth token if available (client-side only)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message ?? 'An error occurred',
      data.errorCode,
    );
  }

  return data as T;
}

export const apiClient = {
  get<T>(path: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(path, { method: 'GET', params });
  },

  getPaginated<T>(
    path: string,
    params?: Record<string, unknown>,
  ): Promise<PaginatedResponse<T>> {
    return request<PaginatedResponse<T>>(path, { method: 'GET', params });
  },

  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(path, { method: 'POST', body });
  },

  put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(path, { method: 'PUT', body });
  },

  patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(path, { method: 'PATCH', body });
  },

  delete<T>(path: string): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(path, { method: 'DELETE' });
  },
};

export { ApiError };
