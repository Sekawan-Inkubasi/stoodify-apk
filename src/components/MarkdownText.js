import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

const INLINE_REGEX = /(\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|__[\s\S]+?__|\*[\s\S]+?\*|_[\s\S]+?_|`[\s\S]+?`)/g;

function renderInlineTokens(text, isUser = false) {
  if (!text) return null;
  const parts = text.split(INLINE_REGEX);

  return parts.map((part, index) => {
    if (!part) return null;
    // Bold + Italic
    if (part.startsWith("***") && part.endsWith("***") && part.length >= 6) {
      return (
        <Text key={index} style={[styles.bold, styles.italic, isUser && styles.userText]}>
          {part.slice(3, -3)}
        </Text>
      );
    }
    // Bold
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return (
        <Text key={index} style={[styles.bold, isUser && styles.userText]}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    // Italic
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return (
        <Text key={index} style={[styles.italic, isUser && styles.userText]}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    // Inline Code
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <Text key={index} style={[styles.inlineCode, isUser ? styles.userInlineCode : styles.aiInlineCode]}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return (
      <Text key={index} style={[styles.normal, isUser && styles.userText]}>
        {part}
      </Text>
    );
  });
}

function MarkdownText({ text = "", isUser = false, style }) {
  if (!text) return null;
  const rawLines = text.split(/\r?\n/);
  const elements = [];
  let inCode = false;
  let codeLines = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        elements.push(
          <View key={`c-${i}`} style={styles.codeBlock}>
            <Text style={styles.codeBlockText}>{codeLines.join("\n")}</Text>
          </View>
        );
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }
    if (trimmed === "") {
      elements.push(<View key={`g-${i}`} style={styles.paragraphGap} />);
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <Text key={`h1-${i}`} style={[styles.h1, isUser && styles.userText]}>
          {renderInlineTokens(line.slice(2), isUser)}
        </Text>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <Text key={`h2-${i}`} style={[styles.h2, isUser && styles.userText]}>
          {renderInlineTokens(line.slice(3), isUser)}
        </Text>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <Text key={`h3-${i}`} style={[styles.h3, isUser && styles.userText]}>
          {renderInlineTokens(line.slice(4), isUser)}
        </Text>
      );
      continue;
    }
    const bulletMatch = line.match(/^[\*\-•]\s+(.*)$/);
    if (bulletMatch) {
      elements.push(
        <View key={`b-${i}`} style={styles.listRow}>
          <Text style={[styles.bulletDot, isUser && styles.userBulletDot]}>•</Text>
          <Text style={[styles.listContent, isUser && styles.userText]}>
            {renderInlineTokens(bulletMatch[1], isUser)}
          </Text>
        </View>
      );
      continue;
    }
    const numMatch = line.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <View key={`n-${i}`} style={styles.listRow}>
          <Text style={[styles.numberPrefix, isUser && styles.userText]}>{numMatch[1]}.</Text>
          <Text style={[styles.listContent, isUser && styles.userText]}>
            {renderInlineTokens(numMatch[2], isUser)}
          </Text>
        </View>
      );
      continue;
    }
    elements.push(
      <Text key={`p-${i}`} style={[styles.paragraph, isUser && styles.userText]}>
        {renderInlineTokens(line, isUser)}
      </Text>
    );
  }

  if (inCode && codeLines.length > 0) {
    elements.push(
      <View key="c-end" style={styles.codeBlock}>
        <Text style={styles.codeBlockText}>{codeLines.join("\n")}</Text>
      </View>
    );
  }

  return <View style={[styles.container, style]}>{elements}</View>;
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  normal: { fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: colors.ink },
  bold: { fontFamily: "Poppins_700Bold", fontSize: 12, lineHeight: 18, color: colors.ink },
  italic: { fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, fontStyle: "italic", color: colors.ink },
  inlineCode: { fontFamily: "Poppins_500Medium", fontSize: 11, lineHeight: 16, paddingHorizontal: 4, borderRadius: 4 },
  aiInlineCode: { backgroundColor: "#F1F5F9", color: colors.primaryDark },
  userInlineCode: { backgroundColor: "rgba(255, 255, 255, 0.25)", color: "#FFFFFF" },
  userText: { color: "#FFFFFF" },
  paragraph: { fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: colors.ink, marginBottom: 2 },
  paragraphGap: { height: 6 },
  h1: { fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: colors.ink, marginTop: 6, marginBottom: 4 },
  h2: { fontFamily: "Poppins_700Bold", fontSize: 13, lineHeight: 19, color: colors.ink, marginTop: 4, marginBottom: 3 },
  h3: { fontFamily: "Poppins_700Bold", fontSize: 12, lineHeight: 18, color: colors.primaryDark, marginTop: 4, marginBottom: 2 },
  listRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 2, marginBottom: 2, paddingLeft: 2 },
  bulletDot: { fontSize: 12, lineHeight: 18, color: colors.primary, fontFamily: "Poppins_700Bold", marginRight: 6, width: 10 },
  userBulletDot: { color: "#FFFFFF" },
  numberPrefix: { fontSize: 12, lineHeight: 18, color: colors.primaryDark, fontFamily: "Poppins_600SemiBold", marginRight: 6, minWidth: 16 },
  listContent: { flex: 1, fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: colors.ink },
  codeBlock: { backgroundColor: "#0F172A", borderRadius: 8, padding: 8, marginVertical: 4 },
  codeBlockText: { fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 16, color: "#38BDF8" },
});

export default memo(MarkdownText);
