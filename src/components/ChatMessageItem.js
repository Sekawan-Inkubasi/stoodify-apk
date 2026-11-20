import React from "react";
import { Pressable, View } from "react-native";
import { AppText } from "./ui";
import MarkdownText from "./MarkdownText";
import { styles } from "./ChatDrawer.styles";

export default function ChatMessageItem({ message, onReschedule, onFocus }) {
  const isUser = message.sender === "user";

  return (
    <View style={[styles.messageRow, isUser && styles.userRow]}>
      <View style={[styles.message, isUser && styles.userMessage]}>
        <MarkdownText text={message.text} isUser={isUser} />
        {message.action ? (
          <Pressable
            onPress={() =>
              message.action === "reschedule" ? onReschedule?.() : onFocus?.()
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
  );
}
