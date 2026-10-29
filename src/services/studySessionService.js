import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { mapTaskToUI } from './taskService';

export function mapSessionToUI(session) {
  if (!session) return null;

  const dateStr = session.session_date
    ? new Date(session.session_date).toISOString().split('T')[0]
    : '';

  return {
    id: String(session.id),
    taskId: String(session.task_id),
    task: session.task ? mapTaskToUI(session.task) : null,
    date: dateStr,
    startTime: session.start_time,
    durationMinutes: Number(session.duration) || 45,
    targetProgress: Number(session.target_progress) || 50,
    status: session.status || 'planned',
    isAiGenerated: Boolean(session.ai_generated),
    reason: session.reason || 'Rekomendasi sesi belajar untuk target deadline.',
  };
}

export async function getSessions(params = {}) {
  const result = await apiGet(ENDPOINTS.STUDY_SESSIONS, params);
  const list = result?.data || [];
  return list.map(mapSessionToUI);
}

export async function getTodaySessions() {
  const result = await apiGet(ENDPOINTS.STUDY_SESSIONS_TODAY);
  const list = result?.data || [];
  return list.map(mapSessionToUI);
}

export async function generateScheduleRecommendations(dateStr) {
  const payload = dateStr ? { date: dateStr } : {};
  const result = await apiPost(ENDPOINTS.AI_SCHEDULE_GENERATE, payload);
  const list = result?.data || [];
  return {
    message: result?.message || '',
    sessions: list.map(mapSessionToUI),
  };
}

export async function getRecommendations() {
  const result = await apiGet(ENDPOINTS.AI_SCHEDULE_RECOMMENDATIONS);
  const list = result?.data || [];
  return list.map(mapSessionToUI);
}

export async function acceptRecommendation(id) {
  const result = await apiPost(ENDPOINTS.AI_SCHEDULE_ACCEPT(id));
  return mapSessionToUI(result?.data);
}

export async function rejectRecommendation(id) {
  const result = await apiPost(ENDPOINTS.AI_SCHEDULE_REJECT(id));
  return mapSessionToUI(result?.data);
}

export async function rescheduleSessions() {
  const result = await apiPost(ENDPOINTS.AI_RESCHEDULE);
  const list = result?.data || [];
  return {
    message: result?.message || '',
    sessions: list.map(mapSessionToUI),
  };
}

export async function updateSession(id, { sessionDate, startTime, duration }) {
  const payload = {};
  if (sessionDate !== undefined) payload.session_date = sessionDate;
  if (startTime !== undefined) payload.start_time = startTime;
  if (duration !== undefined) payload.duration = Number(duration);

  const result = await apiPatch(ENDPOINTS.STUDY_SESSION_DETAIL(id), payload);
  return mapSessionToUI(result?.data);
}

export async function deleteSession(id) {
  return apiDelete(ENDPOINTS.STUDY_SESSION_DETAIL(id));
}

export default {
  getSessions,
  getTodaySessions,
  generateScheduleRecommendations,
  getRecommendations,
  acceptRecommendation,
  rejectRecommendation,
  rescheduleSessions,
  updateSession,
  deleteSession,
  mapSessionToUI,
};
