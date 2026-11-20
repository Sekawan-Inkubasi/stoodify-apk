import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Modal, Platform, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import { DialogProvider, useDialog } from './src/context/DialogContext';
import HomeScreen from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AIPlanScreen from './src/screens/AIPlanScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import BottomTabs from './src/components/BottomTabs';
import AddTaskModal from './src/components/AddTaskModal';
import AddScheduleModal from './src/components/AddScheduleModal';
import ManageSubjectsModal from './src/components/ManageSubjectsModal';
import TaskDetailModal from './src/components/TaskDetailModal';
import FocusTimerModal from './src/components/FocusTimerModal';
import NotificationsModal from './src/components/NotificationsModal';
import PredictionsModal from './src/components/PredictionsModal';
import ChatDrawer from './src/components/ChatDrawer';
import EmergencyWebView from './src/components/EmergencyWebView';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import { PreferencesModal, ProModal } from './src/components/AccountModals';
import { AppText } from './src/components/ui';
import DraggableAssistantTab from './src/components/DraggableAssistantTab';
import UndoToast from './src/components/UndoToast';
import EditSessionModal from './src/components/EditSessionModal';
import { colors } from './src/constants/theme';
import tokenStorage from './src/services/tokenStorage';
import useAppData from './src/hooks/useAppData';

function StoodifyApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [addTaskVisible, setAddTaskVisible] = useState(false);
  const [addScheduleVisible, setAddScheduleVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [focus, setFocus] = useState({ visible: false, task: null, minutes: 25 });
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [predictionsVisible, setPredictionsVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [proVisible, setProVisible] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [preferencesVisible, setPreferencesVisible] = useState(false);
  const [scheduleDay, setScheduleDay] = useState('Senin');
  const [webFallback, setWebFallback] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);
  const [onboardingForced, setOnboardingForced] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('welcome');
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require('./assets/fonts/Poppins_400Regular.ttf'),
    Poppins_500Medium: require('./assets/fonts/Poppins_500Medium.ttf'),
    Poppins_600SemiBold: require('./assets/fonts/Poppins_600SemiBold.ttf'),
    Poppins_700Bold: require('./assets/fonts/Poppins_700Bold.ttf'),
  });
  const { showDialog, showMessage } = useDialog();
  const data = useAppData(showMessage);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!data.isLoggedIn) return false;
      if (chatVisible) { setChatVisible(false); return true; }
      if (webFallback) { setWebFallback(false); return true; }
      if (activeTab !== 'home') { setActiveTab('home'); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [activeTab, chatVisible, data.isLoggedIn, webFallback]);

  useEffect(() => {
    tokenStorage.getHasSeenOnboarding().then((seen) => setHasSeenOnboarding(Boolean(seen)));
  }, []);

  const openFocus = useCallback((task = null, minutes = null) => {
    const target = minutes || task?.estimatedDurationMinutes || 25;
    setFocus({ visible: true, task, minutes: target });
  }, []);
  const handleAvatar = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return showMessage('Izinkan akses galeri untuk memilih foto profil.', 'Izin Galeri');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!result.canceled && result.assets?.[0]) await data.uploadAvatar(result.assets[0]);
  }, [data, showMessage]);
  const handleLogout = useCallback(() => {
    showDialog({
      title: 'Keluar dari akun?',
      message: 'Kamu akan kembali ke layar masuk.',
      type: 'danger',
      confirmText: 'Keluar',
      cancelText: 'Batal',
      showCancel: true,
      onConfirm: () => {
        setActiveTab('home');
        setAuthInitialMode('welcome');
        data.logout();
      },
    });
  }, [data.logout, showDialog]);
  const handleDeleteSchedule = useCallback((item) => {
    showDialog({
      title: 'Hapus jadwal?',
      message: `Jadwal ${item.subject?.name || ''} hari ${item.dayOfWeek} akan dihapus.`,
      type: 'danger',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      showCancel: true,
      onConfirm: () => data.deleteSchedule(item),
    });
  }, [data.deleteSchedule, showDialog]);
  const loadPreferences = useCallback(async () => { await data.loadPreferences(); setPreferencesVisible(true); }, [data.loadPreferences]);

  if (!fontsLoaded || data.authLoading) return <View style={styles.loading}><StatusBar barStyle="dark-content" backgroundColor={colors.canvas} /></View>;
  if (webFallback) return <EmergencyWebView onClose={() => setWebFallback(false)} />;
  const safeTasks = Array.isArray(data.tasks) ? data.tasks.filter(Boolean) : [];
  const safeNotifications = Array.isArray(data.notifications) ? data.notifications.filter(Boolean) : [];
  const safeSessions = Array.isArray(data.sessions) ? data.sessions.filter(Boolean) : [];
  const safeSubjects = Array.isArray(data.subjects) ? data.subjects.filter(Boolean) : [];
  const safeSchedules = Array.isArray(data.schedules) ? data.schedules.filter(Boolean) : [];
  const safePredictions = Array.isArray(data.predictions) ? data.predictions.filter(Boolean) : [];
  const unreadCount = safeNotifications.filter((item) => !item.isRead).length;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const urgentCount = safeTasks.filter((task) => {
    if (task.status === 'selesai') return false;
    if (!task.deadline) return Number(task.priorityScore) >= 85;
    const d = new Date(task.deadline);
    if (Number.isNaN(d.getTime())) return Number(task.priorityScore) >= 85;
    const deadlineStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return deadlineStr <= todayStr || Number(task.priorityScore) >= 85;
  }).length;

  const screenProps = {
    user: data.user,
    tasks: safeTasks,
    subjects: safeSubjects,
    schedules: safeSchedules,
    sessions: safeSessions,
    notifications: safeNotifications,
    predictions: safePredictions,
    stats: { ...(data.stats || {}), unreadCount },
    loading: data.loading,
    isOnline: data.isOnline,
  };
  const selectedTask = detailTask ? safeTasks.find((task) => task.id === detailTask.id) || detailTask : null;

  return <View style={styles.root}><StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
    {!data.isLoggedIn ? (
      (hasSeenOnboarding === false || onboardingForced) ? (
        <SafeAreaView edges={['top', 'bottom']} style={styles.authWrap}>
          <OnboardingScreen
            onComplete={(mode) => {
              setHasSeenOnboarding(true);
              setOnboardingForced(false);
              setAuthInitialMode(mode || 'login');
            }}
          />
        </SafeAreaView>
      ) : (
        <SafeAreaView edges={['top', 'bottom']} style={styles.authWrap}>
          <AuthScreen initialMode={authInitialMode} onLogin={data.login} showMessage={showMessage} />
        </SafeAreaView>
      )
    ) : <>
      {!data.isOnline ? (
        <View style={styles.offlineBanner}>
          <AppText style={styles.offlineBannerText}>Mode Offline · Perubahan disimpan lokal & disinkronkan saat online</AppText>
        </View>
      ) : null}
      {data.dataError ? <Pressable onPress={data.refresh} style={styles.dataError}><AppText style={styles.dataErrorText}>{data.dataError}  ·  Ketuk untuk coba lagi</AppText></Pressable> : null}
      <View style={styles.content}>
        {activeTab === 'home' ? <HomeScreen {...screenProps} onTab={setActiveTab} onAddTask={() => setAddTaskVisible(true)} onFocus={openFocus} onPredictions={() => setPredictionsVisible(true)} onSchedule={() => setActiveTab('calendar')} onNotifications={() => setNotificationsVisible(true)} onSelectTask={setDetailTask} onToggleTask={data.toggleTask} /> : null}
        {activeTab === 'tasks' ? <TasksScreen {...screenProps} onOpenTask={setDetailTask} onToggle={data.toggleTask} onAdd={() => setAddTaskVisible(true)} onManageSubjects={() => setSubjectModalVisible(true)} /> : null}
        {activeTab === 'calendar' ? <CalendarScreen {...screenProps} onAddSchedule={(day) => { setScheduleDay(day); setAddScheduleVisible(true); }} onManageSubjects={() => setSubjectModalVisible(true)} onDeleteSchedule={handleDeleteSchedule} onFocus={openFocus} /> : null}
        {activeTab === 'ai-plan' ? <AIPlanScreen {...screenProps} onReschedule={data.reschedule} onFocus={openFocus} onChat={() => setChatVisible(true)} onEditSession={setEditingSession} /> : null}
        {activeTab === 'profile' ? <ProfileScreen {...screenProps} subjectsCount={safeSubjects.length} onAvatar={handleAvatar} onManageSubjects={() => setSubjectModalVisible(true)} onHelp={() => showMessage('Untuk bantuan, hubungi tim Stoodify melalui kontak dukungan sekolah.', 'Pusat Bantuan Stoodify')} onPro={() => setProVisible(true)} onLogout={handleLogout} onPreferences={loadPreferences} onWebFallback={() => setWebFallback(true)} onReplayOnboarding={() => setOnboardingForced(true)} /> : null}
      </View>
      <BottomTabs active={activeTab} onChange={setActiveTab} urgentCount={urgentCount} bottom={Math.max(14, insets.bottom + 8)} />
      <DraggableAssistantTab onPress={() => setChatVisible(true)} />
      <UndoToast visible={data.undoToastVisible} onView={() => setActiveTab('ai-plan')} onUndo={data.undoScheduleChange} onDismiss={() => data.setUndoToastVisible(false)} bottom={Math.max(14, insets.bottom + 8) + 68} />
    </>}

    {onboardingForced && data.isLoggedIn ? (
      <Modal visible animationType="slide" onRequestClose={() => setOnboardingForced(false)}>
        <OnboardingScreen onComplete={() => setOnboardingForced(false)} />
      </Modal>
    ) : null}

    <AddTaskModal visible={addTaskVisible} onClose={() => setAddTaskVisible(false)} subjects={data.subjects} onSubmit={data.addTask} onManageSubjects={() => setSubjectModalVisible(true)} showMessage={showMessage} />
    <AddScheduleModal visible={addScheduleVisible} onClose={() => setAddScheduleVisible(false)} subjects={data.subjects} defaultDay={scheduleDay} onSubmit={data.addSchedule} onManageSubjects={() => setSubjectModalVisible(true)} />
    <ManageSubjectsModal visible={subjectModalVisible} onClose={() => setSubjectModalVisible(false)} subjects={data.subjects} onCreate={data.addSubject} onUpdate={data.updateSubject} onDelete={data.deleteSubject} />
    <TaskDetailModal task={selectedTask} visible={Boolean(detailTask)} onClose={() => setDetailTask(null)} onToggle={async (task) => { await data.toggleTask(task); setDetailTask(null); }} onDelete={async (task) => { await data.deleteTask(task); setDetailTask(null); }} onFocus={(task) => { setDetailTask(null); openFocus(task); }} onProgress={data.updateProgress} onCreateSubtask={data.createSubtask} onToggleSubtask={data.toggleSubtask} />
    <EditSessionModal visible={Boolean(editingSession)} session={editingSession} onClose={() => setEditingSession(null)} onSubmit={data.editSession} />
    <FocusTimerModal visible={focus.visible} task={focus.task} initialMinutes={focus.minutes} onClose={() => setFocus((value) => ({ ...value, visible: false }))} onComplete={() => data.refresh()} />
    <NotificationsModal visible={notificationsVisible} onClose={() => setNotificationsVisible(false)} notifications={data.notifications} onMarkAll={data.markAllRead} onMarkRead={data.markRead} loading={data.loading} />
    <PredictionsModal visible={predictionsVisible} onClose={() => setPredictionsVisible(false)} subjects={data.subjects} predictions={data.predictions} onGenerate={data.generatePrediction} onFeedback={data.predictionFeedback} busy={data.loading} isOnline={data.isOnline} />
    <ChatDrawer visible={chatVisible} onClose={() => setChatVisible(false)} user={data.user} tasks={data.tasks} sessions={data.sessions} onReschedule={data.reschedule} onFocus={() => openFocus()} showMessage={showMessage} isOnline={data.isOnline} />
    <PreferencesModal visible={preferencesVisible} onClose={() => setPreferencesVisible(false)} value={data.preferences} onSave={data.savePreferences} busy={data.loading} />
    <ProModal visible={proVisible} onClose={() => setProVisible(false)} showMessage={showMessage} />
  </View>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <DialogProvider>
          <StoodifyApp />
        </DialogProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', maxWidth: 448, alignSelf: 'center', backgroundColor: colors.canvas },
  content: { flex: 1 },
  authWrap: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, backgroundColor: colors.canvas },
  dataError: { backgroundColor: '#FFF7E8', paddingHorizontal: 14, paddingVertical: 8 },
  dataErrorText: { color: '#9A5C00', fontSize: 12, textAlign: 'center' },
  offlineBanner: { backgroundColor: '#FEF3C7', paddingHorizontal: 14, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#FDE68A' },
  offlineBannerText: { color: '#92400E', fontSize: 11, textAlign: 'center', fontFamily: 'Poppins_500Medium' },
});
