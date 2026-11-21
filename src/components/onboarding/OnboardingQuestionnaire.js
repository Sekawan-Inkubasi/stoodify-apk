import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check, Clock3, GraduationCap, Sparkles, Target, Zap } from 'lucide-react-native';
import { AppText, Button, Card, Field, Pill } from '../ui';
import { colors, radii, shadow } from '../../constants/theme';

const GOAL_OPTIONS = [
  { id: 'tasks', title: 'Tugas Tepat Waktu', desc: 'Selesaikan PR sekolah tanpa panik mepet deadline', Icon: Target },
  { id: 'balance', title: 'Jadwal Seimbang', desc: 'Bagi waktu sekolah, belajar, dan istirahat', Icon: Clock3 },
  { id: 'exams', title: 'Persiapan Ujian', desc: 'Jadwalkan review materi dan latihan soal rutin', Icon: GraduationCap },
  { id: 'focus', title: 'Kurangi Menunda-nunda', desc: 'Bangun kebiasaan disiplin dengan Zen Focus Timer', Icon: Zap },
];

const SCHOOL_PRESETS = [
  { label: 'Full Day', start: '07:00', end: '15:30' },
  { label: 'Reguler', start: '07:00', end: '13:30' },
  { label: 'SMK Praktikum', start: '07:00', end: '16:30' },
];

const DURATION_OPTIONS = ['30', '45', '60', '90'];

