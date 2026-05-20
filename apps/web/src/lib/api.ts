import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Tracks an in-flight refresh so concurrent 401s don't fire multiple refreshes.
let refreshPromise: Promise<string> | null = null;

function clearAuthAndRedirect() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  // Also wipe the Zustand-persisted auth state so the store starts clean.
  localStorage.removeItem('auth-storage');
  window.location.href = '/login';
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (typeof window === 'undefined') return Promise.reject(error);

    const status: number | undefined = error.response?.status;
    const requestUrl: string = error.config?.url ?? '';

    // Never interfere with auth endpoints or non-401 errors.
    if (status !== 401 || requestUrl.includes('/auth/')) {
      return Promise.reject(error);
    }

    // Already tried once on this request — give up to avoid a loop.
    if (error.config._authRetry) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // Coalesce concurrent 401s into a single refresh request.
    if (!refreshPromise) {
      refreshPromise = axios
        .post<{ accessToken: string }>(`${API_URL}/auth/refresh`, { refreshToken })
        .then((r) => r.data.accessToken)
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const newAccessToken = await refreshPromise;
      localStorage.setItem('auth_token', newAccessToken);

      // Persist the new token in the Zustand store without importing the store
      // directly — parse and rewrite the persisted JSON so the store rehydrates
      // correctly on the next render cycle.
      try {
        const stored = JSON.parse(localStorage.getItem('auth-storage') ?? '{}');
        if (stored.state) {
          stored.state.accessToken = newAccessToken;
          localStorage.setItem('auth-storage', JSON.stringify(stored));
        }
      } catch {
        // Non-fatal: the request will still retry with the new token.
      }

      error.config._authRetry = true;
      error.config.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(error.config);
    } catch {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }
  },
);

export default api;
