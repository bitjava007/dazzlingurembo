export function createApiUrl(baseUrl: string, path: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(path, baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export interface ApiErrorData {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export function handleApiError(error: unknown): ApiErrorData {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return error as ApiErrorData;
  }
  if (error instanceof Error) {
    return { statusCode: 500, message: error.message };
  }
  return { statusCode: 500, message: 'An unexpected error occurred' };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
