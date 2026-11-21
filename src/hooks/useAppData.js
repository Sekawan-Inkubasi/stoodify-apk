// Header Note: useAppData mengelola sinkronisasi multi-domain state aplikasi (auth, tasks, schedules, adaptive sessions, undo-sync, AI predictions, offline cache & queue). Batas toleransi <= 350 baris.
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as auth from '../services/authService';
import * as tasksApi from '../services/taskService';
import * as subjectsApi from '../services/subjectService';
import * as schedulesApi from '../services/scheduleService';
import * as sessionsApi from '../services/studySessionService';
import * as statsApi from '../services/statisticsService';
import * as notificationsApi from '../services/notificationService';
import * as predictionsApi from '../services/predictionService';
import syncQueueService from '../services/syncQueueService';
import useOfflineSync from './useOfflineSync';
import useTaskMutations from './useTaskMutations';
import tokenStorage, {
  hydrateTokens, hasActiveSession, clearTokens, subscribeTokenChange, isTokenExpiringSoon,
} from '../services/tokenStorage';
import localNotificationService from '../services/localNotificationService';
import { performTokenRefresh } from '../services/apiClient';
import { API_BASE_URL } from '../constants/config';

const initialUser = { name: 'Siswa', grade: 'SMA - Fase F', school: 'Stoodify', email: '', avatarUrl: null };

function enrichSessionsWithTasks(sessionList, taskList) {
  if (!Array.isArray(sessionList)) return [];
  const map = new Map();
  if (Array.isArray(taskList)) {
    taskList.forEach((t) => { if (t?.id) map.set(String(t.id), t); });
  }
  return sessionList.map((s) => {
    if (!s?.task && s?.taskId && map.has(String(s.taskId))) {
      return { ...s, task: map.get(String(s.taskId)) };
    }
    return s;
  });
}

