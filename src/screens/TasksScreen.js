import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  CheckCircle2,
  Circle,
  Search,
  SearchX,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react-native";
import {
  AppText,
  EmptyState,
  Field,
  Header,
  Loading,
  Pill,
  Screen,
} from "../components/ui";
import { colors } from "../constants/theme";

const filters = [
  { id: "active", label: "Aktif" },
  { id: "urgent", label: "Prioritas" },
  { id: "done", label: "Tuntas" },
  { id: "all", label: "Semua" },
];

function getSubjectPillLabel(item, allSubjects) {
  if (!item) return "";
  const name = item.name || "";
  const sameCodeCount = allSubjects.filter(
    (s) => (s.code || s.name?.slice(0, 3)) === (item.code || name.slice(0, 3)),
  ).length;
  if (sameCodeCount > 1) {
    if (/indonesia/i.test(name)) return "B. Indo";
    if (/inggris/i.test(name)) return "B. Ingg";
    if (/jawa/i.test(name)) return "B. Jawa";
    return name.length > 7 ? `${name.slice(0, 6)}.` : name;
  }
  return item.code || (name.length > 8 ? `${name.slice(0, 7)}.` : name);
}

function TaskCard({ task, onOpen, onToggle, subjectName }) {
  const done = task.status === "selesai";
  const priorityColor =
    Number(task.priorityScore) >= 80
      ? "#E11D48"
      : Number(task.priorityScore) >= 60
        ? "#D97706"
        : colors.primary;
  return (
    <Pressable
      onPress={() => onOpen(task)}
      style={({ pressed }) => [styles.taskCard, pressed && styles.pressed]}
    >
      <Pressable
        onPress={() => onToggle(task)}
        hitSlop={9}
        style={styles.check}
      >
        <CheckCircle2
          size={21}
          color={done ? colors.success : "#CBD5E1"}
          fill={done ? "#D1FAE5" : "transparent"}
        />
      </Pressable>
      <View style={styles.taskBody}>
        <AppText
          style={[styles.taskTitle, done && styles.taskDone]}
          numberOfLines={2}
        >
          {task.title}
        </AppText>
        <AppText style={styles.taskSub}>
          {subjectName || task.subject?.name || "Mata pelajaran"} ·{" "}
          {new Date(task.deadline).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })}
        </AppText>
        <View style={styles.taskBottom}>
          <AppText
            style={[
              styles.priority,
              { color: priorityColor, backgroundColor: `${priorityColor}14` },
            ]}
          >
            {Math.round(task.priorityScore || 0)} ·{" "}
            {task.priority || "Prioritas"}
          </AppText>
          <AppText style={styles.taskDuration}>
            {task.estimatedDurationMinutes || 45} menit
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

