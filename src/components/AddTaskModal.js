import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Camera, FileText, ImagePlus, Trash2 } from 'lucide-react-native';
import ModalSheet from './ModalSheet';
import CameraCaptureModal from './CameraCaptureModal';
import { AppText, Button, Field, Pill } from './ui';
import { colors } from '../constants/theme';

const difficulties = [{ label: 'Mudah', value: 2 }, { label: 'Sedang', value: 3 }, { label: 'Sulit', value: 5 }];
const types = [{ label: 'Individu', value: 'assignment' }, { label: 'Kelompok', value: 'assignment' }, { label: 'Praktikum', value: 'project' }, { label: 'Proyek', value: 'project' }];
const formatSize = (size = 0) => size < 1048576 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1048576).toFixed(1)} MB`;

export default function AddTaskModal({ visible, onClose, subjects, onSubmit, onManageSubjects, showMessage }) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [difficulty, setDifficulty] = useState(3);
  const [type, setType] = useState('assignment');
  const [taskKind, setTaskKind] = useState('Individu');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const deadlineDate = new Date(`${deadline}T12:00:00`);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    const file = result.canceled ? null : result.assets?.[0];
    if (!file) return;
    if ((file.fileSize || 0) > 15 * 1024 * 1024) return showMessage('Ukuran file melebihi batas maksimal 15 MB.', 'Lampiran terlalu besar');
    setAttachment({ uri: file.uri, name: file.fileName || 'foto-tugas.jpg', sizeFormatted: formatSize(file.fileSize), type: 'image' });
  };
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], copyToCacheDirectory: true });
    const file = result.canceled ? null : result.assets?.[0];
    if (!file) return;
    if ((file.size || 0) > 15 * 1024 * 1024) return showMessage('Ukuran file melebihi batas maksimal 15 MB.', 'Lampiran terlalu besar');
    setAttachment({ uri: file.uri, name: file.name, sizeFormatted: formatSize(file.size), type: 'document' });
  };
  const save = async () => {
    if (!title.trim()) return showMessage('Masukkan nama tugas terlebih dahulu.', 'Nama tugas diperlukan');
    if (!subjectId) return showMessage('Tambahkan mata pelajaran sebelum membuat tugas.', 'Mata pelajaran diperlukan');
    setBusy(true);
    const minutes = (difficulty === 5 ? 60 : difficulty === 3 ? 45 : 30) + (type === 'project' ? 15 : 0);
    try {
      await onSubmit({ title: title.trim(), subjectId, deadline: `${deadline}T23:59:59+07:00`, difficulty, estimatedDuration: minutes, type, notes, attachment });
      setTitle(''); setNotes(''); setAttachment(null); onClose();
    } finally { setBusy(false); }
  };

  return <>
    <ModalSheet visible={visible} title="Tambah Tugas Baru" subtitle="AI mengatur alokasi jadwal pengerjaan otomatis" onClose={onClose}>
      <Field label="NAMA TUGAS" value={title} onChangeText={setTitle} placeholder="Contoh: Laporan praktikum jaringan" />
      <View><View style={styles.labelRow}><AppText style={styles.label}>MATA PELAJARAN</AppText><Pressable onPress={onManageSubjects}><AppText style={styles.link}>Kelola</AppText></Pressable></View><View style={styles.chips}>{subjects.map((subject) => <Pill key={subject.id} title={subject.name} active={String(subjectId) === String(subject.id)} onPress={() => setSubjectId(String(subject.id))} />)}</View></View>
      <View><AppText style={styles.label}>BATAS WAKTU</AppText><View style={styles.chips}>{[0, 1, 2].map((days) => { const date = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10); return <Pill key={days} title={days === 0 ? 'Hari Ini' : days === 1 ? 'Besok' : 'Lusa'} active={deadline === date} onPress={() => setDeadline(date)} />; })}</View></View>
      <View><AppText style={styles.label}>TANGGAL DEADLINE</AppText><Pressable accessibilityRole="button" onPress={() => setDatePickerVisible(true)} style={styles.dateButton}><AppText style={styles.dateText}>{deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</AppText><AppText style={styles.dateAction}>Pilih tanggal</AppText></Pressable>{datePickerVisible ? <DateTimePicker value={Number.isNaN(deadlineDate.getTime()) ? new Date() : deadlineDate} mode="date" display="default" minimumDate={new Date()} onChange={(event, selectedDate) => { setDatePickerVisible(false); if (selectedDate) { const year = selectedDate.getFullYear(); const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); const day = String(selectedDate.getDate()).padStart(2, '0'); setDeadline(`${year}-${month}-${day}`); } }} /> : null}</View>
      <View><AppText style={styles.label}>TINGKAT KESULITAN</AppText><View style={styles.chips}>{difficulties.map((item) => <Pill key={item.value} title={item.label} active={difficulty === item.value} onPress={() => setDifficulty(item.value)} />)}</View></View>
      <View><AppText style={styles.label}>JENIS TUGAS</AppText><View style={styles.chips}>{types.map((item) => <Pill key={item.label} title={item.label} active={taskKind === item.label} onPress={() => { setTaskKind(item.label); setType(item.value); }} />)}</View></View>
      <Field label="CATATAN TAMBAHAN" value={notes} onChangeText={setNotes} placeholder="Tulis instruksi atau catatan tugas..." multiline />
      <View style={styles.attachActions}><Button title="Foto" icon={Camera} variant="outline" compact onPress={() => setCameraVisible(true)} style={styles.flex} /><Button title="Galeri" icon={ImagePlus} variant="outline" compact onPress={pickImage} style={styles.flex} /><Button title="Dokumen" icon={FileText} variant="outline" compact onPress={pickDocument} style={styles.flex} /></View>
      {attachment ? <View style={styles.attachment}>{attachment.type === 'image' ? <Image source={{ uri: attachment.uri }} style={styles.preview} /> : <FileText size={20} color={colors.primary} />}<View style={styles.attachmentCopy}><AppText numberOfLines={1} style={styles.fileName}>{attachment.name}</AppText><AppText style={styles.fileSize}>{attachment.sizeFormatted}</AppText></View><Pressable onPress={() => setAttachment(null)}><Trash2 size={16} color={colors.danger} /></Pressable></View> : null}
      <Button title={busy ? 'Menyimpan...' : 'Simpan Tugas'} onPress={save} disabled={busy} />
    </ModalSheet>
    <CameraCaptureModal visible={cameraVisible} onClose={() => setCameraVisible(false)} onCapture={setAttachment} showMessage={showMessage} />
  </>;
}

const styles = StyleSheet.create({ label: { color: '#475569', fontFamily: 'Poppins_600SemiBold', fontSize: 10, marginBottom: 7 }, labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, link: { color: colors.primary, fontSize: 10, fontFamily: 'Poppins_600SemiBold', paddingBottom: 7 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, dateButton: { minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: '#F8FAFC', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14 }, dateText: { color: colors.ink, fontFamily: 'Poppins_500Medium', fontSize: 13 }, dateAction: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 11 }, attachActions: { flexDirection: 'row', gap: 6 }, flex: { flex: 1 }, attachment: { minHeight: 55, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 15, backgroundColor: '#F8FAFC' }, preview: { width: 38, height: 38, borderRadius: 8 }, attachmentCopy: { flex: 1 }, fileName: { fontSize: 9, fontFamily: 'Poppins_600SemiBold' }, fileSize: { color: colors.muted, fontSize: 8 }, });
