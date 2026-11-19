import * as SecureStore from 'expo-secure-store';

const KEYS = {
  access: 'stoodify_access_token',
  refresh: 'stoodify_refresh_token',
  user: 'stoodify_user',
};

let memoryTokens = { accessToken: null, refreshToken: null, user: null };
const listeners = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(memoryTokens));
}

export async function hydrateTokens() {
  try {
    const [accessToken, refreshToken, storedUser] = await Promise.all([
      SecureStore.getItemAsync(KEYS.access),
      SecureStore.getItemAsync(KEYS.refresh),
      SecureStore.getItemAsync(KEYS.user),
    ]);
    memoryTokens = {
      accessToken,
      refreshToken,
      user: storedUser ? JSON.parse(storedUser) : null,
    };
  } catch {
    memoryTokens = { accessToken: null, refreshToken: null, user: null };
  }
  notifyListeners();
  return memoryTokens;
}

export async function setTokensAsync({ accessToken, refreshToken, user } = {}) {
  if (accessToken !== undefined) memoryTokens.accessToken = accessToken;
  if (refreshToken !== undefined) memoryTokens.refreshToken = refreshToken;
  if (user !== undefined && user !== null) memoryTokens.user = user;
  const writes = [];
  if (accessToken !== undefined) writes.push(SecureStore.setItemAsync(KEYS.access, accessToken || ''));
  if (refreshToken !== undefined) writes.push(SecureStore.setItemAsync(KEYS.refresh, refreshToken || ''));
  if (user !== undefined && user !== null) writes.push(SecureStore.setItemAsync(KEYS.user, JSON.stringify(user)));
  try {
    await Promise.all(writes);
  } catch {}
  notifyListeners();
}

export function setTokens(payload) {
  setTokensAsync(payload).catch(() => {});
}

export const getAccessToken = () => memoryTokens.accessToken;
export const getRefreshToken = () => memoryTokens.refreshToken;
export const getStoredUser = () => memoryTokens.user;

export async function clearTokensAsync() {
  memoryTokens = { accessToken: null, refreshToken: null, user: null };
  try {
    await Promise.all(Object.values(KEYS).map((key) => SecureStore.deleteItemAsync(key)));
  } catch {}
  notifyListeners();
}

export function clearTokens() {
  clearTokensAsync().catch(() => {});
}

export const hasActiveSession = () => Boolean(memoryTokens.accessToken || memoryTokens.refreshToken);
export const subscribeTokenChange = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function getTokenExpiry(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = '';
    for (let i = 0; i < base64.length; i += 4) {
      const a = chars.indexOf(base64[i]);
      const b = chars.indexOf(base64[i + 1]);
      const c = chars.indexOf(base64[i + 2]);
      const d = chars.indexOf(base64[i + 3]);
      if (a === -1 || b === -1) break;
      const bitmap = (a << 18) | (b << 12) | ((c >= 0 ? c : 0) << 6) | (d >= 0 ? d : 0);
      str += String.fromCharCode((bitmap >> 16) & 255);
      if (c >= 0 && base64[i + 2] !== '=') str += String.fromCharCode((bitmap >> 8) & 255);
      if (d >= 0 && base64[i + 3] !== '=') str += String.fromCharCode(bitmap & 255);
    }
    const payload = JSON.parse(str);
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpiringSoon(thresholdSeconds = 120) {
  const token = memoryTokens.accessToken;
  if (!token) return true;
  const expiryMs = getTokenExpiry(token);
  if (!expiryMs) return false;
  return Date.now() + thresholdSeconds * 1000 >= expiryMs;
}

export default {
  hydrateTokens,
  setTokens,
  setTokensAsync,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  clearTokens,
  clearTokensAsync,
  hasActiveSession,
  subscribeTokenChange,
  getTokenExpiry,
  isTokenExpiringSoon,
};
