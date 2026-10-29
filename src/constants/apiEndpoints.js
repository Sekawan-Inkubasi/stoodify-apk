/**
 * Konstanta Endpoint API Backend Stoodify (Golang Gin)
 * Seluruh endpoint berada di bawah prefix /api/
 */

export const ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_ME: '/auth/me',
  AUTH_LOGOUT: '/auth/logout',

  // Users & Preferences
  USER_ME: '/users/me',
  USER_PREFERENCES: '/users/me/preferences',

  // Subjects
  SUBJECTS: '/subjects/',
  SUBJECT_DETAIL: (id) => `/subjects/${id}`,

  // Schedules
  SCHEDULES: '/schedules/',
  SCHEDULES_TODAY: '/schedules/today',
  SCHEDULES_WEEK: '/schedules/week',
  SCHEDULE_DETAIL: (id) => `/schedules/${id}`,

  // Tasks
  TASKS: '/tasks/',
  TASKS_UPCOMING: '/tasks/upcoming',
  TASKS_OVERDUE: '/tasks/overdue',
  TASK_DETAIL: (id) => `/tasks/${id}`,
  TASK_STATUS: (id) => `/tasks/${id}/status`,
  TASK_PROGRESS: (id) => `/tasks/${id}/progress`,

  // Subtasks
  TASK_SUBTASKS: (taskId) => `/tasks/${taskId}/subtasks/`,
  SUBTASK_DETAIL: (id) => `/subtasks/${id}`,

  // Routine Activities
  ACTIVITIES: '/activities/',
  ACTIVITY_DETAIL: (id) => `/activities/${id}`,

  // Study Sessions
  STUDY_SESSIONS: '/study-sessions/',
  STUDY_SESSIONS_TODAY: '/study-sessions/today',
  STUDY_SESSION_DETAIL: (id) => `/study-sessions/${id}`,

  // AI Bridge
  AI_SCHEDULE_GENERATE: '/ai/schedule-recommendations/generate',
  AI_SCHEDULE_RECOMMENDATIONS: '/ai/schedule-recommendations',
  AI_SCHEDULE_ACCEPT: (id) => `/ai/schedule-recommendations/${id}/accept`,
  AI_SCHEDULE_REJECT: (id) => `/ai/schedule-recommendations/${id}/reject`,
  AI_RESCHEDULE: '/ai/reschedule',
  AI_PREDICTION_GENERATE: '/ai/material-predictions/generate',
  AI_PREDICTIONS_BY_SUBJECT: (subjectId) => `/ai/material-predictions/${subjectId}`,
  AI_PREDICTION_FEEDBACK: (id) => `/ai/material-predictions/${id}/feedback`,

  // Notifications
  NOTIFICATIONS: '/notifications/',
  NOTIFICATION_MARK_READ: (id) => `/notifications/${id}/read`,
  NOTIFICATION_MARK_ALL_READ: '/notifications/read-all',

  // Statistics
  STATS_OVERVIEW: '/statistics/overview',
  STATS_WEEKLY: '/statistics/weekly',
  STATS_MONTHLY: '/statistics/monthly',
  STATS_SUBJECTS: '/statistics/subjects',
};

export default ENDPOINTS;
