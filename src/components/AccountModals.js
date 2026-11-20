import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import ModalSheet from './ModalSheet';
import { AppText, Button, Card, Field, Pill } from './ui';
import { colors } from '../constants/theme';

const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function PreferencesModal({ visible, onClose, value, onSave, busy }) {
  const [start, setStart] = useState('16:00');
  const [end, setEnd] = useState('21:00');
  const [duration, setDuration] = useState('60');
  const [activeDays, setActiveDays] = useState(dayOptions.slice(0, 5));
  const [reminderOffset, setReminderOffset] = useState('10');
  const [deadlineReminder, setDeadlineReminder] = useState(true);

  useEffect(() => {
    if (!value) return;
    setStart(value.start_time || '16:00');
    setEnd(value.end_time || '21:00');
    setDuration(String(value.session_duration || 60));
    setReminderOffset(String(value.reminder_offset_minutes || 10));
    setDeadlineReminder(value.deadline_reminders !== false);
    setActiveDays(
      Array.isArray(value.active_days)
        ? value.active_days
        : typeof value.active_days === 'string' && value.active_days
        ? value.active_days.split(',').map((day) => day.trim())
        : dayOptions.slice(0, 5)
    );
  }, [value, visible]);

  const toggleDay = (day) =>
    setActiveDays((items) => (items.includes(day) ? items.filter((item) => item !== day) : [...items, day]));

  return (
    <ModalSheet visible={visible} title="Preferensi Belajar" subtitle="Atur waktu belajar dan pengingat yang nyaman untukmu" onClose={onClose}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field style={{ flex: 1 }} label="MULAI" value={start} onChangeText={setStart} keyboardType="numbers-and-punctuation" />
        <Field style={{ flex: 1 }} label="SELESAI" value={end} onChangeText={setEnd} keyboardType="numbers-and-punctuation" />
      </View>
      <Field label="DURASI SESI (MENIT)" value={duration} onChangeText={setDuration} keyboardType="number-pad" />
      <AppText style={{ color: '#475569', fontFamily: 'Poppins_600SemiBold', fontSize: 10 }}>HARI AKTIF BELAJAR</AppText>
      <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>
        {dayOptions.map((day, index) => (
          <Pill key={day} title={dayLabels[index]} active={activeDays.includes(day)} onPress={() => toggleDay(day)} />
        ))}
      </View>

      <AppText style={{ color: '#475569', fontFamily: 'Poppins_600SemiBold', fontSize: 10, marginTop: 4 }}>
        PENGINGAT SESI BELAJAR (MENIT SEBELUM)
      </AppText>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {['5', '10', '15', '30'].map((mins) => (
          <Pill
            key={mins}
            title={`${mins} Menit`}
            active={reminderOffset === mins}
            onPress={() => setReminderOffset(mins)}
          />
        ))}
      </View>

      <AppText style={{ color: '#475569', fontFamily: 'Poppins_600SemiBold', fontSize: 10, marginTop: 4 }}>
        PENGINGAT DEADLINE BERTINGKAT
      </AppText>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Pill
          title="Aktif (H-2, H-1, H-0)"
          active={deadlineReminder}
          onPress={() => setDeadlineReminder(true)}
        />
        <Pill
          title="Nonaktif"
          active={!deadlineReminder}
          onPress={() => setDeadlineReminder(false)}
        />
      </View>

      <Button
        title={busy ? 'Menyimpan...' : 'Simpan Preferensi'}
        onPress={() =>
          onSave({
            start_time: start,
            end_time: end,
            session_duration: Number(duration) || 60,
            active_days: activeDays.join(','),
            reminder_offset_minutes: Number(reminderOffset) || 10,
            deadline_reminders: deadlineReminder,
          })
        }
        disabled={busy}
        loading={busy}
      />
    </ModalSheet>
  );
}

export function ProModal({ visible, onClose, showMessage }) {
  return <ModalSheet visible={visible} title="Stoodify Siswa Pro" subtitle="Buka seluruh potensi asisten belajarmu" onClose={onClose}>
    {['Rekomendasi jadwal belajar AI', 'Adaptive rescheduling saat jadwal terlewat', 'Prediksi materi dan analisis prasyarat', 'Zen Focus Timer', 'Sinkronisasi kalender sekolah'].map((item) => <AppText key={item} style={{ color: '#334155', fontSize: 10 }}>✓  {item}</AppText>)}
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC' }}><ShieldCheck size={18} color={colors.success} /><AppText style={{ flex: 1, color: colors.muted, fontSize: 9 }}>Pembayaran belum tersedia di aplikasi. Paket tidak akan diaktifkan sampai alur pembayaran terhubung.</AppText></Card>
    <Button title="Info Paket Semester · Rp 99.000" onPress={() => showMessage('Pembayaran Pro belum terhubung. Akunmu belum diubah.', 'Fitur pembayaran')} />
    <Button title="Paket Bulanan · Rp 29.000" variant="outline" onPress={() => showMessage('Pembayaran Pro belum terhubung. Akunmu belum diubah.', 'Fitur pembayaran')} />
  </ModalSheet>;
}
