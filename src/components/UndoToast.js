import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { CalendarClock, X } from "lucide-react-native";
import { AppText } from "./ui";
import { colors } from "../constants/theme";

export default function UndoToast({
  visible = false,
  message = "Jadwal diperbarui karena ada tugas baru",
  onView,
  onUndo,
  onDismiss,
  duration = 10000,
  bottom = 86,
}) {
  const [active, setActive] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const progress = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const isExpiredRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setActive(true);
      isExpiredRef.current = false;
      progress.setValue(1);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration,
          useNativeDriver: false,
        }),
      ]).start();

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        isExpiredRef.current = true;
        hide();
      }, duration);
    } else {
      hide();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, duration]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActive(false);
      onDismiss?.();
    });
  };

  const handleUndo = () => {
    if (isExpiredRef.current) {
      onUndo?.(true); // true = is expired
      return;
    }
    hide();
    onUndo?.(false);
  };

  const handleView = () => {
    hide();
    onView?.();
  };

  if (!active) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom,
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.card}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <CalendarClock size={16} color="#38BDF8" />
          </View>
          <View style={styles.textWrap}>
            <AppText style={styles.title} numberOfLines={2}>
              {message}
            </AppText>
          </View>
          <View style={styles.actions}>
            {onView ? (
              <Pressable onPress={handleView} style={styles.viewBtn}>
                <AppText style={styles.viewText}>Lihat</AppText>
              </Pressable>
            ) : null}
            {onUndo ? (
              <Pressable onPress={handleUndo} style={styles.undoBtn}>
                <AppText style={styles.undoText}>Urungkan</AppText>
              </Pressable>
            ) : null}
            <Pressable onPress={hide} style={styles.closeBtn} hitSlop={8}>
              <X size={14} color="#94A3B8" />
            </Pressable>
          </View>
        </View>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 8,
  },
  card: {
    backgroundColor: "#0F172A",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
  },
  viewText: {
    color: "#38BDF8",
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
  },
  undoBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "rgba(251, 191, 36, 0.18)",
  },
  undoText: {
    color: "#FBBF24",
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
  },
  closeBtn: {
    padding: 3,
  },
  progressBar: {
    height: 2,
    backgroundColor: "#38BDF8",
  },
});