export default function useAppData(showMessage) {
  const recommendationAttempts = useRef(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [user, setUser] = useState(initialUser);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState({});
  const [preferences, setPreferences] = useState(null);
  const [undoToastVisible, setUndoToastVisible] = useState(false);

  const refresh = useCallback(async () => {
    if (!hasActiveSession()) return;
    setLoading(true); setDataError('');
    try {
      const nextSubjectsRaw = await subjectsApi.getSubjects();
      const nextSubjects = Array.isArray(nextSubjectsRaw) ? nextSubjectsRaw.filter(Boolean) : [];
      setSubjects(nextSubjects);

      const predictionPromises = nextSubjects.length
        ? Promise.allSettled(nextSubjects.map((sub) => predictionsApi.getPredictionsBySubject(sub.id)))
        : Promise.resolve([]);

      const results = await Promise.allSettled([
        tasksApi.getTasks(), schedulesApi.getSchedules(), sessionsApi.getSessions({ status: 'planned' }),
        statsApi.getOverview(), notificationsApi.getNotifications({ unread: false }),
        predictionPromises,
      ]);
      const [taskRes, schedRes, sessRes, statRes, notifRes, predRes] = results;
      const safeTasks = taskRes.status === 'fulfilled' && Array.isArray(taskRes.value) ? taskRes.value.filter(Boolean) : [];
      const safeSchedules = schedRes.status === 'fulfilled' && Array.isArray(schedRes.value) ? schedRes.value.filter(Boolean) : [];
      const safeSessions = sessRes.status === 'fulfilled' && Array.isArray(sessRes.value) ? sessRes.value.filter(Boolean) : [];
      const safeNotifications = notifRes.status === 'fulfilled' && Array.isArray(notifRes.value) ? notifRes.value.filter(Boolean) : [];
      const safeStats = statRes.status === 'fulfilled' && statRes.value ? statRes.value : {};

      if (taskRes.status === 'fulfilled') setTasks(safeTasks);
      if (schedRes.status === 'fulfilled') setSchedules(safeSchedules);
      if (sessRes.status === 'fulfilled') {
        setSessions(enrichSessionsWithTasks(safeSessions, safeTasks));
        const activeTasks = safeTasks.filter((t) => t && t.status !== 'selesai');
        const attemptKey = activeTasks.map((t) => t.id).sort().join(',');
        if (!safeSessions.length && activeTasks.length && !recommendationAttempts.current.has(attemptKey) && isOnline) {
          recommendationAttempts.current.add(attemptKey);
          try {
            const gen = await sessionsApi.generateScheduleRecommendations();
            if (gen?.sessions && Array.isArray(gen.sessions)) {
              setSessions(enrichSessionsWithTasks(gen.sessions.filter(Boolean), safeTasks));
            }
          } catch {}
        }
      }
      if (statRes.status === 'fulfilled') setStats(safeStats);
      if (notifRes.status === 'fulfilled') setNotifications(safeNotifications);

      let flattenedPreds = [];
      if (predRes.status === 'fulfilled' && Array.isArray(predRes.value)) {
        flattenedPreds = predRes.value
          .filter((item) => item?.status === 'fulfilled' && Array.isArray(item.value))
          .flatMap((item) => item.value)
          .filter(Boolean);
        setPredictions(flattenedPreds);
      }

      saveAllCaches({
        tasks: safeTasks, subjects: nextSubjects, schedules: safeSchedules,
        sessions: safeSessions, notifications: safeNotifications,
        predictions: flattenedPreds, stats: safeStats,
      });

      const failed = results.slice(0, 5).some((item) => {
        if (item.status !== 'rejected') return false;
        // Jika 409 Conflict dari profile gate, jangan tampilkan generic error banner
        const isProfileConflict = item.reason?.status === 409 || item.reason?.data?.errors?.profile_completed === 'false';
        return !isProfileConflict;
      });
      if (failed) setDataError('Sebagian data belum dapat dimuat dari server.');
      localNotificationService.syncAllReminders({ tasks: safeTasks, sessions: safeSessions, preferences });
    } catch (error) {
      setDataError(error.message || 'Data belum dapat dimuat dari server.');
    } finally { setLoading(false); }
  }, []);

  const { isOnline, hydrateLocalCache, saveCache, saveAllCaches } = useOfflineSync({
    isLoggedIn,
    onSyncComplete: refresh,
    showMessage,
  });

  useEffect(() => {
    hydrateLocalCache().then((cached) => {
      if (cached?.tasks) setTasks(cached.tasks);
      if (cached?.subjects) setSubjects(cached.subjects);
      if (cached?.schedules) setSchedules(cached.schedules);
      if (cached?.sessions) setSessions(cached.sessions);
      if (cached?.notifications) setNotifications(cached.notifications);
      if (cached?.predictions) setPredictions(cached.predictions);
      if (cached?.stats) setStats(cached.stats);
    }).catch(() => {});
  }, [hydrateLocalCache]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const tokens = await hydrateTokens();
      if (!mounted) return;
      if (tokens.accessToken || tokens.refreshToken) {
        try {
          const me = await auth.getMe();
          if (!mounted) return;
          if (me) {
            setUser({ ...initialUser, ...me, avatarUrl: me.avatar_url || me.avatarUrl || null });
            setIsLoggedIn(true);
          } else if (!hasActiveSession()) clearTokens();
        } catch {
          if (!hasActiveSession()) clearTokens();
        }
      }
      if (mounted) setAuthLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const unsub = subscribeTokenChange((tokens) => {
      if (!tokens.accessToken && !tokens.refreshToken) setIsLoggedIn(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleAppState = async (nextState) => {
      if (nextState === 'active' && hasActiveSession() && isOnline) {
        if (isTokenExpiringSoon(300)) await performTokenRefresh();
        sessionsApi.getSessions({ status: 'planned' }).then((s) => Array.isArray(s) && setSessions(s)).catch(() => {});
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [isOnline]);

  useEffect(() => { if (isLoggedIn) refresh(); }, [isLoggedIn, refresh]);

  const login = useCallback(async (profile) => {
    setUser({ ...initialUser, ...(profile || {}), avatarUrl: profile?.avatar_url || profile?.avatarUrl || null });
    setIsLoggedIn(true);
    try {
      const pending = await tokenStorage.getOnboardingPreferences();
      if (pending) {
        await auth.updatePreferences(pending);
        setPreferences((prev) => ({ ...(prev || {}), ...pending }));
        await tokenStorage.setOnboardingPreferences(null);
      }
    } catch {}
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setIsLoggedIn(false); setUser(initialUser); setTasks([]); setSubjects([]); setSchedules([]); setSessions([]); setNotifications([]); setPredictions([]); setStats({});
  }, []);

  const syncSessionsAfterMutation = useCallback(async (prevSessions) => {
    if (!isOnline) return;
    try {
      const updated = await sessionsApi.getSessions({ status: 'planned' });
      if (Array.isArray(updated)) {
        setSessions(updated);
        const prevKey = (prevSessions || []).map((s) => `${s.id}-${s.date}-${s.startTime}`).join(',');
        const nextKey = updated.map((s) => `${s.id}-${s.date}-${s.startTime}`).join(',');
        if (prevKey !== nextKey && updated.length > 0) setUndoToastVisible(true);
      }
    } catch (_) {}
  }, [isOnline]);

  const {
    addTask,
    toggleTask,
    deleteTask,
    updateProgress,
    refreshTask,
    createSubtask,
    toggleSubtask,
  } = useTaskMutations({
    subjects,
    sessions,
    isOnline,
    saveCache,
    setTasks,
    setStats,
    showMessage,
    syncSessionsAfterMutation,
  });

  const addSubject = useCallback(async (input) => {
    try { const created = await subjectsApi.createSubject(input); setSubjects((items) => { const updated = [...items, created]; saveCache('subjects', updated); return updated; }); showMessage(`Mata pelajaran ${created.name} ditambahkan.`, 'Mata Pelajaran'); }
    catch (error) { showMessage(error.message || 'Gagal menambahkan mata pelajaran.', 'Gagal'); }
  }, [showMessage, saveCache]);
  const updateSubject = useCallback(async (id, input) => {
    try { const updated = await subjectsApi.updateSubject(id, input); setSubjects((items) => items.map((item) => item.id === id ? { ...item, ...updated } : item)); }
    catch (error) { showMessage(error.message || 'Gagal memperbarui mata pelajaran.', 'Gagal'); }
  }, [showMessage]);
  const deleteSubject = useCallback(async (id) => {
    try { await subjectsApi.deleteSubject(id); setSubjects((items) => items.filter((item) => item.id !== id)); }
    catch (error) { showMessage(error.message || 'Gagal menghapus mata pelajaran.', 'Gagal'); }
  }, [showMessage]);

  const addSchedule = useCallback(async (input) => {
    if (!isOnline) {
      const tempId = `temp_sched_${Date.now()}`;
      const offlineSched = { id: tempId, ...input };
      setSchedules((items) => { const updated = [...items, offlineSched]; saveCache('schedules', updated); return updated; });
      await syncQueueService.enqueueMutation({ type: 'CREATE_SCHEDULE', payload: input, tempId });
      showMessage('Jadwal disimpan di perangkat (offline).', 'Tersimpan Offline');
      return;
    }
    try {
      const created = await schedulesApi.createSchedule(input);
      setSchedules((items) => { const updated = [...items, created]; saveCache('schedules', updated); return updated; });
      showMessage('Jadwal berhasil disimpan.', 'Jadwal Ditambahkan');
      sessionsApi.getSessions({ status: 'planned' }).then((s) => Array.isArray(s) && setSessions(s)).catch(() => {});
    } catch (error) { showMessage(error.message || 'Gagal menyimpan jadwal.', error.status === 409 ? 'Konflik Jadwal' : 'Gagal Simpan'); throw error; }
  }, [showMessage, isOnline, saveCache]);

  const deleteSchedule = useCallback(async (schedule) => {
    if (!isOnline) {
      setSchedules((items) => { const updated = items.filter((item) => item.id !== schedule.id); saveCache('schedules', updated); return updated; });
      await syncQueueService.enqueueMutation({ type: 'DELETE_SCHEDULE', scheduleId: schedule.id });
      showMessage('Jadwal dihapus dari perangkat (offline).', 'Tersimpan Offline');
      return;
    }
    try {
      await schedulesApi.deleteSchedule(schedule.id);
      setSchedules((items) => { const updated = items.filter((item) => item.id !== schedule.id); saveCache('schedules', updated); return updated; });
      sessionsApi.getSessions({ status: 'planned' }).then((s) => Array.isArray(s) && setSessions(s)).catch(() => {});
    } catch (error) { showMessage(error.message || 'Gagal menghapus jadwal.', 'Gagal Hapus Jadwal'); }
  }, [showMessage, isOnline, saveCache]);

  const reschedule = useCallback(async () => {
    if (!isOnline) {
      showMessage('Anda sedang offline, tidak bisa akses fitur AI', 'Fitur AI');
      return null;
    }
    try {
      let result;
      try { result = await sessionsApi.generateScheduleRecommendations(); }
      catch (genErr) {
        if (genErr?.status === 429) throw genErr;
        result = await sessionsApi.rescheduleSessions();
      }
      if (result?.sessions) setSessions(enrichSessionsWithTasks(result.sessions, tasks));
      showMessage(result?.message || 'Jadwal kamu sudah paling pas', 'Jadwal Belajar');
      return result;
    } catch (error) {
      if (error?.status === 502 || error?.status === 503) showMessage('AI sedang sibuk. Jadwal lama tetap dipakai.', 'AI Sibuk');
      else if (error?.status !== 429) showMessage(error.message || 'Jadwal belajar belum dapat disusun ulang.', 'Jadwal Belajar');
      throw error;
    }
  }, [showMessage, tasks, isOnline]);

  const undoScheduleChange = useCallback(async (isExpired) => {
    if (isExpired) { showMessage('Waktu membatalkan sudah lewat.', 'Batas Waktu'); return; }
    try {
      const result = await sessionsApi.undoScheduleRecommendation();
      if (result?.sessions) { setSessions(result.sessions); showMessage(result.message || 'Jadwal berhasil dikembalikan.', 'Jadwal Dikembalikan'); }
    } catch (err) { showMessage(err.status === 404 ? 'Jadwal sebelumnya sudah tidak tersedia.' : (err.message || 'Gagal membatalkan jadwal.'), 'Gagal'); }
  }, [showMessage]);

  const editSession = useCallback(async ({ id, sessionDate, startTime, duration }) => {
    try {
      const updated = await sessionsApi.updateSession(id, { sessionDate, startTime, duration });
      setSessions((items) => items.map((item) => item.id === id ? { ...item, ...updated, isPinned: true } : item));
      showMessage('Sesi ini kamu atur sendiri — tidak akan diubah otomatis.', 'Sesi Disimpan');
    } catch (err) { showMessage(err.message || 'Gagal menyimpan penyesuaian sesi.', 'Gagal'); }
  }, [showMessage]);

  const markAllRead = useCallback(async () => {
    try { await notificationsApi.markAllAsRead(); setNotifications((items) => items.map((item) => ({ ...item, isRead: true }))); }
    catch (error) { showMessage(error.message || 'Gagal memperbarui notifikasi.', 'Gagal'); }
  }, [showMessage]);
  const markRead = useCallback(async (notification) => {
    if (notification.isRead) return;
    try { const updated = await notificationsApi.markAsRead(notification.id); setNotifications((items) => items.map((item) => item.id === notification.id ? updated : item)); }
    catch (error) { showMessage(error.message || 'Gagal menandai notifikasi.', 'Gagal'); }
  }, [showMessage]);

  const generatePrediction = useCallback(async (subjectId) => {
    if (!isOnline) {
      showMessage('Anda sedang offline, tidak bisa akses fitur AI', 'Fitur AI');
      return;
    }
    try {
      const result = await predictionsApi.generatePrediction(subjectId);
      setPredictions((items) => { const updated = [result, ...items.filter((item) => item.id !== result.id)]; saveCache('predictions', updated); return updated; });
    } catch (error) { showMessage(error.message || 'Prediksi materi belum dapat dibuat.', 'Gagal Meminta Prediksi'); }
  }, [showMessage, isOnline, saveCache]);

  const predictionFeedback = useCallback(async (prediction, value) => {
    if (!isOnline) { showMessage('Masukan prediksi membutuhkan koneksi internet.', 'Perlu Online'); return; }
    try { const updated = await predictionsApi.submitFeedback(prediction.id, value); setPredictions((items) => items.map((item) => item.id === prediction.id ? updated : item)); }
    catch (error) { showMessage(error.message || 'Masukan belum dapat disimpan.', 'Gagal'); }
  }, [showMessage, isOnline]);

  const loadPreferences = useCallback(async () => {
    try { const value = await auth.getPreferences(); setPreferences(value || {}); }
    catch (error) { showMessage(error.message || 'Preferensi belum dapat dimuat.', 'Gagal Memuat Preferensi'); }
  }, [showMessage]);
  const savePreferences = useCallback(async (value) => {
    try {
      await auth.updatePreferences(value);
      setPreferences(value);
      showMessage('Preferensi belajar tersimpan.', 'Preferensi Diperbarui');
      sessionsApi.getSessions({ status: 'planned' }).then((s) => Array.isArray(s) && setSessions(s)).catch(() => {});
    } catch (error) { showMessage(error.message || 'Preferensi belum dapat disimpan.', 'Gagal Menyimpan'); throw error; }
  }, [showMessage]);

  const uploadAvatar = useCallback(async (asset) => {
    if (!isOnline) { showMessage('Unggah foto profil membutuhkan koneksi internet.', 'Perlu Online'); return; }
    try {
      const path = await auth.uploadAvatar(asset.uri, asset.fileName || 'avatar.jpg', asset.mimeType || 'image/jpeg');
      if (path) setUser((current) => ({ ...current, avatarUrl: path.startsWith('http') ? path : `${new URL(API_BASE_URL).origin}${path}` }));
      showMessage('Foto profil berhasil diperbarui.', 'Foto Profil');
    } catch (error) { showMessage(error.message || 'Foto profil belum dapat diunggah.', 'Gagal Unggah Foto'); }
  }, [showMessage, isOnline]);

  const completeProfile = useCallback(async ({ school, grade, major }) => {
    setLoading(true);
    try {
      const updatedUser = await auth.completeEducationProfile({ school, grade, major });
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
        grade: updatedUser?.grade ? `Kelas ${updatedUser.grade}` : prev.grade,
        profile_completed: true,
      }));
      setDataError('');
      await refresh();
      return updatedUser;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  return {
    isLoggedIn, setIsLoggedIn, authLoading, loading, dataError, user, setUser,
    tasks, subjects, schedules, sessions, notifications, predictions, stats, preferences,
    undoToastVisible, setUndoToastVisible, isOnline,
    login, logout, refresh, completeProfile, addTask, toggleTask, deleteTask, updateProgress,
    createSubtask, toggleSubtask, addSubject, updateSubject, deleteSubject,
    addSchedule, deleteSchedule, reschedule, undoScheduleChange, editSession,
    markAllRead, markRead, generatePrediction, predictionFeedback,
    loadPreferences, savePreferences, uploadAvatar,
  };
}
