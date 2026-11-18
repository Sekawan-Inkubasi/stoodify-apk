import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Bot,
  Camera,
  ChevronLeft,
  Lightbulb,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react-native";
import { AppText } from "./ui";
import { colors } from "../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const prompts = [
  "Susun prioritas",
  "Ringkasan beban belajar",
  "Tips mode fokus 45 menit",
  "Prediksi materi",
];

export default function ChatDrawer({
  visible,
  onClose,
  user,
  tasks,
  sessions,
  onReschedule,
  onFocus,
  showMessage,
}) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const drawerWidth = Math.min(Math.round(screenWidth * 0.84), 390);

  const [isOpen, setIsOpen] = useState(visible);
  const isClosing = useRef(false);
  const slideAnim = useRef(new Animated.Value(drawerWidth)).current;

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: `Halo ${user?.name?.split(" ")[0] || "Siswa"}! Ada yang bisa saya bantu terkait tugas, materi, atau jadwal belajarmu?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const timer = useRef(null);
  const list = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      setIsOpen(true);
      slideAnim.setValue(drawerWidth);
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 24,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    } else if (isOpen && !isClosing.current) {
      Animated.timing(slideAnim, {
        toValue: drawerWidth,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsOpen(false));
    }
  }, [visible, drawerWidth]);

  const handleClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    Animated.timing(slideAnim, {
      toValue: drawerWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      isClosing.current = false;
      setIsOpen(false);
      onClose?.();
    });
  };

  const send = (text = input) => {
    if (!text.trim() || thinking) return;
    const userMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: text.trim(),
    };
    setMessages((items) => [...items, userMessage]);
    setInput("");
    setThinking(true);
    timer.current = setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = `Baik ${user?.name?.split(" ")[0] || "Siswa"}! Saya sudah meninjau data belajar yang tersedia di aplikasi.`;
      let action = null;
      if (
        lower.includes("susun") ||
        lower.includes("jadwal") ||
        lower.includes("prioritas")
      ) {
        reply = sessions.length
          ? `Ada ${sessions.length} sesi belajar yang tersimpan. Kamu dapat meminta backend menyusun ulang prioritas belajar.`
          : "Belum ada sesi tugas aktif. Tambahkan tugas terlebih dahulu agar jadwal belajar dapat disusun.";
        action = "reschedule";
      } else if (
        lower.includes("ringkasan") ||
        lower.includes("beban") ||
        lower.includes("tugas")
      ) {
        reply = `Saat ini ada ${tasks.filter((task) => task.status !== "selesai").length} tugas aktif dan ${sessions.length} sesi belajar. Buka tab Tugas untuk melihat detailnya.`;
      } else if (
        lower.includes("fokus") ||
        lower.includes("timer") ||
        lower.includes("tips")
      ) {
        reply =
          "Coba jauhkan distraksi, siapkan air minum, lalu fokus selama 25 atau 45 menit. Kamu bisa mulai timer Zen Focus sekarang.";
        action = "focus";
      } else if (lower.includes("prediksi")) {
        reply =
          "Prediksi materi tersedia melalui layanan AI backend. Buka tombol Prediksi Materi dari Beranda untuk memulai.";
      } else {
        reply = tasks.length
          ? `Saya siap membantu membahas tugas “${tasks.find((task) => task.status !== "selesai")?.title || tasks[0].title}” atau merencanakan waktu belajarmu.`
          : "Saya siap membantu menjawab pertanyaan belajar atau merencanakan jadwal. Tambahkan tugas agar saran lebih sesuai dengan datamu.";
      }
      setMessages((items) => [
        ...items,
        { id: `a-${Date.now()}`, sender: "ai", text: reply, action },
      ]);
      setThinking(false);
    }, 650);
  };

  const reset = () =>
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "ai",
        text: "Percakapan baru dimulai. Ada yang bisa saya bantu?",
      },
    ]);

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, drawerWidth],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleClose}
            accessibilityLabel="Tutup asisten"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            { width: drawerWidth, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View
            style={[
              styles.header,
              { paddingTop: Math.max(12, insets.top + 6) },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup asisten"
              onPress={handleClose}
              style={styles.headerButton}
            >
              <ChevronLeft size={18} color="#fff" strokeWidth={2.5} />
            </Pressable>
            <View style={styles.botAvatarWrap}>
              <View style={styles.botIcon}>
                <Bot size={17} color="#fff" />
              </View>
              <View style={styles.onlineBadgeDot} />
            </View>
            <View style={styles.headerCopy}>
              <View style={styles.titleRow}>
                <AppText numberOfLines={1} style={styles.heading}>
                  Stoodify AI Assistant
                </AppText>
                <View style={styles.smartBadge}>
                  <AppText style={styles.smartBadgeText}>Smart AI</AppText>
                </View>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <AppText numberOfLines={1} style={styles.onlineText}>
                  Online · Siap membantumu 24/7
                </AppText>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mulai percakapan baru"
              onPress={reset}
              style={styles.headerButton}
            >
              <RotateCcw size={15} color="#fff" strokeWidth={2.2} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup asisten"
              onPress={handleClose}
              style={styles.headerButton}
            >
              <X size={16} color="#fff" strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView
            ref={list}
            onContentSizeChange={() =>
              list.current?.scrollToEnd({ animated: true })
            }
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageRow,
                  message.sender === "user" && styles.userRow,
                ]}
              >
                <View
                  style={[
                    styles.message,
                    message.sender === "user" && styles.userMessage,
                  ]}
                >
                  <AppText
                    style={[
                      styles.messageText,
                      message.sender === "user" && styles.userText,
                    ]}
                  >
                    {message.text}
                  </AppText>
                  {message.action ? (
                    <Pressable
                      onPress={() =>
                        message.action === "reschedule"
                          ? onReschedule()
                          : onFocus()
                      }
                      style={styles.action}
                    >
                      <AppText style={styles.actionText}>
                        {message.action === "reschedule"
                          ? "Jalankan Adaptive Rescheduling"
                          : "Buka Zen Focus Timer"}
                      </AppText>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}
            {thinking ? (
              <AppText style={styles.typing}>
                Stoodify sedang menganalisis…
              </AppText>
            ) : null}
            {!messages.some((item) => item.sender === "user") ? (
              <View style={styles.prompts}>
                {prompts.map((prompt) => (
                  <Pressable
                    key={prompt}
                    onPress={() => send(prompt)}
                    style={styles.prompt}
                  >
                    <Sparkles size={12} color={colors.primary} />
                    <AppText style={styles.promptText}>{prompt}</AppText>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <View
            style={[
              styles.inputDock,
              { paddingBottom: Math.max(10, insets.bottom + 6) },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Buka kamera tugas"
              onPress={() =>
                showMessage(
                  "Fitur scan soal menampilkan pratinjau kamera tugas. Analisis foto belum tersedia melalui endpoint chat.",
                  "Scan Soal & PR",
                )
              }
              style={styles.toolButton}
            >
              <Camera size={16} color="#64748B" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kirim pertanyaan contoh tentang prioritas"
              onPress={() =>
                send(
                  "Bagaimana tips menyusun prioritas tugas belajar hari ini?",
                )
              }
              style={styles.toolButton}
            >
              <Lightbulb size={16} color="#64748B" />
            </Pressable>
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send()}
              placeholder="Tanya materi, PR, atau jadwal..."
              placeholderTextColor="#64748B"
              returnKeyType="send"
              style={styles.input}
            />
            <Pressable
              onPress={() => send()}
              disabled={!input.trim() || thinking}
              style={[
                styles.send,
                (!input.trim() || thinking) && styles.sendDisabled,
              ]}
            >
              <Send size={15} color="#fff" />
            </Pressable>
          </View>
          <AppText
            style={[
              styles.disclaimer,
              { paddingBottom: Math.max(8, insets.bottom) },
            ]}
          >
            Jawaban berdasarkan fitur Stoodify yang tersedia saat ini.
          </AppText>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row", justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  drawer: {
    height: "100%",
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
    overflow: "hidden",
    elevation: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: -4, height: 0 },
  },
  header: {
    backgroundColor: colors.primaryDark,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  botAvatarWrap: { position: "relative" },
  botIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineBadgeDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#22C55E",
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
  },
  headerCopy: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heading: { fontFamily: "Poppins_700Bold", fontSize: 11, color: "#FFFFFF" },
  smartBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  smartBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 8,
    color: "#FFFFFF",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#22C55E",
  },
  onlineText: { fontSize: 8.5, color: "#DCE8FF" },
  messages: { flexGrow: 1, padding: 14, gap: 9 },
  messageRow: { flexDirection: "row", justifyContent: "flex-start" },
  userRow: { justifyContent: "flex-end" },
  message: {
    maxWidth: "86%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 17,
    borderTopLeftRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userMessage: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 5,
  },
  messageText: { color: "#334155", fontSize: 10, lineHeight: 16 },
  userText: { color: "#fff" },
  action: {
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionText: {
    color: colors.primary,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 9,
  },
  typing: { color: colors.muted, fontSize: 9, paddingLeft: 4 },
  prompts: { gap: 7, marginTop: 8 },
  prompt: {
    minHeight: 44,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DCE7F9",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 18,
  },
  promptText: { color: "#475569", fontSize: 9 },
  inputDock: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
  },
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 38,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    fontSize: 10,
    color: colors.ink,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.45 },
  disclaimer: {
    color: "#64748B",
    textAlign: "center",
    backgroundColor: "#fff",
    fontSize: 8,
    paddingBottom: 8,
  },
});
