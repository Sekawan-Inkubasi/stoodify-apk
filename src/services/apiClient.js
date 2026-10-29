import { API_BASE_URL, API_TIMEOUT_MS } from '../constants/config';

/**
 * Native Fetch HTTP Client untuk Stoodify Mobile
 * Bebas dependensi eksternal, dilengkapi timeout dan penanganan error standar.
 */

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || API_TIMEOUT_MS);

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout (${API_TIMEOUT_MS}ms) ke ${url}`);
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    throw err;
  }
}

export const apiGet = (endpoint, options = {}) =>
  request(endpoint, { ...options, method: 'GET' });

export const apiPost = (endpoint, body, options = {}) =>
  request(endpoint, {
    ...options,
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

export const apiPut = (endpoint, body, options = {}) =>
  request(endpoint, {
    ...options,
    method: 'PUT',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

export const apiDelete = (endpoint, options = {}) =>
  request(endpoint, { ...options, method: 'DELETE' });

/**
 * Validasi konektivitas ke service backend Stoodify
 */
export async function healthCheck() {
  try {
    // Memeriksa root endpoint API (/api/)
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
  delete: apiDelete,
  healthCheck,
};
