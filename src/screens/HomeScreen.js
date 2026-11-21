import React from "react";
import { Pressable, View } from "react-native";
import {
  Bell,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  Flame,
  Plus,
  Search,
  Sparkles,
  Target,
  Timer,
  Zap,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  AppText,
  Button,
  Card,
  EmptyState,
  Loading,
  Screen,
  SectionTitle,
} from "../components/ui";
import { colors } from "../constants/theme";
import { styles } from "./HomeScreen.styles";

function QuickAction({ icon: Icon, title, subtitle, tint, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.quick}>
      <View style={[styles.quickIcon, { backgroundColor: tint }]}>
        <Icon size={19} color={colors.primary} />
      </View>
      <AppText style={styles.quickTitle}>{title}</AppText>
      <AppText style={styles.quickSub}>{subtitle}</AppText>
    </Pressable>
  );
}

export default function HomeScreen({
  user,
  tasks = [],
  sessions = [],
  stats = {},
  loading = false,
  onTab,
  onAddTask,
  onFocus,
  onPredictions,
  onSchedule,
  onNotifications,
  onSelectTask,
  onToggleTask,
}) {
  const safeTasks = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
  const safeSessions = Array.isArray(sessions) ? sessions.filter(Boolean) : [];
  const safeStats = stats || {};
  const pending = safeTasks.filter(
    (task) => task.status !== "selesai" && task.status !== "terlambat",
  );
  const urgent = pending.filter(
    (task) => Number(task.priorityScore) >= 60,
  ).length;
  const workloadMinutes = pending.reduce(
    (sum, task) => sum + (Number(task.estimatedDurationMinutes) || 45),
    0,
  );
  const workloadHours = Math.ceil(workloadMinutes / 60);

  return (
    <Screen>
      <View style={styles.topActions}>
        <Pressable style={styles.avatar} onPress={() => onTab("profile")}>
          <AppText style={styles.avatarText}>
            {(user?.name || "S").slice(0, 1).toUpperCase()}
          </AppText>
        </Pressable>
        <View style={styles.greeting}>
          <AppText style={styles.greetingTitle}>
            Halo, {user?.name?.split(" ")?.[0] || "Siswa"}
          </AppText>
          <View style={styles.greetingMeta}>
            <AppText numberOfLines={1} style={styles.greetingSub}>
              {user?.school || "Stoodify"}
            </AppText>
            <View style={styles.streak}>
              <Flame size={10} color="#F97316" />
              <AppText style={styles.streakText}>
                {safeStats?.streakDays || 0}d Streak
              </AppText>
            </View>
          </View>
        </View>
        <View style={styles.topSpacer} />
        <Pressable onPress={() => onTab("tasks")} style={styles.topIcon}>
          <Search size={18} color="#334155" />
        </Pressable>
        <Pressable onPress={onNotifications} style={styles.topIcon}>
          <Bell size={18} color="#334155" />
          {Number(safeStats?.unreadCount) > 0 ? (
            <View style={styles.notificationDot} />
          ) : null}
        </Pressable>
      </View>
      <LinearGradient
        colors={["#064CE0", "#126EFF", "#4F46E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <AppText style={styles.metricLabel}>Total Tugas</AppText>
            <View style={styles.metricValueRow}>
              <AppText style={styles.metricValue}>
                {safeStats?.totalTasks ?? safeTasks.length}
              </AppText>
              <AppText style={styles.metricNote}>Tugas Terdaftar</AppText>
            </View>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <AppText style={styles.metricLabel}>Tugas Prioritas</AppText>
            <View style={styles.metricValueRow}>
              <AppText style={[styles.metricValue, styles.urgent]}>
                {urgent}
              </AppText>
              <AppText style={styles.metricNote}>Terkendali</AppText>
            </View>
          </View>
        </View>
        <View style={styles.heroActions}>
          <Button
            title="Mulai Mode Fokus"
            icon={Timer}
            onPress={() => onFocus()}
            variant="outline"
            style={styles.heroButton}
            textStyle={styles.heroButtonText}
          />
          <Button
            title="Tanya AI Asisten"
            icon={Sparkles}
            onPress={() => onTab("ai-plan")}
            variant="secondary"
            textColor="#fff"
            iconColor="#fff"
            style={styles.heroButtonSoft}
            textStyle={styles.heroButtonText}
          />
        </View>
      </LinearGradient>
      <View style={styles.quickGrid}>
        <QuickAction icon={Plus} title="Tambah" subtitle="Tugas" tint="#E2EDFF" onPress={onAddTask} />
        <QuickAction icon={Clock3} title="Fokus" subtitle="Pomodoro" tint="#EEF2FF" onPress={() => onFocus()} />
        <QuickAction icon={Brain} title="Prediksi" subtitle="Materi" tint="#FFF7E8" onPress={onPredictions} />
        <QuickAction icon={CalendarDays} title="Jadwal" subtitle="Sekolah" tint="#EFF6FF" onPress={onSchedule} />
      </View>
      <Card style={styles.insight}>
        <View style={styles.insightIcon}>
          <Sparkles size={18} color={colors.primary} />
        </View>
        <View style={styles.insightCopy}>
          <AppText style={styles.insightTitle}>
            Insight AI Beban Belajar
          </AppText>
          <AppText style={styles.insightSub}>
            {pending.length
              ? `${pending.length} tugas aktif (${workloadHours}j estimasi) menunggu diselesaikan.`
              : "Belum ada tugas terdaftar. Tekan tombol Tambah untuk memulai."}
          </AppText>
        </View>
        <Pressable onPress={() => onTab("tasks", { filter: "active" })}>
          <AppText style={styles.detail}>Detail</AppText>
        </Pressable>
      </Card>
      {loading && !safeSessions.length ? (
        <Card style={styles.agenda}>
          <SectionTitle action="Lihat semua" onAction={() => onTab("ai-plan")}>
            AGENDA BELAJAR
          </SectionTitle>
          <Loading label="Menyusun agenda belajar hari ini..." compact />
        </Card>
      ) : safeSessions.length ? (
        <Card style={styles.agenda}>
          <SectionTitle action="Lihat semua" onAction={() => onTab("ai-plan")}>
            AGENDA BELAJAR
          </SectionTitle>
          {safeSessions.slice(0, 2).map((session) => (
            <View
              key={session.id || String(Math.random())}
              style={styles.agendaRow}
            >
              <View style={styles.agendaDot} />
              <View style={styles.agendaCopy}>
                <AppText style={styles.agendaTitle} numberOfLines={1}>
                  {session.task?.title || "Sesi belajar"}
                </AppText>
                <AppText style={styles.agendaMeta}>
                  {session.startTime || "17:00"} ·{" "}
                  {session.durationMinutes || 45} menit
                </AppText>
              </View>
              <CheckCircle2 size={16} color={colors.primary} />
            </View>
          ))}
        </Card>
      ) : (
        <EmptyState
          icon={Target}
          title="Belum Ada Agenda Belajar"
          subtitle="Tambahkan tugas agar Stoodify dapat membantu mengatur waktu belajar."
          action="Tambah Tugas Pertama"
          onAction={onAddTask}
        />
      )}
      <View style={styles.featureRow}>
        <Pressable
          onPress={onAddTask}
          style={[styles.featureTile, styles.newTaskTile]}
        >
          <View style={styles.featureMeta}>
            <View style={styles.featureIcon}>
              <Compass size={15} color="#fff" />
            </View>
            <AppText style={styles.featureBadge}>
              {pending.length} Aktif
            </AppText>
          </View>
          <AppText style={styles.featureTitle}>Buat Tugas Belajar Baru</AppText>
          <AppText style={styles.featureByline}>oleh Stoodify AI</AppText>
        </Pressable>
        <Pressable
          onPress={() => onFocus()}
          style={[styles.featureTile, styles.focusTile]}
        >
          <View style={styles.featureMeta}>
            <View style={styles.featureIcon}>
              <Target size={15} color="#fff" />
            </View>
            <AppText style={styles.featureBadge}>Fokus</AppText>
          </View>
          <AppText style={styles.featureTitle}>Rasakan Sesi Deep Focus</AppText>
          <AppText style={styles.featureByline}>oleh Stoodify AI</AppText>
        </Pressable>
      </View>
      <Card>
        <SectionTitle action="Lihat Semua" onAction={() => onTab("tasks", { filter: "active" })}>
          PRIORITAS TUGAS TERDEKAT ({pending.length})
        </SectionTitle>
        {loading && !pending.length ? (
          <Loading label="Memuat prioritas tugas aktif..." compact />
        ) : pending.length ? (
          pending.slice(0, 3).map((task) => (
            <Pressable
              key={task.id || String(Math.random())}
              onPress={() => onSelectTask(task)}
              style={styles.taskRow}
            >
              <View style={styles.taskIcon}>
                <Zap size={16} color={colors.primary} />
              </View>
              <View style={styles.taskCopy}>
                <AppText style={styles.taskTitle} numberOfLines={1}>
                  {task.title || "Tugas"}
                </AppText>
                <AppText style={styles.taskMeta}>
                  {task.subject?.name || "Mata pelajaran"} · Skor{" "}
                  {Math.round(Number(task.priorityScore) || 0)}
                </AppText>
              </View>
              <Pressable onPress={() => onToggleTask(task)} hitSlop={10}>
                <CheckCircle2 size={20} color="#94A3B8" />
              </Pressable>
            </Pressable>
          ))
        ) : (
          <AppText style={styles.noTasks}>
            Semua tugasmu terkendali. Waktunya belajar hal baru!
          </AppText>
        )}
      </Card>
    </Screen>
  );
}
