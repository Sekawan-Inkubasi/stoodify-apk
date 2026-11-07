import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Bot, Camera, Mic, Plus, Send, Sparkles, X } from 'lucide-react-native';
import { AppText } from './ui';
import { colors } from '../constants/theme';

const prompts = ['Susun prioritas', 'Ringkasan beban belajar', 'Tips mode fokus 45 menit', 'Prediksi materi'];

export default function ChatDrawer({ visible, onClose, user, tasks, sessions, onReschedule, onFocus, showMessage }) {
  const [messages, setMessages] = useState([{ id: 'welcome', sender: 'ai', text: `Halo ${user?.name?.split(' ')[0] || 'Siswa'}! Ada yang bisa saya bantu terkait tugas, materi, atau jadwal belajarmu?` }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const timer = useRef(null);
  const list = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const send = (text = input) => {
    if (!text.trim() || thinking) return;
    const userMessage = { id: `u-${Date.now()}`, sender: 'user', text: text.trim() };
    setMessages((items) => [...items, userMessage]); setInput(''); setThinking(true);
    timer.current = setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = `Baik ${user?.name?.split(' ')[0] || 'Siswa'}! Saya sudah meninjau data belajar yang tersedia di aplikasi.`;
      let action = null;
      if (lower.includes('susun') || lower.includes('jadwal') || lower.includes('prioritas')) {
        reply = sessions.length ? `Ada ${sessions.length} sesi belajar yang tersimpan. Kamu dapat meminta backend menyusun ulang prioritas belajar.` : 'Belum ada sesi tugas aktif. Tambahkan tugas terlebih dahulu agar jadwal belajar dapat disusun.';
        action = 'reschedule';
      } else if (lower.includes('ringkasan') || lower.includes('beban') || lower.includes('tugas')) {
        reply = `Saat ini ada ${tasks.filter((task) => task.status !== 'selesai').length} tugas aktif dan ${sessions.length} sesi belajar. Buka tab Tugas untuk melihat detailnya.`;
      } else if (lower.includes('fokus') || lower.includes('timer') || lower.includes('tips')) {
        reply = 'Coba jauhkan distraksi, siapkan air minum, lalu fokus selama 25 atau 45 menit. Kamu bisa mulai timer Zen Focus sekarang.';
        action = 'focus';
      } else if (lower.includes('prediksi')) {
        reply = 'Prediksi materi tersedia melalui layanan AI backend. Buka tombol Prediksi Materi dari Beranda untuk memulai.';
      } else {
        reply = tasks.length ? `Saya siap membantu membahas tugas “${tasks.find((task) => task.status !== 'selesai')?.title || tasks[0].title}” atau merencanakan waktu belajarmu.` : 'Saya siap membantu menjawab pertanyaan belajar atau merencanakan jadwal. Tambahkan tugas agar saran lebih sesuai dengan datamu.';
      }
      setMessages((items) => [...items, { id: `a-${Date.now()}`, sender: 'ai', text: reply, action }]); setThinking(false);
    }, 650);
  };
  const reset = () => setMessages([{ id: `welcome-${Date.now()}`, sender: 'ai', text: 'Percakapan baru dimulai. Ada yang bisa saya bantu?' }]);

  return <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
    <View style={styles.overlay}><Pressable style={StyleSheet.absoluteFill} onPress={onClose} /><View style={styles.drawer}>
      <View style={styles.header}><View style={styles.botIcon}><Bot size={18} color="#fff" /></View><View style={styles.headerCopy}><AppText style={styles.heading}>Stoodify AI Assistant</AppText><AppText style={styles.online}>Smart AI · Online</AppText></View><Pressable onPress={reset} style={styles.headerButton}><Plus size={17} color="#475569" /></Pressable><Pressable onPress={onClose} style={styles.headerButton}><X size={17} color="#475569" /></Pressable></View>
      <ScrollView ref={list} onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })} contentContainerStyle={styles.messages} keyboardShouldPersistTaps="handled">
        {messages.map((message) => <View key={message.id} style={[styles.messageRow, message.sender === 'user' && styles.userRow]}><View style={[styles.message, message.sender === 'user' && styles.userMessage]}><AppText style={[styles.messageText, message.sender === 'user' && styles.userText]}>{message.text}</AppText>{message.action ? <Pressable onPress={() => message.action === 'reschedule' ? onReschedule() : onFocus()} style={styles.action}><AppText style={styles.actionText}>{message.action === 'reschedule' ? 'Jalankan Adaptive Rescheduling' : 'Buka Zen Focus Timer'}</AppText></Pressable> : null}</View></View>)}
        {thinking ? <AppText style={styles.typing}>Stoodify sedang menganalisis…</AppText> : null}
        {!messages.some((item) => item.sender === 'user') ? <View style={styles.prompts}>{prompts.map((prompt) => <Pressable key={prompt} onPress={() => send(prompt)} style={styles.prompt}><Sparkles size={12} color={colors.primary} /><AppText style={styles.promptText}>{prompt}</AppText></Pressable>)}</View> : null}
      </ScrollView>
      <View style={styles.inputDock}><Pressable onPress={() => showMessage('Fitur scan soal menampilkan pratinjau kamera tugas. Analisis foto belum tersedia melalui endpoint chat.', 'Scan Soal & PR')} style={styles.toolButton}><Camera size={16} color="#64748B" /></Pressable><Pressable onPress={() => send('Bagaimana tips menyusun prioritas tugas belajar hari ini?')} style={styles.toolButton}><Mic size={16} color="#64748B" /></Pressable><TextInput value={input} onChangeText={setInput} onSubmitEditing={() => send()} placeholder="Tanya materi, PR, atau jadwal..." placeholderTextColor="#94A3B8" returnKeyType="send" style={styles.input} /><Pressable onPress={() => send()} disabled={!input.trim() || thinking} style={[styles.send, (!input.trim() || thinking) && styles.sendDisabled]}><Send size={15} color="#fff" /></Pressable></View>
      <AppText style={styles.disclaimer}>Jawaban berdasarkan fitur Stoodify yang tersedia saat ini.</AppText>
    </View></View>
  </Modal>;
}

