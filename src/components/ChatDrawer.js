import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Bot, RotateCcw, Send, Sparkles, X } from "lucide-react-native";
import { AppText } from "./ui";
import MarkdownText from "./MarkdownText";
import { colors } from "../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ASSISTANT_PROMPTS,
  generateAssistantReply,
  sendChatMessage,
} from "../services/aiChatService";

export default function ChatDrawer({
  visible,
  onClose,
  user,
  tasks = [],
  sessions = [],
  onReschedule,
  onFocus,
  showMessage,
  isOnline = true,
}) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const drawerWidth = Math.min(Math.round(screenWidth * 0.86), 390);

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
  const list = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const backSub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });
    return () => backSub.remove();
  }, [isOpen]);

  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      setIsOpen(true);
    } else if (isOpen && !isClosing.current) {
      Animated.timing(slideAnim, {
        toValue: drawerWidth,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsOpen(false));
    }
  }, [visible, drawerWidth]);

  useEffect(() => {
    if (isOpen && !isClosing.current) {
      slideAnim.setValue(drawerWidth);
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 24,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, drawerWidth]);

  const handleClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    Keyboard.dismiss();
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

  const send = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    const userMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };
    setMessages((items) => [...items, userMessage]);
    setInput("");
    setThinking(true);
    try {
      const { reply, action } = await sendChatMessage(trimmed, {
        history: messages,
        user,
        tasks,
        sessions,
      });
      setMessages((items) => [
        ...items,
        { id: `a-${Date.now()}`, sender: "ai", text: reply, action },
      ]);
    } catch (err) {
      const fallback = generateAssistantReply(trimmed, {
        user,
        tasks,
        sessions,
      });
      setMessages((items) => [
        ...items,
        {
          id: `a-${Date.now()}`,
          sender: "ai",
          text: fallback.reply,
          action: fallback.action,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const reset = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "ai",
        text: "Percakapan baru dimulai. Ada yang bisa saya bantu?",
      },
    ]);
  };

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, drawerWidth],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Pressable
        accessibilityLabel="Tutup asisten"
        onPress={handleClose}
        hitSlop={8}
        style={StyleSheet.absoluteFill}
      ></Pressable>
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
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardContainer}
          >
            {/* Header Anti-Overlap */}
            <View
              style={[
                styles.header,
                { paddingTop: Math.max(14, insets.top + 8) },
              ]}
            >
              <View style={styles.headerLeft}>
                <View style={styles.botIcon}>
                  <Bot size={18} color="#fff" />
                  <View style={[styles.onlineDot, !isOnline && styles.offlineDot]} />
                </View>
                <View style={styles.headerTitles}>
                  <AppText style={styles.heading} numberOfLines={1}>
                    Stoodify AI
                  </AppText>
                  {!isOnline ? (
                    <AppText style={styles.offlineSubtitle} numberOfLines={1}>
                      Offline · Aturan Pintar
                    </AppText>
                  ) : null}
                </View>
              </View>

              <View style={styles.headerRight}>
                <Pressable
                  accessibilityLabel="Reset percakapan"
                  onPress={reset}
                  hitSlop={8}
                  style={styles.iconBtn}
                >
                  <RotateCcw size={16} color="#fff" />
                </Pressable>
                <Pressable
                  accessibilityLabel="Tutup asisten"
                  onPress={handleClose}
                  hitSlop={8}
                  style={styles.iconBtn}
                >
                  <X size={18} color="#fff" />
                </Pressable>
              </View>
            </View>

            {/* Chat Messages */}
            <ScrollView
              ref={list}
              style={styles.messagesScroll}
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
                    <MarkdownText
                      text={message.text}
                      isUser={message.sender === "user"}
                    />
                    {message.action ? (
                      <Pressable
                        onPress={() =>
                          message.action === "reschedule"
                            ? onReschedule()
                            : onFocus()
                        }
                        style={styles.actionBtn}
                      >
                        <AppText style={styles.actionBtnText}>
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
                <View style={styles.promptsWrap}>
                  {ASSISTANT_PROMPTS.map((prompt) => (
                    <Pressable
                      key={prompt}
                      onPress={() => send(prompt)}
                      style={styles.promptChip}
                    >
                      <Sparkles size={11} color={colors.primary} />
                      <AppText style={styles.promptText}>{prompt}</AppText>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </ScrollView>

            {/* Input Dock */}
            <View
              style={[
                styles.inputDock,
                { paddingBottom: Math.max(10, insets.bottom + 6) },
              ]}
            >
              <View style={styles.inputWrap}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Tanya asisten AI..."
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  onSubmitEditing={() => send()}
                  returnKeyType="send"
                />
                <Pressable
                  accessibilityLabel="Kirim pesan"
                  onPress={() => send()}
                  disabled={!input.trim() || thinking}
                  style={[
                    styles.sendBtn,
                    (!input.trim() || thinking) && styles.sendBtnDisabled,
                  ]}
                >
                  <Send size={15} color="#fff" />
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row", justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
  },
  drawer: {
    height: "100%",
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: "hidden",
    elevation: 24,
  },
  keyboardContainer: { flex: 1 },
  header: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 14,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 8,
  },
  botIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  onlineDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
  },
  offlineDot: {
    backgroundColor: "#F59E0B",
  },
  offlineSubtitle: {
    color: "#FEF3C7",
    fontSize: 9,
    fontFamily: "Poppins_500Medium",
    marginTop: 1,
  },
  headerTitles: { flex: 1 },
  heading: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 14 },
  badgeRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  smartBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 6,
  },
  smartBadgeText: {
    color: colors.primary,
    fontFamily: "Poppins_700Bold",
    fontSize: 8,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  messagesScroll: { flex: 1 },
  messages: { padding: 14, gap: 10 },
  messageRow: { flexDirection: "row", justifyContent: "flex-start" },
  userRow: { justifyContent: "flex-end" },
  message: {
    maxWidth: "84%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  userMessage: { backgroundColor: colors.primary, borderColor: colors.primary },
  messageText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.ink,
    fontFamily: "Poppins_400Regular",
  },
  userText: { color: "#FFFFFF" },
  actionBtn: {
    marginTop: 8,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
  },
  typing: {
    fontSize: 11,
    color: colors.muted,
    fontStyle: "italic",
    paddingHorizontal: 4,
  },
  promptsWrap: { gap: 6, marginTop: 8 },
  promptChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
  },
  promptText: {
    fontSize: 11,
    color: colors.ink,
    fontFamily: "Poppins_500Medium",
  },
  inputDock: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    minHeight: 38,
    fontSize: 12,
    color: colors.ink,
    fontFamily: "Poppins_400Regular",
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
});
