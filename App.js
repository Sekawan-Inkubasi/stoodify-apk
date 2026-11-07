import React, { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, Platform, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import HomeScreen from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AIPlanScreen from './src/screens/AIPlanScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
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
import { colors } from './src/constants/theme';
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
  const [preferencesVisible, setPreferencesVisible] = useState(false);
  const [scheduleDay, setScheduleDay] = useState('Senin');
  const [webFallback, setWebFallback] = useState(false);
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require('./assets/fonts/Poppins_400Regular.ttf'),
    Poppins_500Medium: require('./assets/fonts/Poppins_500Medium.ttf'),
    Poppins_600SemiBold: require('./assets/fonts/Poppins_600SemiBold.ttf'),
    Poppins_700Bold: require('./assets/fonts/Poppins_700Bold.ttf'),
  });
  const showMessage = useCallback((message, title = 'Stoodify') => Alert.alert(title, message), []);
  const data = useAppData(showMessage);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (chatVisible) { setChatVisible(false); return true; }
      if (webFallback) { setWebFallback(false); return true; }
      if (activeTab !== 'home') { setActiveTab('home'); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [activeTab, chatVisible, webFallback]);

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
  const handleLogout = useCallback(() => Alert.alert('Keluar dari akun?', 'Kamu akan kembali ke layar masuk.', [{ text: 'Batal', style: 'cancel' }, { text: 'Keluar', style: 'destructive', onPress: data.logout }]), [data.logout]);
  const handleDeleteSchedule = useCallback((item) => Alert.alert('Hapus jadwal?', `Jadwal ${item.subject?.name || ''} hari ${item.dayOfWeek} akan dihapus.`, [{ text: 'Batal', style: 'cancel' }, { text: 'Hapus', style: 'destructive', onPress: () => data.deleteSchedule(item) }]), [data.deleteSchedule]);
  const loadPreferences = useCallback(async () => { await data.loadPreferences(); setPreferencesVisible(true); }, [data.loadPreferences]);

  if (!fontsLoaded || data.authLoading) return <View style={styles.loading}><StatusBar barStyle="dark-content" backgroundColor={colors.canvas} /></View>;
  if (webFallback) return <EmergencyWebView onClose={() => setWebFallback(false)} />;
  const screenProps = {
    user: data.user, tasks: data.tasks, subjects: data.subjects, schedules: data.schedules,
    sessions: data.sessions, notifications: data.notifications, predictions: data.predictions,
    stats: { ...data.stats, unreadCount: data.notifications.filter((item) => !item.isRead).length }, loading: data.loading,
  };
  const selectedTask = detailTask ? data.tasks.find((task) => task.id === detailTask.id) || detailTask : null;

  return <View style={styles.root}><StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
    {!data.isLoggedIn ? <SafeAreaView edges={['top', 'bottom']} style={styles.authWrap}><AuthScreen onLogin={data.login} showMessage={showMessage} /></SafeAreaView> : <>
      {data.dataError ? <Pressable onPress={data.refresh} style={styles.dataError}><AppText style={styles.dataErrorText}>{data.dataError}  ·  Ketuk untuk coba lagi</AppText></Pressable> : null}
      <View style={styles.content}>
        {activeTab === 'home' ? <HomeScreen {...screenProps} onTab={setActiveTab} onAddTask={() => setAddTaskVisible(true)} onFocus={openFocus} onPredictions={() => setPredictionsVisible(true)} onSchedule={() => setActiveTab('calendar')} onNotifications={() => setNotificationsVisible(true)} onSelectTask={setDetailTask} onToggleTask={data.toggleTask} /> : null}
        {activeTab === 'tasks' ? <TasksScreen {...screenProps} onOpenTask={setDetailTask} onToggle={data.toggleTask} onAdd={() => setAddTaskVisible(true)} onManageSubjects={() => setSubjectModalVisible(true)} /> : null}
        {activeTab === 'calendar' ? <CalendarScreen {...screenProps} onAddSchedule={(day) => { setScheduleDay(day); setAddScheduleVisible(true); }} onManageSubjects={() => setSubjectModalVisible(true)} onDeleteSchedule={handleDeleteSchedule} onFocus={openFocus} /> : null}
        {activeTab === 'ai-plan' ? <AIPlanScreen {...screenProps} onReschedule={data.reschedule} onAccept={data.acceptSession} onReject={data.rejectSession} onFocus={openFocus} onChat={() => setChatVisible(true)} /> : null}
        {activeTab === 'profile' ? <ProfileScreen {...screenProps} subjectsCount={data.subjects.length} onAvatar={handleAvatar} onManageSubjects={() => setSubjectModalVisible(true)} onHelp={() => showMessage('Untuk bantuan, hubungi tim Stoodify melalui kontak dukungan sekolah.', 'Pusat Bantuan Stoodify')} onPro={() => setProVisible(true)} onLogout={handleLogout} onPreferences={loadPreferences} onWebFallback={() => setWebFallback(true)} /> : null}
      </View>
      <BottomTabs active={activeTab} onChange={setActiveTab} urgentCount={data.tasks.filter((task) => task.status !== 'selesai' && task.priorityScore >= 60).length} bottom={Math.max(14, insets.bottom + 8)} />
      <Pressable accessibilityLabel="Buka Stoodify AI Assistant" onPress={() => setChatVisible(true)} style={[styles.assistantTab, { bottom: Math.max(115, insets.bottom + 110) }]}><View style={styles.assistantPulse} /><View style={styles.assistantLabel}><AppText style={styles.assistantText}>AI ASSISTANT</AppText></View></Pressable>
    </>}

    <AddTaskModal visible={addTaskVisible} onClose={() => setAddTaskVisible(false)} subjects={data.subjects} onSubmit={data.addTask} onManageSubjects={() => setSubjectModalVisible(true)} showMessage={showMessage} />
    <AddScheduleModal visible={addScheduleVisible} onClose={() => setAddScheduleVisible(false)} subjects={data.subjects} defaultDay={scheduleDay} onSubmit={data.addSchedule} onManageSubjects={() => setSubjectModalVisible(true)} />
    <ManageSubjectsModal visible={subjectModalVisible} onClose={() => setSubjectModalVisible(false)} subjects={data.subjects} onCreate={data.addSubject} onUpdate={data.updateSubject} onDelete={data.deleteSubject} />
    <TaskDetailModal task={selectedTask} visible={Boolean(detailTask)} onClose={() => setDetailTask(null)} onToggle={async (task) => { await data.toggleTask(task); setDetailTask(null); }} onDelete={async (task) => { await data.deleteTask(task); setDetailTask(null); }} onFocus={(task) => { setDetailTask(null); openFocus(task); }} onProgress={data.updateProgress} onCreateSubtask={data.createSubtask} onToggleSubtask={data.toggleSubtask} />
    <FocusTimerModal visible={focus.visible} task={focus.task} initialMinutes={focus.minutes} onClose={() => setFocus((value) => ({ ...value, visible: false }))} onComplete={() => data.refresh()} />
    <NotificationsModal visible={notificationsVisible} onClose={() => setNotificationsVisible(false)} notifications={data.notifications} onMarkAll={data.markAllRead} onMarkRead={data.markRead} />
    <PredictionsModal visible={predictionsVisible} onClose={() => setPredictionsVisible(false)} subjects={data.subjects} predictions={data.predictions} onGenerate={data.generatePrediction} onFeedback={data.predictionFeedback} busy={data.loading} />
    <ChatDrawer visible={chatVisible} onClose={() => setChatVisible(false)} user={data.user} tasks={data.tasks} sessions={data.sessions} onReschedule={data.reschedule} onFocus={() => openFocus()} showMessage={showMessage} />
    <PreferencesModal visible={preferencesVisible} onClose={() => setPreferencesVisible(false)} value={data.preferences} onSave={data.savePreferences} busy={data.loading} />
    <ProModal visible={proVisible} onClose={() => setProVisible(false)} showMessage={showMessage} />
  </View>;
}

export default function App() {
  return <SafeAreaProvider><AppErrorBoundary><StoodifyApp /></AppErrorBoundary></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', maxWidth: 448, alignSelf: 'center', backgroundColor: colors.canvas }, content: { flex: 1 }, authWrap: { flex: 1, backgroundColor: '#fff' }, loading: { flex: 1, backgroundColor: colors.canvas }, dataError: { backgroundColor: '#FFF7E8', paddingHorizontal: 14, paddingVertical: 8 }, dataErrorText: { color: '#9A5C00', fontSize: 9, textAlign: 'center' }, assistantTab: { position: 'absolute', right: 0, zIndex: 5 }, assistantPulse: { position: 'absolute', width: 42, height: 42, borderRadius: 22, left: -5, backgroundColor: 'rgba(0,98,255,0.18)' }, assistantLabel: { width: 34, height: 112, borderTopLeftRadius: 17, borderBottomLeftRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5 }, assistantText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 8, letterSpacing: 1.4, transform: [{ rotate: '-90deg' }], width: 86, textAlign: 'center' },
});