const styles = StyleSheet.create({ overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.30)', justifyContent: 'flex-end' }, drawer: { flex: 1, marginTop: 48, backgroundColor: '#F8FAFC', borderTopLeftRadius: 27, borderTopRightRadius: 27, overflow: 'hidden' }, header: { height: 62, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9, borderBottomWidth: 1, borderColor: '#E2E8F0' }, botIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, headerCopy: { flex: 1 }, heading: { fontFamily: 'Poppins_700Bold', fontSize: 11 }, online: { color: colors.success, fontSize: 8, marginTop: 2 }, headerButton: { width: 33, height: 33, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }, messages: { flexGrow: 1, padding: 14, gap: 9 }, messageRow: { flexDirection: 'row', justifyContent: 'flex-start' }, userRow: { justifyContent: 'flex-end' }, message: { maxWidth: '86%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 17, borderTopLeftRadius: 5, paddingHorizontal: 12, paddingVertical: 10 }, userMessage: { backgroundColor: colors.primary, borderColor: colors.primary, borderTopLeftRadius: 17, borderTopRightRadius: 5 }, messageText: { color: '#334155', fontSize: 10, lineHeight: 16 }, userText: { color: '#fff' }, action: { marginTop: 10, borderRadius: 12, backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 8 }, actionText: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 9 }, typing: { color: colors.muted, fontSize: 9, paddingLeft: 4 }, prompts: { gap: 7, marginTop: 8 }, prompt: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE7F9', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 18 }, promptText: { color: '#475569', fontSize: 9 }, inputDock: { flexDirection: 'row', gap: 6, alignItems: 'center', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#E2E8F0' }, toolButton: { width: 34, height: 34, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }, input: { flex: 1, minHeight: 38, borderRadius: 22, backgroundColor: '#F1F5F9', paddingHorizontal: 12, fontSize: 10, color: colors.ink }, send: { width: 36, height: 36, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, sendDisabled: { opacity: 0.45 }, disclaimer: { color: '#94A3B8', textAlign: 'center', backgroundColor: '#fff', fontSize: 8, paddingBottom: 8 },
});
