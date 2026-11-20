import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Clock3, Info, Pin } from "lucide-react-native";
import ModalSheet from "./ModalSheet";
import { AppText, Button, Field, Pill } from "./ui";
import { colors } from "../constants/theme";

const DURATION_PRESETS = [25, 45, 60, 90];

export default function EditSessionModal({
  visible,
  session,
  onClose,
  onSubmit,
}) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("19:00");
  const [duration, setDuration] = useState(45);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) {
      setDate(session.date || new Date().toISOString().slice(0, 10));
      setStartTime(session.startTime || "19:00");
      setDuration(Number(session.durationMinutes) || 45);
    }
  }, [session, visible]);

  const handleSave = async () => {
    if (!session?.id) return;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) return;

    setBusy(true);
    try {
      await onSubmit({
        id: session.id,
        sessionDate: date,
        startTime,
        duration: Number(duration),
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalSheet
      visible={visible}
      title="Sesuaikan Jam Belajar"
      subtitle={session?.task?.title || "Atur waktu belajar mandiri"}
      onClose={onClose}
      icon={Pin}
    >
      <View style={styles.hintBox}>
        <Info size={14} color={colors.primary} />
        <AppText style={styles.hintText}>
          Sesi yang kamu atur sendiri akan dipatok (pinned) dan tidak akan
          diubah otomatis oleh AI saat ada tugas baru.
        </AppText>
      </View>

      <Field
        label="TANGGAL SESI (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        placeholder="2026-11-20"
      />

      <Field
        label="JAM MULAI (HH:MM)"
        value={startTime}
        onChangeText={setStartTime}
        placeholder="19:00"
        keyboardType="numbers-and-punctuation"
      />

      <View style={styles.durationWrap}>
        <AppText style={styles.label}>DURASI BELAJAR</AppText>
        <View style={styles.chips}>
          {DURATION_PRESETS.map((mins) => (
            <Pill
              key={mins}
              title={`${mins} menit`}
              active={Number(duration) === mins}
              onPress={() => setDuration(mins)}
            />
          ))}
        </View>
      </View>

      <Button
        title={busy ? "Menyimpan Sesi..." : "Simpan & Kunci Jadwal"}
        onPress={handleSave}
        disabled={busy}
        loading={busy}
      />
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 6,
  },
  hintText: {
    flex: 1,
    color: "#334155",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    lineHeight: 14,
  },
  label: {
    color: "#475569",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 10,
    marginBottom: 7,
  },
  durationWrap: {
    marginVertical: 4,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
});
