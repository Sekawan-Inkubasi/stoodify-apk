import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  CalendarDays,
  Camera,
  ChevronDown,
  CloudUpload,
  FileText,
  ImagePlus,
  Sparkles,
  Trash2,
} from "lucide-react-native";
import ModalSheet from "./ModalSheet";
import CameraCaptureModal from "./CameraCaptureModal";
import { AppText, Button, Field, Pill } from "./ui";
import { colors } from "../constants/theme";

const difficulties = [
  { label: "Mudah", value: 2 },
  { label: "Sedang", value: 3 },
  { label: "Sulit", value: 5 },
];
const types = [
  { label: "Individu", value: "assignment" },
  { label: "Kelompok", value: "assignment" },
  { label: "Praktikum", value: "project" },
  { label: "Proyek", value: "project" },
];
const formatSize = (size = 0) =>
  size < 1048576
    ? `${(size / 1024).toFixed(1)} KB`
    : `${(size / 1048576).toFixed(1)} MB`;

export default function AddTaskModal({
  visible,
  onClose,
  subjects,
  onSubmit,
  onManageSubjects,
  showMessage,
}) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [subjectPickerVisible, setSubjectPickerVisible] = useState(false);
  const [difficulty, setDifficulty] = useState(3);
  const [type, setType] = useState("assignment");
  const [taskKind, setTaskKind] = useState("Individu");
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const deadlineDate = new Date(`${deadline}T12:00:00`);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    const file = result.canceled ? null : result.assets?.[0];
    if (!file) return;
    if ((file.fileSize || 0) > 15 * 1024 * 1024)
      return showMessage(
        "Ukuran file melebihi batas maksimal 15 MB.",
        "Lampiran terlalu besar",
      );
    setAttachment({
      uri: file.uri,
      name: file.fileName || "foto-tugas.jpg",
      sizeFormatted: formatSize(file.fileSize),
      type: "image",
    });
  };
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });
    const file = result.canceled ? null : result.assets?.[0];
    if (!file) return;
    if ((file.size || 0) > 15 * 1024 * 1024)
      return showMessage(
        "Ukuran file melebihi batas maksimal 15 MB.",
        "Lampiran terlalu besar",
      );
    setAttachment({
      uri: file.uri,
      name: file.name,
      sizeFormatted: formatSize(file.size),
      type: "document",
    });
  };
  const chooseAttachment = () =>
    Alert.alert("Pilih Lampiran", "Pilih foto atau dokumen tugas.", [
      { text: "Foto / Galeri", onPress: pickImage },
      { text: "Dokumen", onPress: pickDocument },
      { text: "Batal", style: "cancel" },
    ]);
  const save = async () => {
    if (!title.trim())
      return showMessage(
        "Masukkan nama tugas terlebih dahulu.",
        "Nama tugas diperlukan",
      );
    if (!subjectId)
      return showMessage(
        "Tambahkan mata pelajaran sebelum membuat tugas.",
        "Mata pelajaran diperlukan",
      );
    setBusy(true);
    const minutes =
      (difficulty === 5 ? 60 : difficulty === 3 ? 45 : 30) +
      (type === "project" ? 15 : 0);
    try {
      await onSubmit({
        title: title.trim(),
        subjectId,
        deadline: `${deadline}T23:59:59+07:00`,
        difficulty,
        estimatedDuration: minutes,
        type,
        notes,
        attachment,
      });
      setTitle("");
      setNotes("");
      setAttachment(null);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <ModalSheet
        visible={visible}
        title="Tambah Tugas Baru"
        subtitle="AI mengatur alokasi jadwal pengerjaan otomatis"
        onClose={onClose}
      >
        <Field
          label="NAMA TUGAS"
          value={title}
          onChangeText={setTitle}
          placeholder="Contoh: Laporan praktikum jaringan"
        />
        <View>
          <View style={styles.labelRow}>
            <AppText style={styles.label}>MATA PELAJARAN</AppText>
            <Pressable onPress={onManageSubjects}>
              <AppText style={styles.link}>＋ Kelola Mapel</AppText>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setSubjectPickerVisible(!subjectPickerVisible)}
            style={styles.subjectSelect}
          >
            <AppText style={styles.subjectValue}>
              {subjects.find(
                (subject) => String(subject.id) === String(subjectId),
              )?.name || "Pilih mata pelajaran"}
            </AppText>
            <ChevronDown size={16} color="#334155" />
          </Pressable>
          {subjectPickerVisible ? (
            <View style={styles.subjectOptions}>
              {subjects.map((subject) => (
                <Pressable
                  key={subject.id}
                  onPress={() => {
                    setSubjectId(String(subject.id));
                    setSubjectPickerVisible(false);
                  }}
                  style={styles.subjectOption}
                >
                  <AppText style={styles.subjectValue}>{subject.name}</AppText>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
        <View>
          <View style={styles.deadlineHead}>
            <AppText style={[styles.label, styles.deadlineLabel]}>
              BATAS WAKTU TANGGAL (Deadline)
            </AppText>
            <View style={styles.quickDeadlines}>
              {[0, 1, 2].map((days) => {
                const date = new Date(Date.now() + days * 86400000)
                  .toISOString()
                  .slice(0, 10);
                const label =
                  days === 0 ? "Hari Ini" : days === 1 ? "Besok" : "Lusa";
                return (
                  <Pressable
                    key={days}
                    onPress={() => setDeadline(date)}
                    style={[
                      styles.quickDeadline,
                      deadline === date && styles.quickDeadlineActive,
                    ]}
                  >
                    <AppText
                      style={[
                        styles.quickDeadlineText,
                        deadline === date && styles.quickDeadlineTextActive,
                      ]}
                    >
                      {label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setDatePickerVisible(true)}
            style={styles.dateButton}
          >
            <AppText style={styles.dateText}>
              {deadlineDate.toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })}
            </AppText>
            <CalendarDays size={15} color={colors.ink} />
          </Pressable>
          <AppText style={styles.deadlineHint}>
            Tenggat:{" "}
            {deadlineDate.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </AppText>
          {datePickerVisible ? (
            <DateTimePicker
              value={
                Number.isNaN(deadlineDate.getTime()) ? new Date() : deadlineDate
              }
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setDatePickerVisible(false);
                if (selectedDate) {
                  const year = selectedDate.getFullYear();
                  const month = String(selectedDate.getMonth() + 1).padStart(
                    2,
                    "0",
                  );
                  const day = String(selectedDate.getDate()).padStart(2, "0");
                  setDeadline(`${year}-${month}-${day}`);
                }
              }}
            />
          ) : null}
        </View>
        <View>
          <AppText style={styles.label}>TINGKAT KESULITAN</AppText>
          <View style={styles.chips}>
            {difficulties.map((item) => (
              <Pill
                key={item.value}
                title={item.label}
                active={difficulty === item.value}
                onPress={() => setDifficulty(item.value)}
              />
            ))}
          </View>
        </View>
        <View>
          <AppText style={styles.label}>JENIS TUGAS</AppText>
          <View style={styles.chips}>
            {types.map((item) => (
              <Pill
                key={item.label}
                title={item.label}
                active={taskKind === item.label}
                onPress={() => {
                  setTaskKind(item.label);
                  setType(item.value);
                }}
              />
            ))}
          </View>
        </View>
        <View>
          <View style={styles.fileLabel}>
            <CloudUpload size={14} color={colors.primary} />
            <AppText style={styles.label}>
              FILE / FOTO TUGAS{" "}
              <AppText style={styles.optional}>(Opsional, Maks 15 MB)</AppText>
            </AppText>
          </View>
          <View style={styles.attachActions}>
            <Button
              title="Ambil Foto Soal"
              icon={Camera}
              variant="outline"
              compact
              onPress={() => setCameraVisible(true)}
              style={styles.flex}
            />
            <Button
              title="Pilih File / Galeri"
              icon={ImagePlus}
              variant="outline"
              compact
              onPress={chooseAttachment}
              style={styles.flex}
            />
          </View>
          <AppText style={styles.fileHint}>
            Bisa memotret lembar soal langsung dari kamera atau memilih file
            dokumen/foto.
          </AppText>
        </View>
        <Field
          label="CATATAN TAMBAHAN (Opsional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Contoh: Kumpulkan di meja guru atau via LMS"
          multiline
        />
        {attachment ? (
          <View style={styles.attachment}>
            {attachment.type === "image" ? (
              <Image source={{ uri: attachment.uri }} style={styles.preview} />
            ) : (
              <FileText size={20} color={colors.primary} />
            )}
            <View style={styles.attachmentCopy}>
              <AppText numberOfLines={1} style={styles.fileName}>
                {attachment.name}
              </AppText>
              <AppText style={styles.fileSize}>
                {attachment.sizeFormatted}
              </AppText>
            </View>
            <Pressable onPress={() => setAttachment(null)}>
              <Trash2 size={16} color={colors.danger} />
            </Pressable>
          </View>
        ) : null}
        <View style={styles.aiNote}>
          <Sparkles size={16} color={colors.primary} />
          <View style={styles.aiCopy}>
            <AppText style={styles.aiTitle}>Dukungan Penjadwalan AI</AppText>
            <AppText style={styles.aiText}>
              Tugas akan diprioritaskan dan dijadwalkan otomatis setelah
              disimpan.
            </AppText>
          </View>
        </View>
        <Button
          title={busy ? "Menyimpan..." : "Simpan & Jadwalkan dengan AI"}
          onPress={save}
          disabled={busy}
        />
      </ModalSheet>
      <CameraCaptureModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={setAttachment}
        showMessage={showMessage}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#334155",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 10,
    marginBottom: 7,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  link: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    paddingBottom: 7,
  },
  subjectSelect: {
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  subjectValue: { color: colors.ink, fontSize: 11 },
  subjectOptions: { gap: 2, paddingTop: 6 },
  subjectOption: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
  },
  deadlineHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  deadlineLabel: { flex: 1, lineHeight: 14 },
  quickDeadlines: { flexDirection: "row", gap: 4 },
  quickDeadline: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
  },
  quickDeadlineActive: { backgroundColor: "#EAF1FF" },
  quickDeadlineText: {
    color: "#64748B",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 8,
  },
  quickDeadlineTextActive: { color: colors.primary },
  deadlineHint: { color: colors.muted, fontSize: 9, marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  dateButton: {
    minHeight: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  dateText: {
    color: colors.ink,
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
  },
  optional: {
    color: colors.muted,
    fontFamily: "Poppins_400Regular",
    fontSize: 9,
    marginBottom: 0,
  },
  fileLabel: { flexDirection: "row", alignItems: "center", gap: 6 },
  fileHint: { color: colors.muted, fontSize: 8, lineHeight: 13, marginTop: 5 },
  attachActions: { flexDirection: "row", gap: 7 },
  flex: { flex: 1 },
  attachment: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
  },
  preview: { width: 38, height: 38, borderRadius: 8 },
  attachmentCopy: { flex: 1 },
  fileName: { fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  fileSize: { color: colors.muted, fontSize: 8 },
  aiNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CFE0FF",
    backgroundColor: "#F1F7FF",
  },
  aiCopy: { flex: 1 },
  aiTitle: { color: "#1E3A8A", fontFamily: "Poppins_700Bold", fontSize: 9 },
  aiText: { color: "#475569", fontSize: 9, lineHeight: 15, marginTop: 3 },
});
