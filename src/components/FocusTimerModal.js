import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Pause, Play, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react-native';
import { AppText, Pill } from './ui';
import { colors } from '../constants/theme';

export default function FocusTimerModal({ visible, onClose, task, initialMinutes, onComplete }) {
  const [total, setTotal] = useState((initialMinutes || task?.estimatedDurationMinutes || 25) * 60);
  const [left, setLeft] = useState((initialMinutes || task?.estimatedDurationMinutes || 25) * 60);
  const [active, setActive] = useState(false);
  const [ambient, setAmbient] = useState(false);
  const completed = useRef(false);
  useEffect(() => {
    const seconds = (initialMinutes || task?.estimatedDurationMinutes || 25) * 60;
    setTotal(seconds); setLeft(seconds); setActive(false); completed.current = false;
  }, [visible, initialMinutes, task?.id]);
  useEffect(() => {
    if (!visible || !active || left <= 0) return undefined;
    const timer = setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [visible, active, left]);
  useEffect(() => {
    if (!visible || left !== 0 || completed.current) return;
    completed.current = true; setActive(false);
    Alert.alert('Sesi Tuntas', 'Selamat! Sesi belajar berhasil tuntas.');
    onComplete(task?.id, Math.round(total / 60));
  }, [left, visible, task?.id, total, onComplete]);
  const setDuration = (minutes) => { setActive(false); completed.current = false; setTotal(minutes * 60); setLeft(minutes * 60); };
  const reset = () => { setActive(false); completed.current = false; setLeft(total); };
  const formatted = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
  return <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
    <View style={styles.overlay}><View style={styles.panel}>
      <View style={styles.tag}><Sparkles size={13} color={colors.primary} /><AppText style={styles.tagText}>Zen Focus Mode</AppText></View>
      {task ? <><AppText style={styles.subject}>{task.subject?.name || 'Belajar Mandiri'}</AppText><AppText numberOfLines={1} style={styles.taskTitle}>{task.title}</AppText></> : <AppText style={styles.taskSub}>Fokus belajar tanpa distraksi gadget</AppText>}
      <View style={styles.timerRing}><View style={styles.innerRing}><AppText style={styles.timerText}>{formatted}</AppText><AppText style={styles.timerState}>{active ? 'SEDANG BERJALAN' : 'SIAP MULAI'}</AppText></View></View>
      <View style={styles.presets}>{[25, 45, 60].map((minutes) => <Pill key={minutes} title={`${minutes}m`} active={total === minutes * 60} onPress={() => setDuration(minutes)} />)}</View>
      <View style={styles.controls}><Pressable onPress={reset} style={styles.control}><RotateCcw size={18} color="#475569" /></Pressable><Pressable onPress={() => setActive(!active)} style={styles.play}>{active ? <Pause size={24} color="#fff" fill="#fff" /> : <Play size={24} color="#fff" fill="#fff" />}</Pressable><Pressable onPress={() => setAmbient(!ambient)} style={styles.control}>{ambient ? <Volume2 size={18} color={colors.primary} /> : <VolumeX size={18} color="#475569" />}</Pressable></View>
      <AppText style={styles.ambient}>{ambient ? 'Suara ambient aktif' : 'Mode senyap aktif'}</AppText><Pressable onPress={onClose} style={styles.close}><AppText style={styles.closeText}>Tutup</AppText></Pressable>
    </View></View>
  </Modal>;
}

const styles = StyleSheet.create({ overlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.78)', justifyContent: 'center', alignItems: 'center', padding: 18 }, panel: { width: '100%', maxWidth: 390, backgroundColor: '#fff', borderRadius: 34, padding: 24, alignItems: 'center' }, tag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }, tagText: { color: colors.primary, fontSize: 9, fontFamily: 'Poppins_600SemiBold' }, subject: { marginTop: 12, color: colors.primary, fontSize: 9, fontFamily: 'Poppins_600SemiBold' }, taskTitle: { maxWidth: 250, marginTop: 3, fontSize: 12, fontFamily: 'Poppins_700Bold' }, taskSub: { color: colors.muted, fontSize: 10, marginTop: 12 }, timerRing: { width: 190, height: 190, marginVertical: 16, borderRadius: 100, borderWidth: 8, borderColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFF' }, innerRing: { width: 166, height: 166, borderRadius: 86, borderWidth: 5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, timerText: { fontFamily: 'Poppins_700Bold', fontSize: 38, letterSpacing: -1 }, timerState: { color: '#94A3B8', fontFamily: 'Poppins_600SemiBold', fontSize: 8, letterSpacing: 1 }, presets: { flexDirection: 'row', gap: 8 }, controls: { flexDirection: 'row', alignItems: 'center', gap: 19, marginTop: 18 }, control: { width: 42, height: 42, borderRadius: 22, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }, play: { width: 60, height: 60, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5 }, ambient: { color: colors.muted, fontSize: 9, marginTop: 10 }, close: { marginTop: 9, padding: 8 }, closeText: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 10 }, });
