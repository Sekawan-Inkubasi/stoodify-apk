import { useCallback, useEffect, useRef, useState } from 'react';
import * as auth from '../services/authService';
import * as tasksApi from '../services/taskService';
import * as subjectsApi from '../services/subjectService';
import * as schedulesApi from '../services/scheduleService';
import * as sessionsApi from '../services/studySessionService';
import * as statsApi from '../services/statisticsService';
import * as notificationsApi from '../services/notificationService';
import * as predictionsApi from '../services/predictionService';
import { hydrateTokens, hasActiveSession, clearTokens } from '../services/tokenStorage';
import { API_BASE_URL } from '../constants/config';

const initialUser = { name: 'Siswa', grade: 'SMA - Fase F', school: 'Stoodify', email: '', avatarUrl: null };

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

  const refresh = useCallback(async () => {
    if (!hasActiveSession()) return;
    setLoading(true); setDataError('');
    try {
      const nextSubjectsRaw = await subjectsApi.getSubjects();
      const nextSubjects = Array.isArray(nextSubjectsRaw) ? nextSubjectsRaw.filter(Boolean) : [];
      setSubjects(nextSubjects);

      const predictionPromises = nextSubjects.length
        ? Promise.allSettled(nextSubjects.map((subject) => predictionsApi.getPredictionsBySubject(subject.id)))
        : Promise.resolve([]);

      const results = await Promise.allSettled([
        tasksApi.getTasks(), schedulesApi.getSchedules(), sessionsApi.getRecommendations(),
        statsApi.getOverview(), notificationsApi.getNotifications({ unread: false }),
        predictionPromises,
      ]);
      const [taskResult, scheduleResult, sessionResult, statsResult, notificationResult, predictionResult] = results;
      if (taskResult.status === 'fulfilled') setTasks(Array.isArray(taskResult.value) ? taskResult.value.filter(Boolean) : []);
      if (scheduleResult.status === 'fulfilled') setSchedules(Array.isArray(scheduleResult.value) ? scheduleResult.value.filter(Boolean) : []);
      if (sessionResult.status === 'fulfilled') {
        const loadedSessions = Array.isArray(sessionResult.value) ? sessionResult.value.filter(Boolean) : [];
        setSessions(loadedSessions);
        const activeTasks = taskResult.status === 'fulfilled' && Array.isArray(taskResult.value)
          ? taskResult.value.filter((task) => task && task.status !== 'selesai')
          : [];
        const attemptKey = activeTasks.map((task) => task.id).sort().join(',');
        if (!loadedSessions.length && activeTasks.length && !recommendationAttempts.current.has(attemptKey)) {
          recommendationAttempts.current.add(attemptKey);
          try {
            const generated = await sessionsApi.generateScheduleRecommendations();
            if (generated?.sessions && Array.isArray(generated.sessions)) {
              setSessions(generated.sessions.filter(Boolean));
            }
          } catch { /* Keep the empty state available when recommendations cannot be generated. */ }
        }
      }
      if (statsResult.status === 'fulfilled') setStats(statsResult.value || {});
      if (notificationResult.status === 'fulfilled') setNotifications(Array.isArray(notificationResult.value) ? notificationResult.value.filter(Boolean) : []);
      if (predictionResult.status === 'fulfilled' && Array.isArray(predictionResult.value)) {
        const flattened = predictionResult.value
          .filter((item) => item && item.status === 'fulfilled' && Array.isArray(item.value))
          .flatMap((item) => item.value)
          .filter(Boolean);
        setPredictions(flattened);
      }
      const failed = results.slice(0, 5).some((item) => item.status === 'rejected');
      if (failed) setDataError('Sebagian data belum dapat dimuat dari server. Tarik ulang atau coba lagi.');
    } catch (error) {
      setDataError(error.message || 'Data belum dapat dimuat dari server.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const tokens = await hydrateTokens();
      if (!mounted) return;
      if (tokens.accessToken) {
        try {
          const me = await auth.getMe();
          if (!mounted) return;
          if (me) {
            setUser({ ...initialUser, ...me, avatarUrl: me.avatar_url || me.avatarUrl || null });
            setIsLoggedIn(true);
          } else clearTokens();
        } catch { clearTokens(); }
      }
      if (mounted) setAuthLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => { if (isLoggedIn) refresh(); }, [isLoggedIn, refresh]);

  const login = useCallback((profile) => {
    setUser({ ...initialUser, ...(profile || {}), avatarUrl: profile?.avatar_url || profile?.avatarUrl || null });
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setIsLoggedIn(false); setUser(initialUser); setTasks([]); setSubjects([]); setSchedules([]); setSessions([]); setNotifications([]); setPredictions([]); setStats({});
  }, []);

  const addTask = useCallback(async (input) => {
    try {
      const created = await tasksApi.createTask(input);
      const subject = subjects.find((item) => String(item.id) === String(input.subjectId));
      setTasks((items) => [{ ...created, subject: created.subject || subject, attachment: input.attachment }, ...items]);
      showMessage('Tugas berhasil ditambahkan ke database.', 'Tugas Ditambahkan');
      statsApi.getOverview().then(setStats).catch(() => {});
    } catch (error) { showMessage(error.message || 'Gagal menyimpan tugas ke backend.', 'Gagal Tambah Tugas'); throw error; }
  }, [subjects, showMessage]);

  const toggleTask = useCallback(async (task) => {
    const next = task.serverStatus === 'done' || task.status === 'selesai' ? 'pending' : 'done';
    try {
      const updated = await tasksApi.updateTaskStatus(task.id, next);
      setTasks((items) => items.map((item) => item.id === task.id ? { ...item, ...updated } : item));
      setStats(await statsApi.getOverview());
    } catch (error) { showMessage(error.message || 'Gagal memperbarui status tugas.', 'Gagal Update Tugas'); }
  }, [showMessage]);

  const deleteTask = useCallback(async (task) => {
    try { await tasksApi.deleteTask(task.id); setTasks((items) => items.filter((item) => item.id !== task.id)); showMessage('Tugas berhasil dihapus dari database.', 'Tugas Dihapus'); }
    catch (error) { showMessage(error.message || 'Gagal menghapus tugas.', 'Gagal Hapus Tugas'); }
  }, [showMessage]);

  const updateProgress = useCallback(async (task, progress) => {
    try { const updated = await tasksApi.updateTaskProgress(task.id, progress); setTasks((items) => items.map((item) => item.id === task.id ? { ...item, ...updated } : item)); }
    catch (error) { showMessage(error.message || 'Gagal memperbarui progres tugas.', 'Gagal Update Progres'); }
  }, [showMessage]);

  const refreshTask = useCallback(async (taskId) => {
    try {
      const updated = await tasksApi.getTaskById(taskId);
      setTasks((items) => items.map((item) => item.id === String(taskId) ? { ...item, ...updated } : item));
    } catch (error) { showMessage(error.message || 'Subtugas belum dapat diperbarui.', 'Gagal Memuat Tugas'); }
  }, [showMessage]);
  const createSubtask = useCallback(async (task, title) => {
    try { await tasksApi.createSubtask(task.id, title); await refreshTask(task.id); }
    catch (error) { showMessage(error.message || 'Gagal menambahkan subtugas.', 'Gagal Tambah Subtugas'); }
  }, [refreshTask, showMessage]);
  const toggleSubtask = useCallback(async (task, subtask) => {
    try { await tasksApi.toggleSubtask(subtask.id, !subtask.completed); await refreshTask(task.id); }
    catch (error) { showMessage(error.message || 'Gagal memperbarui subtugas.', 'Gagal Update Subtugas'); }
  }, [refreshTask, showMessage]);

  const addSubject = useCallback(async (input) => {
    try { const created = await subjectsApi.createSubject(input); setSubjects((items) => [...items, created]); showMessage(`Mata pelajaran ${created.name} ditambahkan.`, 'Mata Pelajaran'); }
    catch (error) { showMessage(error.message || 'Gagal menambahkan mata pelajaran.', 'Gagal'); }
  }, [showMessage]);
  const updateSubject = useCallback(async (id, input) => {
    try { const updated = await subjectsApi.updateSubject(id, input); setSubjects((items) => items.map((item) => item.id === id ? { ...item, ...updated } : item)); }
    catch (error) { showMessage(error.message || 'Gagal memperbarui mata pelajaran.', 'Gagal'); }
  }, [showMessage]);
  const deleteSubject = useCallback(async (id) => {
    try { await subjectsApi.deleteSubject(id); setSubjects((items) => items.filter((item) => item.id !== id)); }
    catch (error) { showMessage(error.message || 'Gagal menghapus mata pelajaran.', 'Gagal'); }
  }, [showMessage]);

  const addSchedule = useCallback(async (input) => {
    try { const created = await schedulesApi.createSchedule(input); setSchedules((items) => [...items, created]); showMessage('Jadwal berhasil disimpan.', 'Jadwal Ditambahkan'); }
    catch (error) { showMessage(error.message || 'Gagal menyimpan jadwal.', error.status === 409 ? 'Konflik Jadwal' : 'Gagal Simpan'); throw error; }
  }, [showMessage]);
  const deleteSchedule = useCallback(async (schedule) => {
    try { await schedulesApi.deleteSchedule(schedule.id); setSchedules((items) => items.filter((item) => item.id !== schedule.id)); }
    catch (error) { showMessage(error.message || 'Gagal menghapus jadwal.', 'Gagal Hapus Jadwal'); }
  }, [showMessage]);

  const reschedule = useCallback(async () => {
    try { const result = await sessionsApi.rescheduleSessions(); setSessions(result.sessions); showMessage(result.message || 'Urutan sesi belajar diperbarui oleh backend.', 'Adaptive Rescheduling'); }
    catch (error) { showMessage(error.message || 'Belum ada sesi yang dapat disusun ulang.', 'Adaptive Rescheduling'); }
  }, [showMessage]);
  const acceptSession = useCallback(async (session) => {
    try { const updated = await sessionsApi.acceptRecommendation(session.id); setSessions((items) => items.map((item) => item.id === session.id ? updated : item)); }
    catch (error) { showMessage(error.message || 'Gagal menerima rekomendasi.', 'Gagal'); }
  }, [showMessage]);
  const rejectSession = useCallback(async (session) => {
    try { await sessionsApi.rejectRecommendation(session.id); setSessions((items) => items.filter((item) => item.id !== session.id)); }
    catch (error) { showMessage(error.message || 'Gagal menolak rekomendasi.', 'Gagal'); }
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
    try { const result = await predictionsApi.generatePrediction(subjectId); setPredictions((items) => [result, ...items.filter((item) => item.id !== result.id)]); }
    catch (error) { showMessage(error.message || 'Prediksi materi belum dapat dibuat.', 'Gagal Meminta Prediksi'); }
  }, [showMessage]);
  const predictionFeedback = useCallback(async (prediction, value) => {
    try { const updated = await predictionsApi.submitFeedback(prediction.id, value); setPredictions((items) => items.map((item) => item.id === prediction.id ? updated : item)); }
    catch (error) { showMessage(error.message || 'Masukan belum dapat disimpan.', 'Gagal'); }
  }, [showMessage]);

  const loadPreferences = useCallback(async () => {
    try { const value = await auth.getPreferences(); setPreferences(value || {}); }
    catch (error) { showMessage(error.message || 'Preferensi belum dapat dimuat.', 'Gagal Memuat Preferensi'); }
  }, [showMessage]);
  const savePreferences = useCallback(async (value) => {
    try { await auth.updatePreferences(value); setPreferences(value); showMessage('Preferensi belajar tersimpan.', 'Preferensi Diperbarui'); }
    catch (error) { showMessage(error.message || 'Preferensi belum dapat disimpan.', 'Gagal Menyimpan'); throw error; }
  }, [showMessage]);

  const uploadAvatar = useCallback(async (asset) => {
    try {
      const path = await auth.uploadAvatar(asset.uri, asset.fileName || 'avatar.jpg', asset.mimeType || 'image/jpeg');
      if (path) setUser((current) => ({ ...current, avatarUrl: path.startsWith('http') ? path : `${new URL(API_BASE_URL).origin}${path}` }));
      showMessage('Foto profil berhasil diperbarui.', 'Foto Profil');
    } catch (error) { showMessage(error.message || 'Foto profil belum dapat diunggah.', 'Gagal Unggah Foto'); }
  }, [showMessage]);

  return { isLoggedIn, setIsLoggedIn, authLoading, loading, dataError, user, setUser, tasks, subjects, schedules, sessions, notifications, predictions, stats, preferences, login, logout, refresh, addTask, toggleTask, deleteTask, updateProgress, createSubtask, toggleSubtask, addSubject, updateSubject, deleteSubject, addSchedule, deleteSchedule, reschedule, acceptSession, rejectSession, markAllRead, markRead, generatePrediction, predictionFeedback, loadPreferences, savePreferences, uploadAvatar };
}
