import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { mapSubjectToUI } from './subjectService';

export const STATUS_MAP_TO_UI = {
  pending: 'belum-mulai',
  in_progress: 'sedang-dikerjakan',
  done: 'selesai',
  late: 'terlambat',
};

export const STATUS_MAP_TO_BACKEND = {
  'belum-mulai': 'pending',
  'sedang-dikerjakan': 'in_progress',
  selesai: 'done',
  terlambat: 'late',
};

export const TYPE_MAP_TO_BACKEND = {
  ulangan: 'exam',
  ujian: 'exam',
  exam: 'exam',
  proyek: 'project',
  project: 'project',
  praktik: 'project',
  membaca: 'reading',
  reading: 'reading',
  tugas: 'assignment',
  individu: 'assignment',
  kelompok: 'assignment',
  assignment: 'assignment',
};

export function mapTaskToUI(task) {
  if (!task) return null;

  const score = Number(task.priority_score) || 0;
  const priority =
    score >= 80 ? 'sangat-tinggi' : score >= 60 ? 'tinggi' : score >= 40 ? 'sedang' : 'rendah';

  const uiStatus = STATUS_MAP_TO_UI[task.status] || 'belum-mulai';

  const subtasks = Array.isArray(task.subtasks)
    ? task.subtasks.map((st) => ({
        id: String(st.id),
        title: st.title,
        completed: Boolean(st.is_completed),
      }))
    : [];

  return {
    id: String(task.id),
    title: task.title,
    subjectId: String(task.subject_id),
    subject: task.subject ? mapSubjectToUI(task.subject) : null,
    description: task.description || '',
    notes: task.notes || '',
    deadline: task.deadline,
    difficulty: Number(task.difficulty) || 3,
    estimatedDurationMinutes: Number(task.estimated_duration) || 60,
    type: task.type || 'assignment',
    status: uiStatus,
    serverStatus: task.status,
    progressPercent: Number(task.progress) || 0,
    priorityScore: score,
    priority,
    priorityReason:
      score >= 80
        ? 'Tugas mendesak dengan skor prioritas tinggi dari backend.'
        : 'Tugas dengan waktu pengerjaan terjadwal reguler.',
    subtasks,
    createdAt: task.created_at,
  };
}

export async function getTasks(params = {}) {
  const result = await apiGet(ENDPOINTS.TASKS, { sort: 'priority', ...params });
  const list = result?.data || [];
  return list.map(mapTaskToUI);
}

export async function getUpcomingTasks() {
  const result = await apiGet(ENDPOINTS.TASKS_UPCOMING);
  const list = result?.data || [];
  return list.map(mapTaskToUI);
}

export async function getOverdueTasks() {
  const result = await apiGet(ENDPOINTS.TASKS_OVERDUE);
  const list = result?.data || [];
  return list.map(mapTaskToUI);
}

export async function getTaskById(id) {
  const result = await apiGet(ENDPOINTS.TASK_DETAIL(id));
  return mapTaskToUI(result?.data);
}

export async function createTask({
  subjectId,
  title,
  deadline,
  difficulty = 3,
  estimatedDuration = 60,
  type = 'assignment',
  description = '',
  notes = '',
}) {
  const payload = {
    subject_id: Number(subjectId),
    title: title.trim(),
    deadline: typeof deadline === 'string' ? deadline : deadline.toISOString(),
    difficulty: Number(difficulty) || 3,
    estimated_duration: Number(estimatedDuration) || 60,
    type: TYPE_MAP_TO_BACKEND[type] || 'assignment',
    description: description || '',
    notes: notes || '',
  };

  const result = await apiPost(ENDPOINTS.TASKS, payload);
  return mapTaskToUI(result?.data);
}

export async function updateTask(id, data) {
  const payload = { ...data };
  if (payload.subjectId) {
    payload.subject_id = Number(payload.subjectId);
    delete payload.subjectId;
  }
  const result = await apiPatch(ENDPOINTS.TASK_DETAIL(id), payload);
  return mapTaskToUI(result?.data);
}

export async function updateTaskStatus(id, uiOrServerStatus) {
  const status = STATUS_MAP_TO_BACKEND[uiOrServerStatus] || uiOrServerStatus;
  const result = await apiPatch(ENDPOINTS.TASK_STATUS(id), { status });
  return mapTaskToUI(result?.data);
}

export async function updateTaskProgress(id, progress) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  const result = await apiPatch(ENDPOINTS.TASK_PROGRESS(id), { progress: clamped });
  return mapTaskToUI(result?.data);
}

export async function deleteTask(id) {
  return apiDelete(ENDPOINTS.TASK_DETAIL(id));
}

export async function createSubtask(taskId, title) {
  const result = await apiPost(ENDPOINTS.TASK_SUBTASKS(taskId), { title: title.trim() });
  return result?.data;
}

export async function toggleSubtask(subtaskId, isCompleted) {
  const result = await apiPatch(ENDPOINTS.SUBTASK_DETAIL(subtaskId), {
    is_completed: isCompleted,
  });
  return result?.data;
}

export async function deleteSubtask(subtaskId) {
  return apiDelete(ENDPOINTS.SUBTASK_DETAIL(subtaskId));
}

export default {
  getTasks,
  getUpcomingTasks,
  getOverdueTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  updateTaskProgress,
  deleteTask,
  createSubtask,
  toggleSubtask,
  deleteSubtask,
  mapTaskToUI,
};
