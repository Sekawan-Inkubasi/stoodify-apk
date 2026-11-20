import { Platform } from 'react-native';

let Notifications = null;
try {
  const { requireOptionalNativeModule } = require('expo-modules-core');
  if (requireOptionalNativeModule('ExpoPushTokenManager') || requireOptionalNativeModule('ExpoNotificationScheduler')) {
    Notifications = require('expo-notifications');
  }
} catch {
  Notifications = null;
}

if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch {}
}

export async function setupNotificationChannel() {
  if (Platform.OS !== 'android' || !Notifications) return;
  try {
    await Notifications.setNotificationChannelAsync('stoodify_reminders', {
      name: 'Pengingat Tugas & Sesi Belajar',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0062FF',
      sound: 'default',
    });
  } catch {}
}

export async function requestNotificationPermission() {
  if (!Notifications) return true; // Graceful fallback
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return true;
    }
    const requested = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
}

export async function hasNotificationPermission() {
  if (!Notifications) return true;
  try {
    const settings = await Notifications.getPermissionsAsync();
    return settings.granted;
  } catch {
    return false;
  }
}

function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  const parts = String(dateStr).slice(0, 10).split('-');
  if (parts.length < 3) return null;
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function parseDateTime(dateStr, timeStr = '23:59') {
  const base = parseDateOnly(dateStr);
  if (!base) return null;
  const [hours, minutes] = String(timeStr).split(':').map((v) => Number(v) || 0);
  base.setHours(hours, minutes, 0, 0);
  return base;
}

export async function scheduleSessionReminder(session, offsetMinutes = 10) {
  if (!session || !session.date || !Notifications) return;
  await setupNotificationChannel();
  const startTime = session.startTime || '16:00';
  const sessionTarget = parseDateTime(session.date, startTime);
  if (!sessionTarget) return;

  const triggerTime = new Date(sessionTarget.getTime() - offsetMinutes * 60 * 1000);
  if (triggerTime.getTime() <= Date.now()) return;

  const notifId = `session-${session.id || session._id}`;
  const subjectName = session.subject?.name || session.task?.subject?.name || 'Materi Belajar';

  try {
    await Notifications.cancelScheduledNotificationAsync(notifId);
    await Notifications.scheduleNotificationAsync({
      identifier: notifId,
      content: {
        title: `⏰ ${offsetMinutes} Menit Lagi: Sesi Belajar ${subjectName}`,
        body: `Sesi belajarmu dimulai pukul ${startTime}. Siapkan diri dan mulai Mode Fokus!`,
        sound: 'default',
        channelId: 'stoodify_reminders',
        data: { type: 'session', sessionId: session.id, startTime },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerTime },
    });
  } catch {}
}

export async function scheduleTaskReminders(task) {
  if (!task || !task.deadline || task.status === 'selesai' || !Notifications) return;
  await setupNotificationChannel();
  const deadlineDate = parseDateOnly(task.deadline);
  if (!deadlineDate) return;

  const title = task.title || 'Tugas Sekolah';
  const subjectName = task.subject?.name || 'Mata Pelajaran';
  const baseId = `task-${task.id}`;
  const now = Date.now();

  const h2Date = new Date(deadlineDate.getTime() - 2 * 24 * 60 * 60 * 1000);
  h2Date.setHours(18, 0, 0, 0);

  const h1Date = new Date(deadlineDate.getTime() - 1 * 24 * 60 * 60 * 1000);
  h1Date.setHours(16, 0, 0, 0);

  const h0MorningDate = new Date(deadlineDate.getTime());
  h0MorningDate.setHours(7, 0, 0, 0);

  const deadlineFullTime = parseDateTime(task.deadline, task.deadlineTime || '23:59');
  const h0CountdownDate = new Date(deadlineFullTime.getTime() - 3 * 60 * 60 * 1000);

  const reminders = [
    {
      id: `${baseId}-h2`,
      date: h2Date,
      title: `📅 2 Hari Lagi: ${title}`,
      body: `Tugas ${subjectName} jatuh tempo lusa. Cicil langkah pertamamu malam ini!`,
    },
    {
      id: `${baseId}-h1`,
      date: h1Date,
      title: `⚠️ Besok Tenggat: ${title}`,
      body: `Tugas belum tuntas! Jadwalkan sesi fokus sore ini untuk menyelesaikan tugas ${subjectName}.`,
    },
    {
      id: `${baseId}-h0-morning`,
      date: h0MorningDate,
      title: `🚨 Hari Ini Batas Pengumpulan: ${title}`,
      body: `Hari ini deadline tugas ${subjectName}! Pastikan tugas sudah siap sebelum berangkat sekolah.`,
    },
    {
      id: `${baseId}-h0-countdown`,
      date: h0CountdownDate,
      title: `⏰ 3 Jam Menuju Deadline: ${title}`,
      body: `Batas waktu pengumpulan semakin dekat! Tuntaskan sekarang dan tandai selesai di Stoodify.`,
    },
  ];

  for (const reminder of reminders) {
    if (reminder.date.getTime() > now) {
      try {
        await Notifications.cancelScheduledNotificationAsync(reminder.id);
        await Notifications.scheduleNotificationAsync({
          identifier: reminder.id,
          content: {
            title: reminder.title,
            body: reminder.body,
            sound: 'default',
            channelId: 'stoodify_reminders',
            data: { type: 'task', taskId: task.id },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.date },
        });
      } catch {}
    }
  }
}

export async function cancelTaskReminders(taskId) {
  if (!taskId || !Notifications) return;
  const baseId = `task-${taskId}`;
  const ids = [
    `${baseId}-h2`,
    `${baseId}-h1`,
    `${baseId}-h0-morning`,
    `${baseId}-h0-countdown`,
  ];
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {}
  }
}

export async function cancelSessionReminder(sessionId) {
  if (!sessionId || !Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(`session-${sessionId}`);
  } catch {}
}

export async function syncAllReminders({ tasks = [], sessions = [], preferences = {} }) {
  if (!Notifications) return;
  try {
    const offsetMinutes = Number(preferences.reminder_offset_minutes) || 10;
    const safeTasks = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
    const safeSessions = Array.isArray(sessions) ? sessions.filter(Boolean) : [];

    for (const task of safeTasks) {
      if (task.status === 'selesai') {
        await cancelTaskReminders(task.id);
      } else {
        await scheduleTaskReminders(task);
      }
    }

    for (const session of safeSessions) {
      if (session.status !== 'skipped' && session.status !== 'completed') {
        await scheduleSessionReminder(session, offsetMinutes);
      } else {
        await cancelSessionReminder(session.id);
      }
    }
  } catch {}
}

export default {
  setupNotificationChannel,
  requestNotificationPermission,
  hasNotificationPermission,
  scheduleSessionReminder,
  scheduleTaskReminders,
  cancelTaskReminders,
  cancelSessionReminder,
  syncAllReminders,
};
