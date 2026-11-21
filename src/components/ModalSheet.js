import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { X } from "lucide-react-native";
import { AppText } from "./ui";
import { colors } from "../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ModalSheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
  full = false,
  icon: Icon,
  scrollRef,
  keyboardOffset = 20,
  contentContainerStyle,
}) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const defaultHeight = screenHeight || 800;

  const [isOpen, setIsOpen] = useState(visible);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const internalScrollRef = useRef(null);
  const activeScrollRef = scrollRef || internalScrollRef;
  const isClosing = useRef(false);
  const slideAnim = useRef(new Animated.Value(defaultHeight)).current;

  // Handle Android hardware back button
  useEffect(() => {
    if (!isOpen) return undefined;
    const backSub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });
    return () => backSub.remove();
  }, [isOpen]);

  // Handle keyboard show/hide events for modal height and avoidance
  useEffect(() => {
    if (!isOpen) {
      setKeyboardHeight(0);
      return undefined;
    }
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
  }, [isOpen]);

  // Sync isOpen state with visible prop
  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      setIsOpen(true);
    } else if (isOpen && !isClosing.current) {
      handleClose();
    }
  }, [visible]);

  // Entrance spring animation once modal view is mounted
  useEffect(() => {
    if (isOpen && !isClosing.current) {
      slideAnim.setValue(defaultHeight);
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 24,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, defaultHeight]);

  const handleClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    Keyboard.dismiss();
    setKeyboardHeight(0);
    Animated.timing(slideAnim, {
      toValue: defaultHeight,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      isClosing.current = false;
      setIsOpen(false);
      onClose?.();
    });
  };

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, defaultHeight],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (!isOpen) return null;

  const resolvedPaddingBottom =
    keyboardHeight > 0
      ? keyboardHeight + Math.max(keyboardOffset, (insets.bottom || 0) + keyboardOffset)
      : Math.max(20, insets.bottom + 12);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Decoupled fullscreen backdrop overlay with fade in */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleClose}
            accessibilityLabel="Tutup dialog"
          />
        </Animated.View>

        {/* Bottom sheet content sliding up from bottom */}
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: resolvedPaddingBottom,
              transform: [{ translateY: slideAnim }],
            },
            full && styles.full,
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            {Icon ? (
              <View style={styles.headingIcon}>
                <Icon size={18} color={colors.primary} />
              </View>
            ) : null}
            <View style={styles.titleWrap}>
              <AppText style={styles.title}>{title}</AppText>
              {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup"
              onPress={handleClose}
              style={styles.close}
            >
              <X size={18} color="#64748B" />
            </Pressable>
          </View>
          <ScrollView
            ref={activeScrollRef}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.body, contentContainerStyle]}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.65)",
  },
  sheet: {
    maxHeight: "92%",
    minHeight: "35%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 24,
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
  },
  full: {
    height: "92%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headingIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
  },
  subtitle: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 3,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
  },
});