export default function TasksScreen({
  tasks = [],
  subjects = [],
  loading,
  initialFilter = "active",
  onOpenTask,
  onToggle,
  onAdd,
  onManageSubjects,
}) {
  const [filter, setFilter] = useState(initialFilter || "active");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const safeTasks = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
  const safeSubjects = Array.isArray(subjects) ? subjects.filter(Boolean) : [];

  useEffect(() => {
    if (initialFilter) setFilter(initialFilter);
  }, [initialFilter]);

  const subjectMap = useMemo(() => {
    const map = new Map();
    safeSubjects.forEach((s) => {
      if (s?.id) map.set(String(s.id), s);
    });
    return map;
  }, [safeSubjects]);

  const visible = useMemo(
    () =>
      safeTasks.filter((task) => {
        if (!task) return false;
        if (filter === "active" && task.status === "selesai") return false;
        if (filter === "urgent" && (task.status === "selesai" || Number(task.priorityScore) < 60))
          return false;
        if (filter === "done" && task.status !== "selesai") return false;
        if (subject !== "all" && String(task.subjectId) !== subject)
          return false;
        const subjName =
          task.subject?.name || subjectMap.get(String(task.subjectId))?.name || "";
        return `${task.title || ""} ${subjName}`
          .toLowerCase()
          .includes((query || "").toLowerCase());
      }),
    [safeTasks, filter, subject, query, subjectMap],
  );

  return (
    <Screen>
      <Header
        title="Daftar Tugas"
        subtitle={`${safeTasks.filter((t) => t.status !== "selesai").length} tugas aktif dijadwalkan AI`}
        action="Tambah"
        onAction={onAdd}
      />
      <Field
        value={query}
        onChangeText={setQuery}
        placeholder="Cari tugas, materi, atau mata pelajaran..."
        right={<Search size={17} color="#94A3B8" />}
      />
      <View style={styles.filters}>
        {filters.map((item) => {
          let count = safeTasks.length;
          if (item.id === "active") {
            count = safeTasks.filter((t) => t.status !== "selesai").length;
          } else if (item.id === "urgent") {
            count = safeTasks.filter((t) => t.status !== "selesai" && Number(t.priorityScore) >= 60).length;
          } else if (item.id === "done") {
            count = safeTasks.filter((t) => t.status === "selesai").length;
          }
          return (
            <Pill
              key={item.id}
              title={`${item.label} ${count}`}
              active={filter === item.id}
              onPress={() => setFilter(item.id)}
            />
          );
        })}
      </View>
      <View style={styles.subjectRow}>
        <SlidersHorizontal size={15} color={colors.primary} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectScroll}
        >
          <Pill
            title="Semua Mapel"
            active={subject === "all"}
            onPress={() => setSubject("all")}
          />
          {safeSubjects.map((item) => (
            <Pill
              key={item.id}
              title={getSubjectPillLabel(item, safeSubjects)}
              active={subject === String(item.id)}
              onPress={() => setSubject(String(item.id))}
            />
          ))}
          <Pressable onPress={onManageSubjects} style={styles.manageBtn}>
            <AppText style={styles.manage}>Atur Mapel</AppText>
          </Pressable>
        </ScrollView>
      </View>
      {loading && !safeTasks.length ? (
        <Loading label="Menghubungkan & memuat daftar tugas..." />
      ) : visible.length ? (
        visible.map((task) => (
          <TaskCard
            key={task.id || String(Math.random())}
            task={task}
            subjectName={task.subject?.name || subjectMap.get(String(task.subjectId))?.name}
            onOpen={onOpenTask}
            onToggle={onToggle}
          />
        ))
      ) : (
        <EmptyState
          icon={filter === "urgent" ? Sparkles : SearchX}
          title={
            safeTasks.length ? "Tidak Ada Tugas yang Cocok" : "Belum Ada Tugas"
          }
          subtitle={
            safeTasks.length
              ? "Coba ubah filter atau kata pencarian."
              : "Tugas yang kamu tambahkan akan muncul di sini dan terhubung ke backend."
          }
          action={!safeTasks.length ? "Tambah Tugas" : undefined}
          onAction={onAdd}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", gap: 7 },
  subjectRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  subjectScroll: { flexDirection: "row", alignItems: "center", gap: 6, paddingRight: 8 },
  manageBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  manage: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: "Poppins_600SemiBold",
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    elevation: 2,
    shadowColor: "#20436D",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  pressed: { opacity: 0.8 },
  check: { paddingTop: 2 },
  taskBody: { flex: 1 },
  taskTitle: { fontFamily: "Poppins_700Bold", fontSize: 11, lineHeight: 16 },
  taskDone: { color: "#94A3B8", textDecorationLine: "line-through" },
  taskSub: { color: colors.muted, fontSize: 9, marginTop: 4 },
  taskBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 9,
  },
  priority: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  taskDuration: { color: "#64748B", fontSize: 9 },
  loading: { minHeight: 130, justifyContent: "center", alignItems: "center" },
  muted: { color: colors.muted, fontSize: 10 },
});
