import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import * as taskService from '../services/taskService';
import * as subjectService from '../services/subjectService';
import * as scheduleService from '../services/scheduleService';
import * as studySessionService from '../services/studySessionService';
import * as statisticsService from '../services/statisticsService';
import * as notificationService from '../services/notificationService';
import { hasActiveSession, subscribeTokenChange, getStoredUser } from '../services/tokenStorage';

const StoodifyContext = createContext(null);

export function StoodifyProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasActiveSession());
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState(null);

  // Koleksi data bisnis dari database
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    return subscribeTokenChange((tokens) => {
      setIsAuthenticated(Boolean(tokens.accessToken));
      if (tokens.user) setUser(tokens.user);
    });
  }, []);

  const loadAllData = useCallback(async () => {
    if (!hasActiveSession()) return;
    setIsLoadingData(true);
    setError(null);
    try {
      const [resSub, resTask, resSch, resSess, resStats, resNotif] = await Promise.allSettled([
        subjectService.getSubjects(),
        taskService.getTasks(),
        scheduleService.getSchedules(),
        studySessionService.getTodaySessions(),
        statisticsService.getOverview(),
        notificationService.getNotifications({ unread: true }),
      ]);
      if (resSub.status === 'fulfilled') setSubjects(resSub.value);
      if (resTask.status === 'fulfilled') setTasks(resTask.value);
      if (resSch.status === 'fulfilled') setSchedules(resSch.value);
      if (resSess.status === 'fulfilled') setSessions(resSess.value);
      if (resStats.status === 'fulfilled') setStats(resStats.value);
      if (resNotif.status === 'fulfilled') setNotifications(resNotif.value);
    } catch (err) {
      setError(err.message || 'Gagal memuat data server.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    } else {
      setTasks([]);
      setSubjects([]);
      setSchedules([]);
      setSessions([]);
      setStats(null);
      setNotifications([]);
    }
  }, [isAuthenticated, loadAllData]);

  // Auth Operations
  const runAuthAction = async (actionFn) => {
    setIsLoadingAuth(true);
    setError(null);
    try {
      return await actionFn();
    } catch (err) {
      setError(err.message || 'Operasi autentikasi gagal.');
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = (email, password) => runAuthAction(() => authService.login(email, password));
  const loginDemo = () => runAuthAction(() => authService.loginDemo());
  const register = (n, e, p, cp) => runAuthAction(() => authService.register(n, e, p, cp));
  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Task Operations
  const addTask = async (data) => {
    const newTask = await taskService.createTask(data);
    setTasks((prev) => [newTask, ...prev]);
    statisticsService.getOverview().then(setStats).catch(() => {});
    return newTask;
  };

  const updateTaskStatus = async (id, status) => {
    const updated = await taskService.updateTaskStatus(id, status);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    statisticsService.getOverview().then(setStats).catch(() => {});
    return updated;
  };

  const updateTaskProgress = async (id, prog) => {
    const updated = await taskService.updateTaskProgress(id, prog);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    statisticsService.getOverview().then(setStats).catch(() => {});
    return updated;
  };

  const deleteTask = async (id) => {
    await taskService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    statisticsService.getOverview().then(setStats).catch(() => {});
  };

  // Subject Operations
  const addSubject = async (data) => {
    const newSub = await subjectService.createSubject(data);
    setSubjects((prev) => [...prev, newSub]);
    return newSub;
  };

  const updateSubject = async (id, data) => {
    const updated = await subjectService.updateSubject(id, data);
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    return updated;
  };

  const deleteSubject = async (id) => {
    await subjectService.deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTasks((prev) => prev.filter((t) => t.subjectId !== id));
  };

  // Schedule Operations
  const addSchedule = async (data) => {
    const newSch = await scheduleService.createSchedule(data);
    setSchedules((prev) => [...prev, newSch]);
    return newSch;
  };

  const deleteSchedule = async (id) => {
    await scheduleService.deleteSchedule(id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // AI & Study Sessions Operations
  const generateSchedule = async (date) => {
    const res = await studySessionService.generateScheduleRecommendations(date);
    setSessions(res.sessions);
    return res;
  };

  const acceptSession = async (id) => {
    const updated = await studySessionService.acceptRecommendation(id);
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const rejectSession = async (id) => {
    const updated = await studySessionService.rejectRecommendation(id);
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const rescheduleAll = async () => {
    const res = await studySessionService.rescheduleSessions();
    setSessions(res.sessions);
    return res;
  };

  const clearError = () => setError(null);

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    isLoadingData,
    error,
    clearError,
    tasks,
    subjects,
    schedules,
    sessions,
    stats,
    notifications,
    refreshAllData: loadAllData,
    login,
    loginDemo,
    register,
    logout,
    addTask,
    updateTaskStatus,
    updateTaskProgress,
    deleteTask,
    addSubject,
    updateSubject,
    deleteSubject,
    addSchedule,
    deleteSchedule,
    generateSchedule,
    acceptSession,
    rejectSession,
    rescheduleAll,
  };

  return <StoodifyContext.Provider value={value}>{children}</StoodifyContext.Provider>;
}

export function useStoodify() {
  const context = useContext(StoodifyContext);
  if (!context) {
    throw new Error('useStoodify harus digunakan di dalam StoodifyProvider');
  }
  return context;
}

export default StoodifyContext;
