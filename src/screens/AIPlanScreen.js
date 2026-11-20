import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { CalendarClock, Info, Zap } from "lucide-react-native";
import {
  AppText,
  Card,
  EmptyState,
  Header,
  Loading,
  Pill,
  Screen,
  SectionTitle,
} from "../components/ui";
import StudySessionCard from "../components/StudySessionCard";
import { colors } from "../constants/theme";

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AIPlanScreen({
  sessions = [],
  tasks = [],
  subjects = [],
  loading = false,
  onReschedule,
  onFocus,
  onChat,
  onEditSession,
}) {
  const [filter, setFilter] = useState("all");
  const [rescheduling, setRescheduling] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const countdownTimerRef = useRef(null);

  const safeSessions = Array.isArray(sessions) ? sessions.filter(Boolean) : [];
  const safeTasks = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
  const safeSubjects = Array.isArray(subjects) ? subjects.filter(Boolean) : [];

  const subjectMap = useMemo(() => {
    const map = new Map();
    safeSubjects.forEach((s) => {
      if (s?.id) map.set(String(s.id), s);
    });
    return map;
  }, [safeSubjects]);

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const startCountdown = (seconds = 30) => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setRetryCountdown(seconds);
    countdownTimerRef.current = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleManualReschedule = async () => {
    if (rescheduling || retryCountdown > 0 || !onReschedule) return;
    setRescheduling(true);
    try {
      await onReschedule();
    } catch (err) {
      if (err?.status === 429) {
        const retryAfter = Number(err?.retryAfter) || 30;
        startCountdown(retryAfter);
      }
    } finally {
      setRescheduling(false);
    }
  };

  const today = useMemo(() => getLocalDateString(), []);

  const visible = useMemo(
    () =>
      safeSessions.filter((session) => {
        if (!session) return false;
        const sessionDate = String(session.date || "");
        if (filter === "today") return sessionDate === today;
        if (filter === "upcoming") return sessionDate > today;
        return true;
      }),
    [safeSessions, filter, today],
  );

  const hasFallback = useMemo(
    () => safeSessions.some((s) => s.aiSource === "fallback"),
    [safeSessions],
  );

  const workload = safeTasks
    .filter((task) => task.status !== "selesai")
    .reduce((sum, task) => sum + (Number(task.estimatedDurationMinutes) || 0), 0);

  const weeklySessions = useMemo(() => {
    const ws = new Date();
    ws.setDate(ws.getDate() - ((ws.getDay() + 6) % 7));
    ws.setHours(0, 0, 0, 0);
    const we = new Date(ws);
    we.setDate(we.getDate() + 7);
    return safeSessions.filter((s) => {
      const d = new Date(`${s.date}T12:00:00`);
      return !Number.isNaN(d.getTime()) && d >= ws && d < we;
    }).length;
  }, [safeSessions]);

  return (
    <Screen>
      <Header
        title="Jadwal Belajar"
        subtitle="Jadwal otomatis berdasarkan tugas aktif"
      />

      <Card style={styles.assistant} onPress={onChat}>
        <View style={styles.assistantCopy}>
          <AppText style={styles.assistantEyebrow}>STOODIFY AI ASSISTANT</AppText>
          <AppText style={styles.assistantTitle}>Butuh konsultasi belajar atau tanya PR?</AppText>
          <AppText style={styles.assistantSub}>Tanya asisten kapan saja untuk membantu perjalanan belajarmu.</AppText>
        </View>
        <Pressable onPress={onChat} style={styles.ask}>
          <AppText style={styles.askText}>Tanya AI ›</AppText>
        </Pressable>
      </Card>

      <Card style={styles.analysis}>
        <View style={styles.analysisHead}>
          <View style={styles.workIcon}>
            <CalendarClock size={17} color={colors.primary} />
          </View>
          <AppText style={styles.analysisTitle}>Analisis Beban Belajar</AppText>
          <AppText style={styles.balance}>Ringkasan</AppText>
        </View>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <AppText style={styles.metricLabel}>Sesi Pekan Ini</AppText>
            <AppText style={styles.metricValue}>{weeklySessions}</AppText>
          </View>
          <View style={styles.metric}>
            <AppText style={styles.metricLabel}>Tugas Prioritas</AppText>
            <AppText style={[styles.metricValue, styles.urgent]}>
              {safeTasks.filter((t) => t.status !== "selesai" && Number(t.priorityScore) >= 60).length}
            </AppText>
          </View>
          <View style={styles.metric}>
            <AppText style={styles.metricLabel}>Estimasi Beban</AppText>
            <AppText style={styles.metricValue}>{Math.ceil(workload / 60)}j</AppText>
          </View>
        </View>
      </Card>

      <Pressable
        onPress={handleManualReschedule}
        disabled={loading || rescheduling || retryCountdown > 0}
        style={[styles.reschedule, retryCountdown > 0 && styles.rescheduleDisabled]}
      >
        <View style={styles.rescheduleLabel}>
          <Zap size={12} color="#FBBF24" />
          <AppText style={styles.rescheduleEyebrow}>PENJADWALAN ADAPTIF</AppText>
        </View>
        <View style={styles.rescheduleRow}>
          <View style={styles.rescheduleCopy}>
            <AppText style={styles.rescheduleTitle}>Susun Ulang Hari Ini</AppText>
            <AppText style={styles.rescheduleSub}>
              {retryCountdown > 0
                ? `Tunggu ${retryCountdown} detik sebelum menyusun kembali.`
                : "Tata ulang urutan belajar berdasarkan prioritas tugas terbaru."}
            </AppText>
          </View>
          <View style={styles.rescheduleButton}>
            <AppText style={styles.rescheduleButtonText}>
              {rescheduling ? "Memuat…" : retryCountdown > 0 ? `${retryCountdown}s` : "Susun"}
            </AppText>
          </View>
        </View>
      </Pressable>

      {hasFallback ? (
        <View style={styles.fallbackNotice}>
          <Info size={14} color="#0284C7" />
          <AppText style={styles.fallbackText}>
            Jadwal disusun dari rencana cadangan.
          </AppText>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionTitle>SESI BELAJAR TERJADWAL ({visible.length})</SectionTitle>
      </View>

      <View style={styles.filters}>
        <Pill title={`Semua (${safeSessions.length})`} active={filter === "all"} onPress={() => setFilter("all")} />
        <Pill title={`Hari Ini (${safeSessions.filter((s) => String(s?.date || "") === today).length})`} active={filter === "today"} onPress={() => setFilter("today")} />
        <Pill title={`Mendatang (${safeSessions.filter((s) => String(s?.date || "") > today).length})`} active={filter === "upcoming"} onPress={() => setFilter("upcoming")} />
      </View>

      {loading && !safeSessions.length ? (
        <Loading label="Sedang menyusun jadwal belajar…" />
      ) : visible.length ? (
        visible.map((session, index) => {
          const resolvedSubject =
            session.task?.subject?.name ||
            subjectMap.get(String(session.task?.subjectId))?.name ||
            "Mata pelajaran";
          return (
            <StudySessionCard
              key={session.id || String(index)}
              session={session}
              index={index}
              subjectName={resolvedSubject}
              onFocus={onFocus}
              onEditSession={onEditSession}
            />
          );
        })
      ) : filter !== "all" ? (
        <EmptyState
          icon={CalendarClock}
          title={
            filter === "today"
              ? "Tidak Ada Sesi Hari Ini"
              : "Tidak Ada Sesi Mendatang"
          }
          subtitle={
            filter === "today"
              ? "Belum ada sesi belajar terjadwal untuk hari ini. Kamu bisa fokus ke tugas aktif atau melihat semua sesi."
              : "Belum ada sesi belajar terjadwal setelah hari ini."
          }
          action="Lihat Semua Sesi"
          onAction={() => setFilter("all")}
        />
      ) : !safeTasks.length ? (
        <EmptyState
          icon={CalendarClock}
          title="Belum Ada Tugas"
          subtitle="Tambah tugas pertama kamu, jadwal belajar akan dibuat otomatis."
        />
      ) : (
        <EmptyState
          icon={CalendarClock}
          title="Jadwal Belajar Belum Tersedia"
          subtitle="Jadwal belajar otomatis diselaraskan dengan tenggat waktu tugasmu."
          action="Susun Jadwal Sekarang"
          onAction={handleManualReschedule}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  assistant: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, backgroundColor: colors.primary, borderColor: "#3447E8" },
  assistantCopy: { flex: 1 },
  assistantEyebrow: { color: "#DCE8FF", fontFamily: "Poppins_700Bold", fontSize: 8, letterSpacing: 0.5 },
  assistantTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 12, marginTop: 5 },
  assistantSub: { color: "#EAF2FF", fontSize: 9, marginTop: 4 },
  ask: { minHeight: 44, paddingHorizontal: 12, backgroundColor: "#fff", borderRadius: 16, justifyContent: "center" },
  askText: { color: colors.primary, fontSize: 10, fontFamily: "Poppins_700Bold" },
  analysis: { gap: 12 },
  analysisHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  workIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" },
  analysisTitle: { flex: 1, fontFamily: "Poppins_700Bold", fontSize: 11 },
  balance: { color: colors.success, fontFamily: "Poppins_600SemiBold", fontSize: 8, backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  metrics: { flexDirection: "row", gap: 8 },
  metric: { flex: 1, backgroundColor: "#F8FAFC", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  metricLabel: { color: colors.muted, fontSize: 8, fontFamily: "Poppins_500Medium" },
  metricValue: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "#111827", marginTop: 4 },
  urgent: { color: colors.danger },
  reschedule: { backgroundColor: "#111827", borderRadius: 16, padding: 14, gap: 8 },
  rescheduleDisabled: { opacity: 0.7 },
  rescheduleLabel: { flexDirection: "row", alignItems: "center", gap: 6 },
  rescheduleEyebrow: { color: "#FBBF24", fontFamily: "Poppins_700Bold", fontSize: 8, letterSpacing: 0.5 },
  rescheduleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  rescheduleCopy: { flex: 1 },
  rescheduleTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 11 },
  rescheduleSub: { color: "#94A3B8", fontSize: 8, marginTop: 2 },
  rescheduleButton: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  rescheduleButtonText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 10 },
  fallbackNotice: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F0F9FF", borderWidth: 1, borderColor: "#BAE6FD", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  fallbackText: { color: "#0369A1", fontSize: 10, fontFamily: "Poppins_500Medium" },
  section: { marginTop: 4 },
  filters: { flexDirection: "row", gap: 6, marginVertical: 4 },
});
