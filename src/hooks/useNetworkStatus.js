import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

let currentNetworkStatus = {
  isConnected: true,
  isInternetReachable: true,
  isOnline: true,
};

const listeners = new Set();

function updateStatus(state) {
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
  if (!netInfoUnsubscribe) {
    netInfoUnsubscribe = NetInfo.addEventListener(updateStatus);
    NetInfo.fetch().then(updateStatus).catch(() => {});
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
    checkConnection: () => NetInfo.fetch().then((s) => {
      updateStatus(s);
      return currentNetworkStatus;
    }),
  };
}
