import AsyncStorage from './asyncStorageAdapter';

const CACHE_KEYS = {
  tasks: 'stoodify_cache_tasks',
  subjects: 'stoodify_cache_subjects',
  schedules: 'stoodify_cache_schedules',
  sessions: 'stoodify_cache_sessions',
  predictions: 'stoodify_cache_predictions',
  stats: 'stoodify_cache_stats',
  notifications: 'stoodify_cache_notifications',
  syncQueue: 'stoodify_sync_queue',
};

export async function saveCache(domain, data) {
  const key = CACHE_KEYS[domain];
  if (!key) return;
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data ?? null));
  } catch (error) {
    console.warn(`[offlineStorageService] Gagal menyimpan cache ${domain}:`, error?.message || error);
  }
}

export async function getCache(domain, defaultValue = null) {
  const key = CACHE_KEYS[domain];
  if (!key) return defaultValue;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultValue;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[offlineStorageService] Gagal membaca cache ${domain}:`, error?.message || error);
    return defaultValue;
  }
}

export async function saveAllCaches(payload = {}) {
  const entries = Object.entries(payload);
  const items = [];
  entries.forEach(([domain, data]) => {
    const key = CACHE_KEYS[domain];
    if (key && data !== undefined) {
      items.push([key, JSON.stringify(data ?? null)]);
    }
  });
  if (!items.length) return;
  try {
    await AsyncStorage.multiSet(items);
  } catch (error) {
    console.warn('[offlineStorageService] Gagal multiSet cache:', error?.message || error);
  }
}

export async function getAllCaches() {
  const keys = Object.values(CACHE_KEYS).filter((k) => k !== CACHE_KEYS.syncQueue);
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result = {};
    pairs.forEach(([k, v]) => {
      const domain = Object.keys(CACHE_KEYS).find((d) => CACHE_KEYS[d] === k);
      if (domain) {
        try {
          result[domain] = v ? JSON.parse(v) : null;
        } catch {
          result[domain] = null;
        }
      }
    });
    return result;
  } catch (error) {
    console.warn('[offlineStorageService] Gagal multiGet cache:', error?.message || error);
    return {};
  }
}

export async function clearAllCache() {
  const keys = Object.values(CACHE_KEYS);
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.warn('[offlineStorageService] Gagal menghapus cache:', error?.message || error);
  }
}

export default {
  saveCache,
  getCache,
  saveAllCaches,
  getAllCaches,
  clearAllCache,
};
