import AsyncStorage from '@react-native-async-storage/async-storage';
import * as tasksApi from './taskService';
import * as schedulesApi from './scheduleService';
import * as sessionsApi from './studySessionService';

const QUEUE_KEY = 'stoodify_sync_queue';
let isProcessing = false;

export async function getQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('[syncQueueService] Gagal membaca sync queue:', error?.message || error);
    return [];
  }
}

export async function saveQueue(queue) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue || []));
  } catch (error) {
    console.warn('[syncQueueService] Gagal menyimpan sync queue:', error?.message || error);
  }
}

export async function enqueueMutation(mutation) {
  const item = {
    id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    retryCount: 0,
    ...mutation,
  };
  const current = await getQueue();
  current.push(item);
  await saveQueue(current);
  return item;
}

export async function dequeueMutation(id) {
  const current = await getQueue();
  const next = current.filter((m) => m.id !== id);
  await saveQueue(next);
}

export async function clearQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export async function processSyncQueue() {
  if (isProcessing) return { busy: true };
  isProcessing = true;
  let successCount = 0;
  let failureCount = 0;

  try {
    const queue = await getQueue();
    if (!queue.length) return { processed: 0, remaining: 0 };

    const remaining = [];

    for (const item of queue) {
      let itemSuccess = false;
      try {
        switch (item.type) {
          case 'CREATE_TASK': {
            await tasksApi.createTask(item.payload);
            itemSuccess = true;
            break;
          }
          case 'UPDATE_TASK_STATUS': {
            await tasksApi.updateTaskStatus(item.taskId, item.status);
            itemSuccess = true;
            break;
          }
          case 'DELETE_TASK': {
            await tasksApi.deleteTask(item.taskId);
            itemSuccess = true;
            break;
          }
          case 'UPDATE_TASK_PROGRESS': {
            await tasksApi.updateTaskProgress(item.taskId, item.progress);
            itemSuccess = true;
            break;
          }
          case 'CREATE_SCHEDULE': {
            await schedulesApi.createSchedule(item.payload);
            itemSuccess = true;
            break;
          }
          case 'DELETE_SCHEDULE': {
            await schedulesApi.deleteSchedule(item.scheduleId);
            itemSuccess = true;
            break;
          }
          case 'UPDATE_SESSION': {
            await sessionsApi.updateSession(item.sessionId, item.payload);
            itemSuccess = true;
            break;
          }
          default:
            // Unknown mutation type, drop safely
            itemSuccess = true;
            break;
        }
      } catch (err) {
        // Jika error jaringan (offline / timeout), hentikan pemrosesan dan simpan sisa antrean
        if (err.isTimeout || err.name === 'AbortError' || err.message?.includes('Network') || !err.status) {
          remaining.push(item);
          console.warn('[syncQueueService] Jaringan terputus saat memproses queue:', err.message);
          break;
        }

        // Jika error validasi atau 404/400 (perubahan kadaluwarsa/tidak valid), hapus dari queue agar tidak memblokir
        if (err.status >= 400 && err.status < 500) {
          console.warn(`[syncQueueService] Mutasi ${item.type} ditolak server (${err.status}), diabaikan:`, err.message);
          itemSuccess = true; // Anggap selesai agar tidak dicoba terus
        } else {
          item.retryCount = (item.retryCount || 0) + 1;
          remaining.push(item);
        }
      }

      if (itemSuccess) {
        successCount += 1;
      } else {
        failureCount += 1;
      }
    }

    await saveQueue(remaining);
    return { processed: successCount, remaining: remaining.length, failed: failureCount };
  } finally {
    isProcessing = false;
  }
}

export default {
  getQueue,
  saveQueue,
  enqueueMutation,
  dequeueMutation,
  clearQueue,
  processSyncQueue,
};
