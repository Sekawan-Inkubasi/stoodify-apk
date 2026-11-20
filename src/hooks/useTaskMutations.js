import { useCallback } from 'react';
import * as tasksApi from '../services/taskService';
import * as statsApi from '../services/statisticsService';
import syncQueueService from '../services/syncQueueService';
import localNotificationService from '../services/localNotificationService';

export default function useTaskMutations({
  subjects,
  sessions,
  isOnline,
  saveCache,
  setTasks,
  setStats,
  showMessage,
  syncSessionsAfterMutation,
}) {
  const addTask = useCallback(async (input) => {
    const subject = subjects.find((item) => String(item.id) === String(input.subjectId));
    if (!isOnline) {
      const tempId = `temp_${Date.now()}`;
      const offlineTask = {
        id: tempId,
        ...input,
        status: 'aktif',
        serverStatus: 'pending',
        progressPercent: 0,
        subject: subject || null,
        createdAt: new Date().toISOString(),
      };
      setTasks((items) => {
        const updated = [offlineTask, ...items];
        saveCache('tasks', updated);
        return updated;
      });
      await syncQueueService.enqueueMutation({ type: 'CREATE_TASK', payload: input, tempId });
      showMessage('Tugas disimpan di perangkat (offline). Disinkronkan saat terhubung.', 'Tersimpan Offline');
      return;
    }
    try {
      const prevSessions = sessions;
      const created = await tasksApi.createTask(input);
      setTasks((items) => {
        const updated = [{ ...created, subject: created.subject || subject, attachment: input.attachment }, ...items];
        saveCache('tasks', updated);
        return updated;
      });
      showMessage('Tugas berhasil ditambahkan ke database.', 'Tugas Ditambahkan');
      statsApi.getOverview().then(setStats).catch(() => {});
      syncSessionsAfterMutation(prevSessions);
    } catch (error) {
      showMessage(error.message || 'Gagal menyimpan tugas ke backend.', 'Gagal Tambah Tugas');
      throw error;
    }
  }, [subjects, isOnline, sessions, setTasks, saveCache, showMessage, setStats, syncSessionsAfterMutation]);

  const toggleTask = useCallback(async (task) => {
    const next = task.serverStatus === 'done' || task.status === 'selesai' ? 'pending' : 'done';
    const nextStatus = next === 'done' ? 'selesai' : 'aktif';
    if (!isOnline) {
      setTasks((items) => {
        const updated = items.map((t) => t.id === task.id ? { ...t, status: nextStatus, serverStatus: next } : t);
        saveCache('tasks', updated);
        return updated;
      });
      await syncQueueService.enqueueMutation({ type: 'UPDATE_TASK_STATUS', taskId: task.id, status: next });
      showMessage('Status tugas diubah (offline).', 'Tersimpan Offline');
      return;
    }
    try {
      const prevSessions = sessions;
      const updated = await tasksApi.updateTaskStatus(task.id, next);
      setTasks((items) => {
        const list = items.map((t) => t.id === task.id ? { ...t, ...updated } : t);
        saveCache('tasks', list);
        return list;
      });
      if (next === 'done') localNotificationService.cancelTaskReminders(task.id);
      else localNotificationService.scheduleTaskReminders({ ...task, status: 'aktif' });
      setStats(await statsApi.getOverview());
      syncSessionsAfterMutation(prevSessions);
    } catch (error) {
      showMessage(error.message || 'Gagal memperbarui status tugas.', 'Gagal Update Tugas');
    }
  }, [isOnline, sessions, setTasks, saveCache, showMessage, setStats, syncSessionsAfterMutation]);

  const deleteTask = useCallback(async (task) => {
    if (!isOnline) {
      setTasks((items) => {
        const updated = items.filter((t) => t.id !== task.id);
        saveCache('tasks', updated);
        return updated;
      });
      await syncQueueService.enqueueMutation({ type: 'DELETE_TASK', taskId: task.id });
      showMessage('Tugas dihapus dari perangkat (offline).', 'Tersimpan Offline');
      return;
    }
    try {
      const prevSessions = sessions;
      await tasksApi.deleteTask(task.id);
      setTasks((items) => {
        const updated = items.filter((t) => t.id !== task.id);
        saveCache('tasks', updated);
        return updated;
      });
      localNotificationService.cancelTaskReminders(task.id);
      showMessage('Tugas berhasil dihapus dari database.', 'Tugas Dihapus');
      syncSessionsAfterMutation(prevSessions);
    } catch (error) {
      showMessage(error.message || 'Gagal menghapus tugas.', 'Gagal Hapus Tugas');
    }
  }, [isOnline, sessions, setTasks, saveCache, showMessage, syncSessionsAfterMutation]);

  const updateProgress = useCallback(async (task, progress) => {
    const prev = task.progressPercent || 0;
    setTasks((items) => {
      const updated = items.map((t) => t.id === task.id ? { ...t, progressPercent: progress } : t);
      saveCache('tasks', updated);
      return updated;
    });
    if (!isOnline) {
      await syncQueueService.enqueueMutation({ type: 'UPDATE_TASK_PROGRESS', taskId: task.id, progress });
      return;
    }
    try {
      const updated = await tasksApi.updateTaskProgress(task.id, progress);
      setTasks((items) => {
        const list = items.map((t) => t.id === task.id ? { ...t, ...updated, progressPercent: progress } : t);
        saveCache('tasks', list);
        return list;
      });
    } catch (error) {
      setTasks((items) => items.map((t) => t.id === task.id ? { ...t, progressPercent: prev } : t));
      showMessage(error.message || 'Gagal memperbarui progres tugas.', 'Gagal Update Progres');
    }
  }, [isOnline, setTasks, saveCache, showMessage]);

  const refreshTask = useCallback(async (taskId) => {
    if (!isOnline) return;
    try {
      const updated = await tasksApi.getTaskById(taskId);
      setTasks((items) => items.map((t) => t.id === String(taskId) ? { ...t, ...updated } : t));
    } catch (error) {
      showMessage(error.message || 'Subtugas belum dapat diperbarui.', 'Gagal Memuat Tugas');
    }
  }, [isOnline, setTasks, showMessage]);

  const createSubtask = useCallback(async (task, title) => {
    if (!isOnline) {
      showMessage('Tambah subtugas membutuhkan koneksi internet.', 'Perlu Online');
      return;
    }
    try {
      await tasksApi.createSubtask(task.id, title);
      await refreshTask(task.id);
    } catch (error) {
      showMessage(error.message || 'Gagal menambahkan subtugas.', 'Gagal Tambah Subtugas');
    }
  }, [isOnline, refreshTask, showMessage]);

  const toggleSubtask = useCallback(async (task, subtask) => {
    const nextCompleted = !subtask.completed;
    setTasks((items) => items.map((t) => t.id !== task.id ? t : {
      ...t,
      subtasks: (t.subtasks || []).map((s) => s.id === subtask.id ? { ...s, completed: nextCompleted } : s),
    }));
    if (!isOnline) return;
    try {
      await tasksApi.toggleSubtask(subtask.id, nextCompleted);
      await refreshTask(task.id);
    } catch (error) {
      setTasks((items) => items.map((t) => t.id !== task.id ? t : {
        ...t,
        subtasks: (t.subtasks || []).map((s) => s.id === subtask.id ? { ...s, completed: !nextCompleted } : s),
      }));
      showMessage(error.message || 'Gagal memperbarui subtugas.', 'Gagal Update Subtugas');
    }
  }, [isOnline, refreshTask, setTasks, showMessage]);

  return {
    addTask,
    toggleTask,
    deleteTask,
    updateProgress,
    refreshTask,
    createSubtask,
    toggleSubtask,
  };
}
