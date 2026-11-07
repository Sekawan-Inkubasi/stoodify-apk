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

export function setTokens({ accessToken, refreshToken, user } = {}) {
  if (accessToken !== undefined) memoryTokens.accessToken = accessToken;
  if (refreshToken !== undefined) memoryTokens.refreshToken = refreshToken;
  if (user !== undefined && user !== null) memoryTokens.user = user;
  const writes = [];
  if (accessToken !== undefined) writes.push(SecureStore.setItemAsync(KEYS.access, accessToken || ''));
  if (refreshToken !== undefined) writes.push(SecureStore.setItemAsync(KEYS.refresh, refreshToken || ''));
  if (user !== undefined && user !== null) writes.push(SecureStore.setItemAsync(KEYS.user, JSON.stringify(user)));
  Promise.all(writes).catch(() => {});
  notifyListeners();
}

export const getAccessToken = () => memoryTokens.accessToken;
export const getRefreshToken = () => memoryTokens.refreshToken;
export const getStoredUser = () => memoryTokens.user;

export function clearTokens() {
  memoryTokens = { accessToken: null, refreshToken: null, user: null };
  Promise.all(Object.values(KEYS).map((key) => SecureStore.deleteItemAsync(key))).catch(() => {});
  notifyListeners();
}

export const hasActiveSession = () => Boolean(memoryTokens.accessToken);
export const subscribeTokenChange = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export default { hydrateTokens, setTokens, getAccessToken, getRefreshToken, getStoredUser, clearTokens, hasActiveSession, subscribeTokenChange };
