import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CalendarClock, Check, ChevronRight, Clock3, Sparkles, X } from 'lucide-react-native';
import { AppText, Button, Card, EmptyState, Header, Pill, Screen, SectionTitle } from '../components/ui';
import { colors } from '../constants/theme';

export default function AIPlanScreen({ sessions = [], tasks = [], loading, onReschedule, onAccept, onReject, onFocus, onChat }) {
  const [filter, setFilter] = useState('all');
  const safeSessions = Array.isArray(sessions) ? sessions.filter(Boolean) : [];
  const safeTasks = Array.isArray(tasks) ? tasks.filter(Boolean) : [];

  const visible = useMemo(() => safeSessions.filter((session) => {
    if (!session) return false;
    const today = new Date().toISOString().slice(0, 10);
    if (filter === 'today') return session.date === today;
    if (filter === 'upcoming') return String(session.date || '') >= today;
    return true;
  }), [safeSessions, filter]);

  const workload = safeTasks.filter((task) => task.status !== 'selesai').reduce((sum, task) => sum + (Number(task.estimatedDurationMinutes) || 0), 0);

  return <Screen>
    <Header title="Rencana Belajar AI" subtitle="Smart Scheduler & Workload Balancer" />
    <Card style={styles.assistant}><View style={styles.assistantIcon}><Sparkles size={18} color="#fff" /></View><View style={styles.assistantCopy}><AppText style={styles.assistantTitle}>Stoodify AI Assistant Aktif</AppText><AppText style={styles.assistantSub}>Butuh konsultasi belajar atau tanya PR?</AppText></View><Pressable onPress={onChat} style={styles.ask}><AppText style={styles.askText}>Tanya AI</AppText></Pressable></Card>
    <Card style={styles.workload}><View style={styles.workIcon}><CalendarClock size={19} color={colors.primary} /></View><View style={styles.workCopy}><AppText style={styles.workTitle}>Beban Belajar Aktif</AppText><AppText style={styles.workSub}>{safeTasks.filter((task) => task.status !== 'selesai').length} tugas · sekitar {Math.ceil(workload / 60)} jam pengerjaan</AppText></View><AppText style={styles.workValue}>{safeSessions.length}</AppText></Card>
    <Button title={loading ? 'Menyusun Jadwal...' : 'Jalankan Adaptive Rescheduling Otomatis'} icon={Sparkles} onPress={onReschedule} disabled={loading} />
    <View style={styles.section}><SectionTitle>URUTAN PRIORITAS BELAJAR ({visible.length})</SectionTitle></View>
    <View style={styles.filters}><Pill title="Semua" active={filter === 'all'} onPress={() => setFilter('all')} /><Pill title="Hari Ini" active={filter === 'today'} onPress={() => setFilter('today')} /><Pill title="Mendatang" active={filter === 'upcoming'} onPress={() => setFilter('upcoming')} /></View>
    {visible.length ? visible.map((session, index) => {
      const pending = session.status === 'planned' || session.status === 'recommended';
      return <Card key={session.id || String(Math.random())} style={styles.session}><View style={styles.rank}><AppText style={styles.rankText}>{index + 1}</AppText></View><View style={styles.sessionCopy}><View style={styles.sessionMeta}><AppText style={styles.date}>{session.date ? new Date(`${session.date}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Sesi belajar'}</AppText><AppText style={styles.status}>{session.status === 'completed' ? 'Selesai' : session.status === 'skipped' ? 'Terlewat' : 'Terjadwal'}</AppText></View><AppText style={styles.sessionTitle}>{session.task?.title || 'Tugas belajar'}</AppText><AppText style={styles.sessionSub}>{session.task?.subject?.name || 'Mata pelajaran'} · {session.startTime || '-'} · {session.durationMinutes || 45} menit</AppText>{session.reason ? <AppText style={styles.reason} numberOfLines={2}>{session.reason}</AppText> : null}<View style={styles.sessionActions}>{pending ? <><Pressable onPress={() => onAccept(session)} style={styles.accept}><Check size={14} color={colors.success} /><AppText style={styles.acceptText}>Terima</AppText></Pressable><Pressable onPress={() => onReject(session)} style={styles.reject}><X size={14} color={colors.danger} /><AppText style={styles.rejectText}>Tolak</AppText></Pressable></> : <Pressable onPress={() => onFocus(session.task)} style={styles.focus}><Clock3 size={14} color={colors.primary} /><AppText style={styles.focusText}>Mulai Fokus</AppText><ChevronRight size={13} color={colors.primary} /></Pressable>}</View></View></Card>;
    }) : <EmptyState icon={CalendarClock} title="Belum Ada Sesi Belajar Terjadwal" subtitle="Susun jadwal dari tugas aktif menggunakan rekomendasi backend AI." action="Susun Jadwal Sekarang" onAction={onReschedule} />}
  </Screen>;
}

const styles = StyleSheet.create({
  assistant: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13 }, assistantIcon: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }, assistantCopy: { flex: 1 }, assistantTitle: { fontFamily: 'Poppins_700Bold', fontSize: 10 }, assistantSub: { color: colors.muted, fontSize: 9, marginTop: 3 }, ask: { paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#EFF6FF', borderRadius: 12 }, askText: { color: colors.primary, fontSize: 9, fontFamily: 'Poppins_600SemiBold' }, workload: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFF' }, workIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' }, workCopy: { flex: 1 }, workTitle: { fontFamily: 'Poppins_700Bold', fontSize: 10 }, workSub: { color: colors.muted, fontSize: 9, marginTop: 3 }, workValue: { fontFamily: 'Poppins_700Bold', color: colors.primary, fontSize: 18 }, section: { marginTop: 4 }, filters: { flexDirection: 'row', gap: 8 }, session: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, padding: 14 }, rank: { width: 29, height: 29, borderRadius: 11, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' }, rankText: { color: colors.primary, fontFamily: 'Poppins_700Bold', fontSize: 11 }, sessionCopy: { flex: 1 }, sessionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, date: { color: colors.muted, fontSize: 9, fontFamily: 'Poppins_600SemiBold' }, status: { color: colors.success, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, fontSize: 8 }, sessionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 11, marginTop: 7 }, sessionSub: { color: colors.muted, fontSize: 9, marginTop: 3 }, reason: { color: '#475569', fontSize: 9, marginTop: 7, lineHeight: 15 }, sessionActions: { flexDirection: 'row', gap: 14, marginTop: 12 }, accept: { flexDirection: 'row', alignItems: 'center', gap: 4 }, acceptText: { color: colors.success, fontFamily: 'Poppins_600SemiBold', fontSize: 9 }, reject: { flexDirection: 'row', alignItems: 'center', gap: 4 }, rejectText: { color: colors.danger, fontFamily: 'Poppins_600SemiBold', fontSize: 9 }, focus: { flexDirection: 'row', alignItems: 'center', gap: 4 }, focusText: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 9 },
});
