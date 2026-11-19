import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
} from "lucide-react-native";
import { AppText } from "./ui";
import { colors, radii, shadow } from "../constants/theme";

export default function CustomAlertDialog({
  visible = false,
  title = "Pemberitahuan",
  message = "",
  type = "info",
  confirmText = "OK",
  cancelText = "Batal",
  showCancel = false,
  onConfirm,
  onCancel,
  onClose,
}) {
  if (!visible) return null;

  const isDanger = type === "danger";
  const isWarning = type === "warning" || type === "confirm";
  const isSuccess = type === "success";

  let Icon = Info;
  let iconColor = colors.primary;
  let iconBg = "#EFF6FF";

  if (isDanger) {
    Icon = AlertCircle;
    iconColor = colors.danger;
    iconBg = "#FFF1F2";
  } else if (isWarning) {
    Icon = AlertTriangle;
    iconColor = colors.warning;
    iconBg = "#FEF3C7";
  } else if (isSuccess) {
    Icon = CheckCircle2;
    iconColor = colors.success;
    iconBg = "#ECFDF5";
  }

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={showCancel ? handleCancel : handleConfirm}
        />
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
            <Icon size={26} color={iconColor} strokeWidth={2.2} />
          </View>
          <AppText style={styles.title}>{title}</AppText>
          {message ? <AppText style={styles.message}>{message}</AppText> : null}
          <View style={styles.actionRow}>
            {showCancel ? (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleCancel}
              >
                <AppText style={styles.cancelText}>{cancelText}</AppText>
              </Pressable>
            ) : null}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                isDanger ? styles.dangerButton : styles.confirmButton,
                pressed && styles.pressed,
              ]}
              onPress={handleConfirm}
            >
              <AppText style={styles.confirmText}>{confirmText}</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: "center",
    ...shadow,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: colors.ink,
    textAlign: "center",
  },
  message: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    width: "100%",
  },
  button: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#64748B",
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  confirmText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
