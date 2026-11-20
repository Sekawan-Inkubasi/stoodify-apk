import React from "react";
import { ScrollView, View } from "react-native";
import { AppText, Button, Field, Pill } from "../ui";
import { styles } from "../../screens/AuthScreen.styles";

const MAJOR_PRESETS = [
  { label: "MIPA", value: "MIPA" },
  { label: "IPS", value: "IPS" },
  { label: "Bahasa", value: "Bahasa" },
  { label: "TKJ", value: "Teknik Komputer Jaringan" },
  { label: "RPL", value: "Rekayasa Perangkat Lunak" },
  { label: "TJAT", value: "Teknik Jaringan Akses Telekomunikasi" },
  { label: "SIJA", value: "Sistem Informasi, Jaringan, Aplikasi" },
  { label: "DKV", value: "Desain Komunikasi Visual" },
  { label: "Akuntansi", value: "Akuntansi" },
];

const GRADE_OPTIONS = [
  { value: 10, label: "Kelas 10" },
  { value: 11, label: "Kelas 11" },
  { value: 12, label: "Kelas 12" },
  { value: 13, label: "Kelas 13 (SMK)" },
];

export default function RegisterStepEducation({
  school,
  setSchool,
  grade,
  setGrade,
  major,
  setMajor,
  onBack,
  onSubmit,
  busy,
  error,
  setError,
}) {
  const handleSubmit = () => {
    setError("");
    if (!school.trim()) return setError("Nama sekolah atau madrasah harus diisi.");
    const numericGrade = Number(grade);
    if (!numericGrade || numericGrade < 10 || numericGrade > 13) {
      return setError("Pilih tingkat kelas yang valid (Kelas 10 - 13 SMA/SMK).");
    }
    if (!major.trim()) {
      return setError("Jurusan atau peminatan harus diisi.");
    }
    onSubmit();
  };

  return (
    <View style={styles.form}>
      <Field
        label="Nama Sekolah / Madrasah"
        value={school}
        onChangeText={setSchool}
        placeholder="Contoh: SMK Telkom Sidoarjo"
      />

      <View style={styles.fieldGroup}>
        <AppText style={styles.groupLabel}>Tingkat Kelas SMA / SMK</AppText>
        <AppText style={styles.groupSub}>
          Pilih kelas yang sedang diduduki saat ini (Kelas 10–13)
        </AppText>
        <View style={styles.pillsWrap}>
          {GRADE_OPTIONS.map((item) => (
            <Pill
              key={item.value}
              title={item.label}
              active={Number(grade) === item.value}
              onPress={() => setGrade(item.value)}
              style={styles.gradePill}
            />
          ))}
        </View>
      </View>

      <Field
        label="Jurusan / Konsentrasi Keahlian"
        value={major}
        onChangeText={setMajor}
        placeholder="Contoh: Teknik Komputer & Jaringan"
      />

      <View style={styles.fieldGroup}>
        <AppText style={styles.groupSub}>Pilihan cepat jurusan/peminatan:</AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.majorChipsScroll}
        >
          {MAJOR_PRESETS.map((preset) => {
            const isMatch =
              major.trim().toLowerCase() === preset.value.toLowerCase() ||
              major.trim().toLowerCase() === preset.label.toLowerCase();
            return (
              <Pill
                key={preset.label}
                title={preset.label}
                active={isMatch}
                onPress={() => setMajor(preset.value)}
                style={styles.chipPill}
              />
            );
          })}
        </ScrollView>
      </View>

      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      <View style={styles.actionButtonsRow}>
        <Button
          title="Kembali"
          variant="outline"
          onPress={onBack}
          disabled={busy}
          style={styles.backActionButton}
        />
        <Button
          title={busy ? "Mendaftarkan..." : "Daftar Sekarang"}
          onPress={handleSubmit}
          disabled={busy}
          loading={busy}
          style={styles.submitActionButton}
        />
      </View>
    </View>
  );
}
