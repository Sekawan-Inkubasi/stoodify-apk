import { API_BASE_URL, API_TIMEOUT_MS } from '../constants/config';
import { ENDPOINTS } from '../constants/apiEndpoints';
import {
  getAccessToken,
  getRefreshToken,
  setTokensAsync,
  clearTokensAsync,
  isTokenExpiringSoon,
} from './tokenStorage';

/**
 * Native Fetch HTTP Client untuk Stoodify Mobile
 * Dilengkapi timeout, Bearer Auth injection, auto-refresh JWT (401), dan query helper.
 */

let refreshPromise = null;

function isPublicAuthEndpoint(endpoint) {
  const normalized = (endpoint || '').toLowerCase();
  return (
    normalized.includes('/auth/login') ||
    normalized.includes('/auth/register') ||
    normalized.includes('/auth/refresh') ||
    normalized.includes('/auth/password-reset')
  );
}

export async function performTokenRefresh() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      await clearTokensAsync();
      return null;
    }

    try {
      const refreshPath = ENDPOINTS.AUTH_REFRESH.replace(/^\/+/, '');
      const url = `${API_BASE_URL.replace(/\/+$/, '')}/${refreshPath}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success && data?.data?.access_token) {
        await setTokensAsync({
          accessToken: data.data.access_token,
          refreshToken: data.data.refresh_token || refreshToken,
        });
        return data.data.access_token;
      }

      // Hanya hapus sesi jika backend secara eksplisit menyatakan refresh token tidak valid / revoked (401 / 403)
      if (response.status === 401 || response.status === 403) {
        await clearTokensAsync();
      }
      return null;
    } catch {
      // Gangguan jaringan sementara (timeout / offline) — jangan hapus token agar sesi tidak terputus paksa
      return null;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function request(endpoint, options = {}) {
  // Penyegaran proaktif: jika access token mendekati kedaluwarsa (<90s), segarkan sebelum request dikirim
  if (!options._retry && !isPublicAuthEndpoint(endpoint) && isTokenExpiringSoon(90) && getRefreshToken()) {
    await performTokenRefresh();
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

  const controller = new AbortController();
  const timeoutMs = options.timeout || API_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = getAccessToken();
  const isMultipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Tangani 401 Unauthorized dengan Refresh Token (kecuali endpoint auth publik)
    if (response.status === 401 && !options._retry && !isPublicAuthEndpoint(endpoint)) {
      const newAccessToken = await performTokenRefresh();
      if (newAccessToken) {
        return request(endpoint, {
          ...options,
          _retry: true,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      }
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data?.message) ||
        `HTTP Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      error.errors = data?.errors || null;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout (${timeoutMs}ms) ke ${url}`);
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    throw err;
  }
}

export const apiGet = (endpoint, queryParams = {}, options = {}) => {
  const queryKeys = Object.keys(queryParams).filter(
    (key) => queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== ''
  );
  const queryString = queryKeys.length
    ? `?${queryKeys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`).join('&')}`
    : '';
  return request(`${endpoint}${queryString}`, { ...options, method: 'GET' });
};

export const apiPost = (endpoint, body = {}, options = {}) =>
  request(endpoint, {
    ...options,
    method: 'POST',
    body: typeof body === 'string' || (typeof FormData !== 'undefined' && body instanceof FormData) ? body : JSON.stringify(body),
  });

export const apiPut = (endpoint, body = {}, options = {}) =>
  request(endpoint, {
    ...options,
    method: 'PUT',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

export const apiPatch = (endpoint, body = {}, options = {}) =>
  request(endpoint, {
    ...options,
    method: 'PATCH',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

export const apiDelete = (endpoint, options = {}) =>
  request(endpoint, { ...options, method: 'DELETE' });

export async function healthCheck() {
  try {
    const result = await apiGet('');
    return {
      connected: true,
      baseUrl: API_BASE_URL,
      data: result,
    };
  } catch (err) {
    return {
      connected: false,
      baseUrl: API_BASE_URL,
      error: err.message,
    };
  }
}

export default {
  request,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  healthCheck,
};
