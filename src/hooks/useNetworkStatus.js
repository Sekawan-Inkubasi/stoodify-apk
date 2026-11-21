import { useEffect, useState } from 'react';
import { NativeModules, TurboModuleRegistry } from 'react-native';

let NetInfo = null;
try {
  if (NativeModules?.RNCNetInfo || TurboModuleRegistry?.get?.('RNCNetInfo')) {
    const raw = require('@react-native-community/netinfo');
    NetInfo = raw?.default || raw;
  }
} catch {
  NetInfo = null;
}

let currentNetworkStatus = {
  isConnected: true,
  isInternetReachable: true,
  isOnline: true,
};

const listeners = new Set();

function updateStatus(state) {
  if (!state) return;
  const isConnected = Boolean(state.isConnected);
  const isInternetReachable = state.isInternetReachable;
  const isOnline = Boolean(isConnected && isInternetReachable !== false);

  currentNetworkStatus = {
    isConnected,
    isInternetReachable,
    isOnline,
  };

  listeners.forEach((listener) => {
    try {
      listener(currentNetworkStatus);
    } catch {}
  });
}

// Global subscriber untuk NetInfo (dimulai sekali)
let netInfoUnsubscribe = null;
function ensureGlobalListener() {
  if (!NetInfo) return;
  if (!netInfoUnsubscribe) {
    try {
      netInfoUnsubscribe = NetInfo.addEventListener(updateStatus);
      NetInfo.fetch().then(updateStatus).catch(() => {});
    } catch {
      netInfoUnsubscribe = null;
    }
  }
}

export function getNetworkStatus() {
  ensureGlobalListener();
  return currentNetworkStatus;
}

export function isDeviceOnline() {
  ensureGlobalListener();
  return currentNetworkStatus.isOnline;
}

export default function useNetworkStatus() {
  const [status, setStatus] = useState(currentNetworkStatus);

  useEffect(() => {
    ensureGlobalListener();
    setStatus(currentNetworkStatus);

    const handler = (newStatus) => {
      setStatus(newStatus);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    ...status,
    isOnline: status.isOnline,
    checkConnection: () => {
      if (!NetInfo?.fetch) return Promise.resolve(currentNetworkStatus);
      return NetInfo.fetch()
        .then((s) => {
          updateStatus(s);
          return currentNetworkStatus;
        })
        .catch(() => currentNetworkStatus);
    },
  };
}
