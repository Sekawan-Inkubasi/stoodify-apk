import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { BookOpen, Check, Pencil, Plus, Trash2 } from 'lucide-react-native';
import ModalSheet from './ModalSheet';
import { AppText, Button, Field, Pill } from './ui';
import { colors } from '../constants/theme';

const palette = ['#0062FF', '#4F46E5', '#059669', '#D97706', '#E11D48', '#0891B2'];

export default function ManageSubjectsModal({ visible, onClose, subjects, onCreate, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(palette[0]);
  const [difficulty, setDifficulty] = useState(3);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!visible) { setEditing(null); setName(''); } }, [visible]);
  const startEdit = (subject) => { setEditing(subject); setName(subject.name); setColor(subject.color || palette[0]); setDifficulty(subject.difficulty || 3); };
  const save = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      if (editing) await onUpdate(editing.id, { name: name.trim(), color, difficulty });
      else await onCreate({ name: name.trim(), color, difficulty });
      setEditing(null); setName('');
    } finally { setBusy(false); }
  };
  const confirmDelete = (subject) => Alert.alert('Hapus mata pelajaran?', `Mata pelajaran ${subject.name} akan dihapus.`, [{ text: 'Batal', style: 'cancel' }, { text: 'Hapus', style: 'destructive', onPress: () => onDelete(subject.id) }]);
  return <ModalSheet visible={visible} title="Kelola Mata Pelajaran" subtitle={`${subjects.length} mata pelajaran tersimpan`} onClose={onClose}>
    <View style={styles.list}>{subjects.map((subject) => <View key={subject.id} style={styles.subjectRow}><View style={[styles.dot, { backgroundColor: subject.color || colors.primary }]} /><View style={styles.subjectCopy}><AppText style={styles.subjectName}>{subject.name}</AppText><AppText style={styles.subjectInfo}>Kesulitan {subject.difficulty || 3}/5</AppText></View><Pressable onPress={() => startEdit(subject)} hitSlop={8} style={styles.iconButton}><Pencil size={15} color={colors.primary} /></Pressable><Pressable onPress={() => confirmDelete(subject)} hitSlop={8} style={styles.iconButton}><Trash2 size={15} color={colors.danger} /></Pressable></View>)}{!subjects.length ? <View style={styles.empty}><BookOpen size={22} color="#94A3B8" /><AppText style={styles.emptyText}>Belum ada mata pelajaran. Tambahkan untuk mengelola tugas dan jadwal.</AppText></View> : null}</View>
    <View style={styles.formTitle}><AppText style={styles.formHeading}>{editing ? 'Ubah Mata Pelajaran' : 'Tambah Mata Pelajaran'}</AppText>{editing ? <Pressable onPress={() => { setEditing(null); setName(''); }}><AppText style={styles.cancel}>Batal edit</AppText></Pressable> : null}</View>
    <Field label="NAMA MATA PELAJARAN" value={name} onChangeText={setName} placeholder="Contoh: Matematika" />
    <View><AppText style={styles.label}>WARNA</AppText><View style={styles.colors}>{palette.map((item) => <Pressable key={item} onPress={() => setColor(item)} style={[styles.color, { backgroundColor: item }]}>{color === item ? <Check size={15} color="#fff" /> : null}</Pressable>)}</View></View>
    <View><AppText style={styles.label}>TINGKAT KESULITAN</AppText><View style={styles.chips}>{[1, 2, 3, 4, 5].map((value) => <Pill key={value} title={`${value}`} active={difficulty === value} onPress={() => setDifficulty(value)} />)}</View></View>
    <Button title={busy ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Mata Pelajaran'} icon={Plus} onPress={save} disabled={busy || !name.trim()} />
  </ModalSheet>;
}

const styles = StyleSheet.create({ list: { gap: 6 }, subjectRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 9, borderBottomWidth: 1, borderColor: '#F1F5F9' }, dot: { width: 10, height: 10, borderRadius: 5 }, subjectCopy: { flex: 1 }, subjectName: { fontFamily: 'Poppins_600SemiBold', fontSize: 10 }, subjectInfo: { color: colors.muted, fontSize: 8 }, iconButton: { padding: 7 }, empty: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10 }, emptyText: { flex: 1, color: colors.muted, fontSize: 9 }, formTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, formHeading: { fontFamily: 'Poppins_700Bold', fontSize: 11 }, cancel: { color: colors.primary, fontSize: 9 }, label: { color: '#475569', fontFamily: 'Poppins_600SemiBold', fontSize: 10, marginBottom: 7 }, colors: { flexDirection: 'row', gap: 12 }, color: { width: 28, height: 28, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, chips: { flexDirection: 'row', gap: 7 }, });
