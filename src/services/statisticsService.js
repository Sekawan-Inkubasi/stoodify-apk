import { apiGet } from './apiClient';
import { ENDPOINTS } from '../constants/apiEndpoints';

export async function getOverview() {
  const result = await apiGet(ENDPOINTS.STATS_OVERVIEW);
  const data = result?.data || {};

  return {
    totalTasks: Number(data.total_tasks) || 0,
    doneTasks: Number(data.done_tasks) || 0,
    lateTasks: Number(data.late_tasks) || 0,
    pendingTasks: Number(data.pending_tasks) || 0,
    onTimeRate: Number(data.on_time_rate) || 0,
    totalStudyMinutes: Number(data.total_study_minutes) || 0,
    totalStudyHours: Math.round(((Number(data.total_study_minutes) || 0) / 60) * 10) / 10,
    totalSubjects: Number(data.total_subjects) || 0,
  };
}

export async function getWeekly() {
  const result = await apiGet(ENDPOINTS.STATS_WEEKLY);
  return result?.data || null;
}

export async function getMonthly() {
  const result = await apiGet(ENDPOINTS.STATS_MONTHLY);
  return result?.data || null;
}

export async function getBySubjects() {
  const result = await apiGet(ENDPOINTS.STATS_SUBJECTS);
  return result?.data || [];
}

export default {
  getOverview,
  getWeekly,
  getMonthly,
  getBySubjects,
};
