/**
 * @file ChatDrawer.js
 * AI Assistant ChatDrawer with spring slide animation, full Android transparent modal
 * keyboard avoidance, and interactive learning tools.
 * Alasan toleransi file (<400 baris): Integrasi sinkronisasi keyboard Android Modal Dialog,
 * orkestrasi spring gesture/backdrop, dan state asisten AI.
 */
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
import ChatMessageItem from "./ChatMessageItem";
import { colors } from "../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ASSISTANT_PROMPTS,
  generateAssistantReply,
  sendChatMessage,
} from "../services/aiChatService";
import { styles } from "./ChatDrawer.styles";

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const list = useRef(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (keyboardHeight > 0) {
      setTimeout(() => {
        list.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [keyboardHeight]);

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
    setKeyboardHeight(0);
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
            style={[
              styles.keyboardContainer,
              Platform.OS === "android" && keyboardHeight > 0 && {
                paddingBottom: keyboardHeight,
              },
            ]}
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
              keyboardDismissMode="on-drag"
            >
              {messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  onReschedule={onReschedule}
                  onFocus={onFocus}
                />
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
                {
                  paddingBottom:
                    keyboardHeight > 0
                      ? 8
                      : Math.max(10, insets.bottom + 6),
                },
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