export default function OnboardingQuestionnaire({ step, data, onChange, onComplete }) {
  if (step === 3) {
    const selectedGoals = Array.isArray(data?.selectedGoals) ? data.selectedGoals : [];
    return (
      <View style={styles.container}>
        <AppText style={styles.stepTitle}>Untuk apa kamu menggunakan Stoodify?</AppText>
        <AppText style={styles.stepSubtitle}>Pilih tujuan utamamu agar asisten AI dapat menyesuaikan rekomendasi belajar.</AppText>
        <View style={styles.optionsWrap}>
          {GOAL_OPTIONS.map(({ id, title, desc, Icon }) => {
            const selected = selectedGoals.includes(id);
            return (
              <Pressable
                key={id}
                onPress={() => {
                  const next = selected
                    ? selectedGoals.filter((g) => g !== id)
                    : [...selectedGoals, id];
                  onChange({ selectedGoals: next });
                }}
                style={({ pressed }) => [styles.optionCard, selected && styles.optionCardActive, pressed && styles.pressed]}
              >
                <View style={[styles.optionIcon, selected && styles.optionIconActive]}>
                  <Icon size={20} color={selected ? '#fff' : colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={[styles.optionTitle, selected && styles.optionTitleActive]}>{title}</AppText>
                  <AppText style={styles.optionDesc}>{desc}</AppText>
                </View>
                {selected ? (
                  <View style={styles.checkCircle}>
                    <Check size={14} color="#fff" strokeWidth={2.8} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  if (step === 4) {
    return (
      <View style={styles.container}>
        <AppText style={styles.stepTitle}>Jadwal sekolahmu jam berapa?</AppText>
        <AppText style={styles.stepSubtitle}>Stoodify tidak akan menjadwalkan sesi belajar mandiri di saat kamu sedang berada di sekolah.</AppText>
        <View style={styles.presetRow}>
          {SCHOOL_PRESETS.map((preset) => {
            const active = data.schoolStart === preset.start && data.schoolEnd === preset.end;
            return <Pill key={preset.label} title={preset.label} active={active} onPress={() => onChange({ schoolStart: preset.start, schoolEnd: preset.end })} />;
          })}
        </View>
        <Card style={styles.timeCard}>
          <View style={styles.timeInputsRow}>
            <Field style={{ flex: 1 }} label="JAM MASUK SEKOLAH" value={data.schoolStart} onChangeText={(text) => onChange({ schoolStart: text })} placeholder="07:00" keyboardType="numbers-and-punctuation" />
            <Field style={{ flex: 1 }} label="JAM PULANG SEKOLAH" value={data.schoolEnd} onChangeText={(text) => onChange({ schoolEnd: text })} placeholder="15:30" keyboardType="numbers-and-punctuation" />
          </View>
          <AppText style={styles.hintText}>Format 24 jam (contoh: 07:00 sampai 15:30).</AppText>
        </Card>
      </View>
    );
  }

  if (step === 5) {
    return (
      <View style={styles.container}>
        <AppText style={styles.stepTitle}>Kapan kamu siap belajar mandiri?</AppText>
        <AppText style={styles.stepSubtitle}>Tentukan rentang jam saat kamu biasanya ada di rumah dan memiliki waktu luang untuk tugas.</AppText>
        <Card style={styles.timeCard}>
          <View style={styles.timeInputsRow}>
            <Field style={{ flex: 1 }} label="MULAI BELAJAR" value={data.studyStart} onChangeText={(text) => onChange({ studyStart: text })} placeholder="16:30" keyboardType="numbers-and-punctuation" />
            <Field style={{ flex: 1 }} label="SELESAI BELAJAR" value={data.studyEnd} onChangeText={(text) => onChange({ studyEnd: text })} placeholder="21:00" keyboardType="numbers-and-punctuation" />
          </View>
          <AppText style={styles.durationLabel}>DURASI FOKUS PER SESI</AppText>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((min) => (
              <Pill key={min} title={`${min} Menit`} active={String(data.sessionDuration) === min} onPress={() => onChange({ sessionDuration: Number(min) })} />
            ))}
          </View>
        </Card>
      </View>
    );
  }

  if (step === 6) {
    return (
      <View style={styles.container}>
        <View style={styles.successIcon}><Sparkles size={36} color="#fff" /></View>
        <AppText style={styles.stepTitle}>Profil Belajarmu Sudah Siap!</AppText>
        <AppText style={styles.stepSubtitle}>Preferensi belajarmu telah disesuaikan. Masuk atau daftar akun baru untuk mulai menggunakan Stoodify.</AppText>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}><AppText style={styles.summaryLabel}>Jam Sekolah:</AppText><AppText style={styles.summaryValue}>{data.schoolStart} - {data.schoolEnd}</AppText></View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}><AppText style={styles.summaryLabel}>Waktu Belajar:</AppText><AppText style={styles.summaryValue}>{data.studyStart} - {data.studyEnd}</AppText></View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}><AppText style={styles.summaryLabel}>Durasi Sesi:</AppText><AppText style={styles.summaryValue}>{data.sessionDuration} Menit</AppText></View>
        </Card>
        <View style={styles.actionWrap}>
          <Button title="Masuk ke Akun" onPress={() => onComplete('login')} />
          <Button title="Daftar Akun Baru" variant="outline" onPress={() => onComplete('register')} />
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8, alignItems: 'center' },
  stepTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.ink, textAlign: 'center', letterSpacing: -0.3 },
  stepSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18, marginTop: 8, marginBottom: 20, maxWidth: 320 },
  optionsWrap: { width: '100%', gap: 10 },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: radii.card, padding: 14, borderWidth: 1.5, borderColor: '#E2E8F0', ...shadow },
  optionCardActive: { borderColor: colors.primary, backgroundColor: '#F7FAFF' },
  optionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  optionIconActive: { backgroundColor: colors.primary },
  optionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 12, color: colors.ink },
  optionTitleActive: { color: colors.primary },
  optionDesc: { fontSize: 10, color: colors.muted, marginTop: 2, lineHeight: 14 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  timeCard: { width: '100%', maxWidth: 340, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', gap: 14 },
  timeInputsRow: { flexDirection: 'row', gap: 10 },
  hintText: { fontSize: 10, color: colors.muted, textAlign: 'center' },
  durationLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#475569' },
  durationRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  successIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 18, ...shadow },
  summaryCard: { width: '100%', maxWidth: 340, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 14, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: colors.muted },
  summaryValue: { fontFamily: 'Poppins_700Bold', fontSize: 12, color: colors.ink },
  summaryDivider: { height: 1, backgroundColor: '#F1F5F9' },
  actionWrap: { width: '100%', maxWidth: 340, marginTop: 24, gap: 10 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
