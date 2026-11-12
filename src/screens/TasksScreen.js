import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CheckCircle2, Circle, Search, SlidersHorizontal, Sparkles } from 'lucide-react-native';
import { AppText, Card, EmptyState, Field, Header, Pill, Screen } from '../components/ui';
import { colors } from '../constants/theme';

const filters = [{ id: 'all', label: 'Semua' }, { id: 'urgent', label: 'Prioritas' }, { id: 'done', label: 'Tuntas' }];

function TaskCard({ task, onOpen, onToggle }) {
  const done = task.status === 'selesai';
  const priorityColor = Number(task.priorityScore) >= 80 ? '#E11D48' : Number(task.priorityScore) >= 60 ? '#D97706' : colors.primary;
  return <Pressable onPress={() => onOpen(task)} style={({ pressed }) => [styles.taskCard, pressed && styles.pressed]}>
    <Pressable onPress={() => onToggle(task)} hitSlop={9} style={styles.check}><CheckCircle2 size={21} color={done ? colors.success : '#CBD5E1'} fill={done ? '#D1FAE5' : 'transparent'} /></Pressable>
    <View style={styles.taskBody}><AppText style={[styles.taskTitle, done && styles.taskDone]} numberOfLines={2}>{task.title}</AppText><AppText style={styles.taskSub}>{task.subject?.name || 'Mata pelajaran'} · {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</AppText><View style={styles.taskBottom}><AppText style={[styles.priority, { color: priorityColor, backgroundColor: `${priorityColor}14` }]}>{Math.round(task.priorityScore || 0)} · {task.priority || 'Prioritas'}</AppText><AppText style={styles.taskDuration}>{task.estimatedDurationMinutes || 45} menit</AppText></View></View>
  </Pressable>;
}

export default function TasksScreen({ tasks = [], subjects = [], loading, onOpenTask, onToggle, onAdd, onManageSubjects }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('all');
  const safeTasks = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
  const safeSubjects = Array.isArray(subjects) ? subjects.filter(Boolean) : [];

  const visible = useMemo(() => safeTasks.filter((task) => {
    if (!task) return false;
    if (filter === 'urgent' && Number(task.priorityScore) < 60) return false;
    if (filter === 'done' && task.status !== 'selesai') return false;
    if (subject !== 'all' && String(task.subjectId) !== subject) return false;
    return `${task.title || ''} ${task.subject?.name || ''}`.toLowerCase().includes((query || '').toLowerCase());
  }), [safeTasks, filter, subject, query]);

  return <Screen>
    <Header title="Daftar Tugas" subtitle={`${safeTasks.filter((t) => t.status !== 'selesai').length} tugas aktif dijadwalkan AI`} action="Tambah" onAction={onAdd} />
    <Field value={query} onChangeText={setQuery} placeholder="Cari tugas, materi, atau mata pelajaran..." right={<Search size={17} color="#94A3B8" />} />
    <View style={styles.filters}>{filters.map((item) => <Pill key={item.id} title={`${item.label}${item.id === 'all' ? ` ${safeTasks.length}` : item.id === 'urgent' ? ` ${safeTasks.filter((t) => Number(t.priorityScore) >= 60).length}` : ` ${safeTasks.filter((t) => t.status === 'selesai').length}`}`} active={filter === item.id} onPress={() => setFilter(item.id)} />)}</View>
    <View style={styles.subjectRow}><SlidersHorizontal size={15} color={colors.primary} /><Pill title="Semua Mapel" active={subject === 'all'} onPress={() => setSubject('all')} />{safeSubjects.slice(0, 3).map((item) => <Pill key={item.id} title={item.code || item.name} active={subject === String(item.id)} onPress={() => setSubject(String(item.id))} />)}<Pressable onPress={onManageSubjects}><AppText style={styles.manage}>Atur Mapel</AppText></Pressable></View>
    {loading ? <View style={styles.loading}><AppText style={styles.muted}>Memuat tugas...</AppText></View> : visible.length ? visible.map((task) => <TaskCard key={task.id || String(Math.random())} task={task} onOpen={onOpenTask} onToggle={onToggle} />) : <EmptyState icon={filter === 'urgent' ? Sparkles : Circle} title={safeTasks.length ? 'Tidak Ada Tugas yang Cocok' : 'Belum Ada Tugas'} subtitle={safeTasks.length ? 'Coba ubah filter atau kata pencarian.' : 'Tugas yang kamu tambahkan akan muncul di sini dan terhubung ke backend.'} action={!safeTasks.length ? 'Tambah Tugas' : undefined} onAction={onAdd} />}
  </Screen>;
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 7 }, subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, manage: { color: colors.primary, fontSize: 9, fontFamily: 'Poppins_600SemiBold' },
  taskCard: { backgroundColor: '#fff', borderRadius: 21, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10, elevation: 2, shadowColor: '#20436D', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }, pressed: { opacity: 0.8 }, check: { paddingTop: 2 }, taskBody: { flex: 1 }, taskTitle: { fontFamily: 'Poppins_700Bold', fontSize: 11, lineHeight: 16 }, taskDone: { color: '#94A3B8', textDecorationLine: 'line-through' }, taskSub: { color: colors.muted, fontSize: 9, marginTop: 4 }, taskBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }, priority: { fontFamily: 'Poppins_600SemiBold', fontSize: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' }, taskDuration: { color: '#64748B', fontSize: 9 }, loading: { minHeight: 130, justifyContent: 'center', alignItems: 'center' }, muted: { color: colors.muted, fontSize: 10 },
});
