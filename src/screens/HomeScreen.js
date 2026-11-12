import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Bell, Brain, CalendarDays, CheckCircle2, Clock3, Plus, Search, Sparkles, Target, Timer, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText, Button, Card, EmptyState, Screen, SectionTitle } from '../components/ui';
import { colors } from '../constants/theme';

function QuickAction({ icon: Icon, title, subtitle, tint, onPress }) {
  return <Pressable onPress={onPress} style={styles.quick}><View style={[styles.quickIcon, { backgroundColor: tint }]}><Icon size={19} color={colors.primary} /></View><AppText style={styles.quickTitle}>{title}</AppText><AppText style={styles.quickSub}>{subtitle}</AppText></Pressable>;
}

export default function HomeScreen({ user, tasks = [], sessions = [], stats = {}, onTab, onAddTask, onFocus, onPredictions, onSchedule, onNotifications, onSelectTask, onToggleTask }) {
  const safeTasks = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
  const safeSessions = Array.isArray(sessions) ? sessions.filter(Boolean) : [];
  const safeStats = stats || {};
  const pending = safeTasks.filter((task) => task.status !== 'selesai' && task.status !== 'terlambat');
  const urgent = pending.filter((task) => Number(task.priorityScore) >= 60).length;

  return <Screen>
    <View style={styles.topActions}>
      <Pressable style={styles.avatar} onPress={() => onTab('profile')}>
        <AppText style={styles.avatarText}>{(user?.name || 'S').slice(0, 1).toUpperCase()}</AppText>
      </Pressable>
      <View style={styles.greeting}>
        <AppText style={styles.greetingTitle}>Halo, {user?.name?.split(' ')?.[0] || 'Siswa'}</AppText>
        <AppText style={styles.greetingSub}>{user?.school || 'Stoodify'}  ·  🔥 {safeStats?.streakDays || 0}d Streak</AppText>
      </View>
      <View style={styles.topSpacer} />
      <Pressable onPress={() => onTab('tasks')} style={styles.topIcon}>
        <Search size={18} color="#334155" />
      </Pressable>
      <Pressable onPress={onNotifications} style={styles.topIcon}>
        <Bell size={18} color="#334155" />
        {Number(safeStats?.unreadCount) > 0 ? <View style={styles.notificationDot} /> : null}
      </Pressable>
    </View>
    <LinearGradient colors={['#064CE0', '#126EFF', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <AppText style={styles.metricLabel}>Total Tugas</AppText>
          <View style={styles.metricValueRow}>
            <AppText style={styles.metricValue}>{safeStats?.totalTasks ?? safeTasks.length}</AppText>
            <AppText style={styles.metricNote}>Tugas Terdaftar</AppText>
          </View>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <AppText style={styles.metricLabel}>Tugas Prioritas</AppText>
          <View style={styles.metricValueRow}>
            <AppText style={[styles.metricValue, styles.urgent]}>{urgent}</AppText>
            <AppText style={styles.metricNote}>Terkendali</AppText>
          </View>
        </View>
      </View>
      <View style={styles.heroActions}>
        <Button title="Mulai Mode Fokus" icon={Timer} onPress={() => onFocus()} variant="outline" style={styles.heroButton} />
        <Button title="Tanya AI Asisten" icon={Sparkles} onPress={() => onTab('ai-plan')} variant="secondary" textColor="#fff" iconColor="#fff" style={styles.heroButtonSoft} />
      </View>
    </LinearGradient>
    <View style={styles.quickGrid}>
      <QuickAction icon={Plus} title="Tambah" subtitle="Tugas" tint="#E2EDFF" onPress={onAddTask} />
      <QuickAction icon={Clock3} title="Fokus" subtitle="Pomodoro" tint="#EEF2FF" onPress={() => onFocus()} />
      <QuickAction icon={Brain} title="Prediksi" subtitle="Materi" tint="#FFF7E8" onPress={onPredictions} />
      <QuickAction icon={CalendarDays} title="Jadwal" subtitle="Sekolah" tint="#EFF6FF" onPress={onSchedule} />
    </View>
    <Card style={styles.insight}>
      <View style={styles.insightIcon}><Sparkles size={18} color={colors.primary} /></View>
      <View style={styles.insightCopy}>
        <AppText style={styles.insightTitle}>Insight AI Beban Belajar</AppText>
        <AppText style={styles.insightSub}>{pending.length ? `${pending.length} tugas aktif menunggu diselesaikan.` : 'Belum ada tugas terdaftar. Tekan tombol Tambah untuk memulai.'}</AppText>
      </View>
      <Pressable onPress={() => onTab('ai-plan')}><AppText style={styles.detail}>Detail</AppText></Pressable>
    </Card>
    {safeSessions.length ? (
      <Card style={styles.agenda}>
        <SectionTitle action="Lihat semua" onAction={() => onTab('ai-plan')}>AGENDA BELAJAR</SectionTitle>
        {safeSessions.slice(0, 2).map((session) => (
          <View key={session.id || String(Math.random())} style={styles.agendaRow}>
            <View style={styles.agendaDot} />
            <View style={styles.agendaCopy}>
              <AppText style={styles.agendaTitle} numberOfLines={1}>{session.task?.title || 'Sesi belajar'}</AppText>
              <AppText style={styles.agendaMeta}>{session.startTime || '17:00'} · {session.durationMinutes || 45} menit</AppText>
            </View>
            <CheckCircle2 size={16} color={colors.primary} />
          </View>
        ))}
      </Card>
    ) : (
      <EmptyState icon={Target} title="Belum Ada Agenda Belajar" subtitle="Tambahkan tugas agar Stoodify dapat membantu mengatur waktu belajar." action="Tambah Tugas Pertama" onAction={onAddTask} />
    )}
    <Card>
      <SectionTitle action="Lihat Semua" onAction={() => onTab('tasks')}>PRIORITAS TUGAS TERDEKAT ({pending.length})</SectionTitle>
      {pending.length ? (
        pending.slice(0, 3).map((task) => (
          <Pressable key={task.id || String(Math.random())} onPress={() => onSelectTask(task)} style={styles.taskRow}>
            <View style={styles.taskIcon}><Zap size={16} color={colors.primary} /></View>
            <View style={styles.taskCopy}>
              <AppText style={styles.taskTitle} numberOfLines={1}>{task.title || 'Tugas'}</AppText>
              <AppText style={styles.taskMeta}>{task.subject?.name || 'Mata pelajaran'} · Skor {Math.round(Number(task.priorityScore) || 0)}</AppText>
            </View>
            <Pressable onPress={() => onToggleTask(task)} hitSlop={10}>
              <CheckCircle2 size={20} color="#94A3B8" />
            </Pressable>
          </Pressable>
        ))
      ) : (
        <AppText style={styles.noTasks}>Semua tugasmu terkendali. Waktunya belajar hal baru!</AppText>
      )}
    </Card>
  </Screen>;
}

const styles = StyleSheet.create({
  topActions: { minHeight: 47, flexDirection: 'row', alignItems: 'center', gap: 9 }, avatar: { width: 38, height: 38, borderRadius: 20, borderWidth: 2, borderColor: '#fff', backgroundColor: '#DCE9FF', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.primary, fontFamily: 'Poppins_700Bold', fontSize: 12 }, greeting: { gap: 1 }, greetingTitle: { fontFamily: 'Poppins_700Bold', fontSize: 12 }, greetingSub: { color: colors.muted, fontSize: 8 }, topSpacer: { flex: 1 }, topIcon: { width: 40, height: 40, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', position: 'relative' }, notificationDot: { position: 'absolute', right: 9, top: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: '#F43F5E' },
  heroCard: { borderRadius: 28, padding: 18, marginTop: 7, shadowColor: '#0B4BCC', shadowOpacity: 0.21, shadowRadius: 17, shadowOffset: { width: 0, height: 9 }, elevation: 6 }, metrics: { flexDirection: 'row', alignItems: 'center' }, metric: { flex: 1 }, metricDivider: { height: 48, width: 1, backgroundColor: 'rgba(255,255,255,0.24)', marginHorizontal: 12 }, metricLabel: { color: '#DCE8FF', fontSize: 9 }, metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 3 }, metricValue: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 23 }, metricNote: { color: '#EAF2FF', fontSize: 9 }, urgent: { color: '#FFD84A' }, heroActions: { borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', gap: 8, marginTop: 15, paddingTop: 14 }, heroButton: { flex: 1, minHeight: 38, borderWidth: 0, backgroundColor: '#fff' }, heroButtonSoft: { flex: 1, minHeight: 38, backgroundColor: 'rgba(255,255,255,0.22)' },
  quickGrid: { flexDirection: 'row', gap: 9 }, quick: { flex: 1, minHeight: 96, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 9 }, quickIcon: { width: 39, height: 39, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }, quickTitle: { fontFamily: 'Poppins_700Bold', fontSize: 9 }, quickSub: { color: '#94A3B8', fontSize: 9, lineHeight: 13 },
  insight: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13 }, insightIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }, insightCopy: { flex: 1 }, insightTitle: { fontFamily: 'Poppins_700Bold', fontSize: 10 }, insightSub: { color: colors.muted, fontSize: 9, marginTop: 3 }, detail: { color: colors.primary, backgroundColor: '#EFF6FF', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12, fontFamily: 'Poppins_600SemiBold', fontSize: 9 },
  agenda: { gap: 12 }, agendaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 10 }, agendaDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary }, agendaCopy: { flex: 1 }, agendaTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 10 }, agendaMeta: { color: colors.muted, fontSize: 9, marginTop: 2 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderColor: '#F1F5F9', paddingVertical: 10 }, taskIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }, taskCopy: { flex: 1 }, taskTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 10 }, taskMeta: { color: colors.muted, fontSize: 9, marginTop: 2 }, noTasks: { color: colors.muted, fontSize: 10, paddingTop: 14, textAlign: 'center' },
});
