import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, ScrollView, StyleSheet, View } from "react-native";
import { GraduationCap } from "lucide-react-native";
import ModalSheet from "./ModalSheet";
import { AppText, Button, Field, Pill } from "./ui";
import { colors } from "../constants/theme";

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

export default function CompleteProfileModal({ visible, onClose, onSubmit, user }) {
  const [school, setSchool] = useState(user?.school || "");
  const [grade, setGrade] = useState(Number(user?.grade) || 10);
  const [major, setMajor] = useState(user?.major || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState(null);
  const scrollRef = useRef(null);

  // Sync scroll position saat keyboard muncul dan field jurusan sedang difokuskan
  useEffect(() => {
    if (!visible) return undefined;
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const sub = Keyboard.addListener(showEvent, () => {
      if (activeField === "major") {
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 120);
      }
    });
    return () => sub.remove();
  }, [visible, activeField]);

  const handleFocusSchool = () => {
    setActiveField("school");
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const handleFocusMajor = () => {
    setActiveField("major");
    // Memberikan offset scroll agar field jurusan terangkat naik ke atas viewport
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const handleSubmit = async () => {
    setError("");
    if (!school.trim()) {
      return setError("Nama sekolah atau madrasah harus diisi.");
    }
    const numericGrade = Number(grade);
    if (!numericGrade || numericGrade < 10 || numericGrade > 13) {
      return setError("Pilih tingkat kelas yang valid (Kelas 10 - 13 SMA/SMK).");
    }
    if (!major.trim()) {
      return setError("Jurusan atau peminatan harus diisi.");
    }

    setBusy(true);
    try {
      await onSubmit({
        school: school.trim(),
        grade: numericGrade,
        major: major.trim(),
      });
    } catch (err) {
      setError(err?.message || "Gagal menyimpan data sekolah. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalSheet
      visible={visible}
      title="Lengkapi Profil Belajarmu"
      subtitle="Bantu AI Stoodify menyusun jadwal dan rekomendasi materi yang tepat"
      onClose={onClose}
      icon={GraduationCap}
      scrollRef={scrollRef}
      keyboardOffset={24}
    >
      <View style={styles.container}>
        <Field
          label="Nama Sekolah / Madrasah"
          value={school}
          onChangeText={setSchool}
          placeholder="Contoh: SMA Negeri 1 Jakarta / SMK Telkom"
          onFocus={handleFocusSchool}
          onBlur={() => setActiveField((cur) => (cur === "school" ? null : cur))}
        />

        <View style={styles.group}>
          <AppText style={styles.label}>Tingkat Kelas SMA / SMK</AppText>
          <View style={styles.pillsRow}>
            {GRADE_OPTIONS.map((item) => (
              <Pill
                key={item.value}
                title={item.label}
                active={Number(grade) === item.value}
                onPress={() => setGrade(item.value)}
              />
            ))}
          </View>
        </View>

        <Field
          label="Jurusan / Konsentrasi Keahlian"
          value={major}
          onChangeText={setMajor}
          placeholder="Contoh: MIPA, IPS, atau TKJ"
          onFocus={handleFocusMajor}
          onBlur={() => setActiveField((cur) => (cur === "major" ? null : cur))}
        />

        <View style={styles.group}>
          <AppText style={styles.subLabel}>Pilihan cepat jurusan:</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
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
                />
              );
            })}
          </ScrollView>
        </View>

        {error ? <AppText style={styles.error}>{error}</AppText> : null}

        <Button
          title={busy ? "Menyimpan Profil..." : "Simpan & Buka Fitur Belajar"}
          onPress={handleSubmit}
          disabled={busy}
          loading={busy}
          style={styles.submitBtn}
        />
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingTop: 4,
    paddingBottom: 24,
  },
  group: {
    gap: 6,
  },
  label: {
    color: colors.muted,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 10,
    textTransform: "uppercase",
  },
  subLabel: {
    color: colors.muted,
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipsScroll: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  error: {
    color: colors.danger,
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
  },
  submitBtn: {
    marginTop: 6,
  },
});
