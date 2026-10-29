/**
 * Token Storage Manager untuk Stoodify Mobile
 * Bebas dependensi eksternal, kompatibel dengan React Native & Expo runtime.
 */

let memoryTokens = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

const listeners = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener(memoryTokens);
    } catch {
      // Ignored
    }
  });
}

export function setTokens({ accessToken, refreshToken, user = null }) {
  if (accessToken !== undefined) memoryTokens.accessToken = accessToken;
  if (refreshToken !== undefined) memoryTokens.refreshToken = refreshToken;
  if (user !== undefined && user !== null) memoryTokens.user = user;

  // Coba persistensi jika runtime menyediakan localStorage
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      if (memoryTokens.accessToken) {
        globalThis.localStorage.setItem('stoodify_access_token', memoryTokens.accessToken);
      }
      if (memoryTokens.refreshToken) {
        globalThis.localStorage.setItem('stoodify_refresh_token', memoryTokens.refreshToken);
      }
      if (memoryTokens.user) {
        globalThis.localStorage.setItem('stoodify_user', JSON.stringify(memoryTokens.user));
      }
    }
  } catch {
    // Persistent storage tidak tersedia di native JS VM tanpa native module
  }

  notifyListeners();
}

export function getAccessToken() {
  if (memoryTokens.accessToken) return memoryTokens.accessToken;
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      const stored = globalThis.localStorage.getItem('stoodify_access_token');
      if (stored) {
        memoryTokens.accessToken = stored;
        return stored;
      }
    }
  } catch {
    // Ignored
  }
  return null;
}

export function getRefreshToken() {
  if (memoryTokens.refreshToken) return memoryTokens.refreshToken;
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      const stored = globalThis.localStorage.getItem('stoodify_refresh_token');
      if (stored) {
        memoryTokens.refreshToken = stored;
        return stored;
      }
    }
  } catch {
    // Ignored
  }
  return null;
}

export function getStoredUser() {
  if (memoryTokens.user) return memoryTokens.user;
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      const stored = globalThis.localStorage.getItem('stoodify_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryTokens.user = parsed;
        return parsed;
      }
    }
  } catch {
    // Ignored
  }
  return null;
}

export function clearTokens() {
  memoryTokens = {
    accessToken: null,
    refreshToken: null,
    user: null,
  };

  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      globalThis.localStorage.removeItem('stoodify_access_token');
      globalThis.localStorage.removeItem('stoodify_refresh_token');
      globalThis.localStorage.removeItem('stoodify_user');
    }
  } catch {
    // Ignored
  }

  notifyListeners();
}

export function hasActiveSession() {
  return Boolean(getAccessToken());
}

export function subscribeTokenChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export default {
  setTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  clearTokens,
  hasActiveSession,
  subscribeTokenChange,
};
