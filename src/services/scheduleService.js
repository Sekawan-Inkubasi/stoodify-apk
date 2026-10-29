import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { mapSubjectToUI } from './subjectService';

export const DAY_MAP_ID_TO_EN = {
  Senin: 'Monday',
  Selasa: 'Tuesday',
  Rabu: 'Wednesday',
  Kamis: 'Thursday',
  Jumat: 'Friday',
  Sabtu: 'Saturday',
  Minggu: 'Sunday',
};

export const DAY_MAP_EN_TO_ID = {
  Monday: 'Senin',
  Tuesday: 'Selasa',
  Wednesday: 'Rabu',
  Thursday: 'Kamis',
  Friday: 'Jumat',
  Saturday: 'Sabtu',
  Sunday: 'Minggu',
};

export function dayToBackend(day) {
  return DAY_MAP_ID_TO_EN[day] || day;
}

export function dayToFrontend(day) {
  return DAY_EN_TO_ID_SAFE(day);
}

function DAY_EN_TO_ID_SAFE(day) {
  return DAY_MAP_EN_TO_ID[day] || day;
}

export function mapScheduleToUI(schedule) {
  if (!schedule) return null;

  return {
    id: String(schedule.id),
    subjectId: String(schedule.subject_id),
    dayOfWeek: DAY_EN_TO_ID_SAFE(schedule.day_of_week),
    serverDay: schedule.day_of_week,
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    subject: schedule.subject ? mapSubjectToUI(schedule.subject) : null,
    room: 'Kelas Utama', // Fallback default
    teacher: 'Guru Mapel', // Fallback default
  };
}

export async function getSchedules() {
  const result = await apiGet(ENDPOINTS.SCHEDULES);
  const list = result?.data || [];
  return list.map(mapScheduleToUI);
}

export async function getTodaySchedules() {
  const result = await apiGet(ENDPOINTS.SCHEDULES_TODAY);
  const list = result?.data || [];
  return list.map(mapScheduleToUI);
}

export async function getWeekSchedules() {
  const result = await apiGet(ENDPOINTS.SCHEDULES_WEEK);
  const list = result?.data || [];
  return list.map(mapScheduleToUI);
}

export async function createSchedule({ subjectId, dayOfWeek, startTime, endTime }) {
  const payload = {
    subject_id: Number(subjectId),
    day_of_week: dayToBackend(dayOfWeek),
    start_time: startTime,
    end_time: endTime,
  };

  try {
    const result = await apiPost(ENDPOINTS.SCHEDULES, payload);
    return mapScheduleToUI(result?.data);
  } catch (err) {
    if (err.status === 409) {
      const conflictWith = err.errors?.conflict_with || '';
      const conflictMsg = conflictWith
        ? `Jadwal bentrok dengan jam ${conflictWith} pada hari yang sama.`
        : 'Jadwal bertabrakan dengan jadwal lain yang sudah ada.';
      const conflictError = new Error(conflictMsg);
      conflictError.status = 409;
      conflictError.isConflict = true;
      conflictError.conflictWith = conflictWith;
      throw conflictError;
    }
    throw err;
  }
}

export async function updateSchedule(id, { subjectId, dayOfWeek, startTime, endTime }) {
  const payload = {};
  if (subjectId !== undefined) payload.subject_id = Number(subjectId);
  if (dayOfWeek !== undefined) payload.day_of_week = dayToBackend(dayOfWeek);
  if (startTime !== undefined) payload.start_time = startTime;
  if (endTime !== undefined) payload.end_time = endTime;

  const result = await apiPatch(ENDPOINTS.SCHEDULE_DETAIL(id), payload);
  return mapScheduleToUI(result?.data);
}

export async function deleteSchedule(id) {
  return apiDelete(ENDPOINTS.SCHEDULE_DETAIL(id));
}

export default {
  getSchedules,
  getTodaySchedules,
  getWeekSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  dayToBackend,
  dayToFrontend,
  mapScheduleToUI,
};
