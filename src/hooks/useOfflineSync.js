import { useEffect, useRef, useState } from 'react';
import useNetworkStatus from './useNetworkStatus';
import syncQueueService from '../services/syncQueueService';
import offlineStorageService from '../services/offlineStorageService';
import { hasActiveSession } from '../services/tokenStorage';

export default function useOfflineSync({ isLoggedIn, onSyncComplete, showMessage }) {
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      return;
    }

    // Jika transisi dari offline ke online saat ada sesi aktif
    if (wasOffline.current && isOnline && isLoggedIn && hasActiveSession()) {
      wasOffline.current = false;
      (async () => {
        setIsSyncing(true);
        try {
          const res = await syncQueueService.processSyncQueue();
          if (res && res.processed > 0) {
            showMessage?.(
              `Koneksi pulih. ${res.processed} perubahan berhasil disinkronkan ke server.`,
              'Sinkronisasi Selesai'
            );
            onSyncComplete?.();
          }
        } catch (err) {
          console.warn('[useOfflineSync] Gagal memproses sync queue:', err?.message || err);
        } finally {
          setIsSyncing(false);
        }
      })();
    }
  }, [isOnline, isLoggedIn, onSyncComplete, showMessage]);

  return {
    isOnline,
    isSyncing,
    hydrateLocalCache: offlineStorageService.getAllCaches,
    saveCache: offlineStorageService.saveCache,
    saveAllCaches: offlineStorageService.saveAllCaches,
  };
}
