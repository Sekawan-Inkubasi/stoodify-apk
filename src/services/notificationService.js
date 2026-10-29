import { apiGet, apiPatch } from './apiClient';
import { ENDPOINTS } from '../constants/apiEndpoints';

export function mapNotificationToUI(notif) {
  if (!notif) return null;

  return {
    id: String(notif.id),
    taskId: notif.task_id ? String(notif.task_id) : null,
    title: notif.title || '',
    message: notif.message || '',
    type: notif.type || 'reminder',
    scheduledAt: notif.scheduled_at,
    isRead: Boolean(notif.is_read),
    createdAt: notif.created_at,
  };
}

export async function getNotifications(params = { unread: true }) {
  const result = await apiGet(ENDPOINTS.NOTIFICATIONS, params);
  const list = result?.data || [];
  return list.map(mapNotificationToUI);
}

export async function markAsRead(id) {
  const result = await apiPatch(ENDPOINTS.NOTIFICATION_MARK_READ(id));
  return mapNotificationToUI(result?.data);
}

export async function markAllAsRead() {
  const result = await apiPatch(ENDPOINTS.NOTIFICATION_MARK_ALL_READ);
  return result?.data;
}

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  mapNotificationToUI,
};
