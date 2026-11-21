import { NativeModules, TurboModuleRegistry } from 'react-native';

const memoryStore = new Map();

const memoryStorageFallback = {
  getItem: async (key) => memoryStore.get(key) ?? null,
  setItem: async (key, val) => {
    memoryStore.set(key, String(val));
  },
  removeItem: async (key) => {
    memoryStore.delete(key);
  },
  multiGet: async (keys) => keys.map((k) => [k, memoryStore.get(k) ?? null]),
  multiSet: async (pairs) => {
    pairs.forEach(([k, v]) => memoryStore.set(k, String(v)));
  },
  multiRemove: async (keys) => {
    keys.forEach((k) => memoryStore.delete(k));
  },
  clear: async () => {
    memoryStore.clear();
  },
};

let storage = memoryStorageFallback;

try {
  const hasNative = Boolean(
    NativeModules?.RNCAsyncStorage ||
    NativeModules?.PlatformLocalStorage ||
    TurboModuleRegistry?.get?.('RNCAsyncStorage')
  );
  if (hasNative) {
    const raw = require('@react-native-async-storage/async-storage');
    storage = raw?.default || raw || memoryStorageFallback;
  }
} catch {
  storage = memoryStorageFallback;
}

export default storage;
