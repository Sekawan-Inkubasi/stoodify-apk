import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ModalSheet from './ModalSheet';
import { AppText, Button, Field, Pill } from './ui';
import { colors } from '../constants/theme';

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export default function AddScheduleModal({ visible, onClose, subjects, defaultDay, onSubmit, onManageSubjects }) {
  const [day, setDay] = useState(defaultDay || 'Senin');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('08:30');
  const [busy, setBusy] = useState(false);
  React.useEffect(() => { if (visible && defaultDay) setDay(defaultDay); }, [visible, defaultDay]);
  const save = async () => {
    if (!subjectId) return subjects.length ? onManageSubjects() : null;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) return;
    setBusy(true);
    try { await onSubmit({ subjectId, dayOfWeek: day, startTime, endTime }); onClose(); }
    finally { setBusy(false); }
  };
  return <ModalSheet visible={visible} title="Tambah Jam Mapel" subtitle="Masukkan jadwal sekolahmu" onClose={onClose}>
    <View><AppText style={styles.label}>HARI</AppText><View style={styles.chips}>{days.map((item) => <Pill key={item} title={item} active={day === item} onPress={() => setDay(item)} />)}</View></View>
    <View><View style={styles.labelRow}><AppText style={styles.label}>MATA PELAJARAN</AppText><AppText onPress={onManageSubjects} style={styles.link}>Kelola Mapel</AppText></View><View style={styles.chips}>{subjects.map((subject) => <Pill key={subject.id} title={subject.name} active={String(subjectId) === String(subject.id)} onPress={() => setSubjectId(String(subject.id))} />)}{!subjects.length ? <AppText style={styles.empty}>Tambahkan mata pelajaran terlebih dahulu.</AppText> : null}</View></View>
    <View style={styles.times}><Field style={styles.timeField} label="JAM MULAI" value={startTime} onChangeText={setStartTime} keyboardType="numbers-and-punctuation" placeholder="07:00" /><Field style={styles.timeField} label="JAM SELESAI" value={endTime} onChangeText={setEndTime} keyboardType="numbers-and-punctuation" placeholder="08:30" /></View>
    <Button title={busy ? 'Menyimpan...' : 'Simpan Jadwal'} onPress={save} disabled={busy} />
  </ModalSheet>;
}

const styles = StyleSheet.create({ label: { color: '#475569', fontFamily: 'Poppins_600SemiBold', fontSize: 10, marginBottom: 7 }, labelRow: { flexDirection: 'row', justifyContent: 'space-between' }, link: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 9 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, times: { flexDirection: 'row', gap: 10 }, timeField: { flex: 1 }, empty: { color: colors.muted, fontSize: 9 }, });
