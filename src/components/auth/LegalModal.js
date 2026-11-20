import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { GraduationCap, ShieldCheck } from "lucide-react-native";
import ModalSheet from "../ModalSheet";
import { AppText, Button } from "../ui";
import { colors, radii } from "../../constants/theme";
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "../../constants/legalContent";

export default function LegalModal({
  visible,
  initialTab = "terms",
  onClose,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || "terms");

  React.useEffect(() => {
    if (visible && initialTab) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const doc = activeTab === "terms" ? TERMS_OF_SERVICE : PRIVACY_POLICY;

  return (
    <ModalSheet
      visible={visible}
      title={activeTab === "terms" ? "Syarat & Ketentuan" : "Kebijakan Privasi"}
      subtitle={`Terakhir diperbarui: ${doc.lastUpdated}`}
      icon={activeTab === "terms" ? GraduationCap : ShieldCheck}
      onClose={onClose}
      full
    >
      <View style={styles.container}>
        <View style={styles.exclusiveBanner}>
          <GraduationCap size={18} color={colors.primary} />
          <View style={styles.bannerCopy}>
            <AppText style={styles.bannerTitle}>Aplikasi Eksklusif Siswa SMA & SMK</AppText>
            <AppText style={styles.bannerSub}>
              Dioptimalkan khusus untuk kurikulum dan ritme belajar siswa kelas 10, 11, 12, dan 13 SMK.
            </AppText>
          </View>
        </View>

        <View style={styles.tabBar}>
          <Pressable
            onPress={() => setActiveTab("terms")}
            style={[styles.tabButton, activeTab === "terms" && styles.tabButtonActive]}
          >
            <AppText
              style={[styles.tabButtonText, activeTab === "terms" && styles.tabButtonTextActive]}
            >
              Syarat & Ketentuan
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("privacy")}
            style={[styles.tabButton, activeTab === "privacy" && styles.tabButtonActive]}
          >
            <AppText
              style={[styles.tabButtonText, activeTab === "privacy" && styles.tabButtonTextActive]}
            >
              Kebijakan Privasi
            </AppText>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
        >
          <View style={styles.badgeRow}>
            <View style={styles.docBadge}>
              <AppText style={styles.docBadgeText}>{doc.badge}</AppText>
            </View>
          </View>

          {doc.sections.map((sec, idx) => (
            <View key={idx} style={styles.sectionWrap}>
              <AppText style={styles.sectionTitle}>{sec.title}</AppText>
              <AppText style={styles.sectionContent}>{sec.content}</AppText>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footerWrap}>
          <Button
            title="Saya Mengerti & Setuju"
            onPress={onClose}
            style={styles.closeBtn}
          />
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  exclusiveBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: radii.card,
    padding: 12,
    marginBottom: 12,
  },
  bannerCopy: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: colors.primary,
  },
  bannerSub: {
    fontSize: 10,
    color: "#3B82F6",
    lineHeight: 14,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: colors.muted,
  },
  tabButtonTextActive: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 14,
  },
  badgeRow: {
    marginBottom: 4,
  },
  docBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  docBadgeText: {
    fontSize: 9,
    fontFamily: "Poppins_500Medium",
    color: "#64748B",
  },
  sectionWrap: {
    gap: 4,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: colors.ink,
  },
  sectionContent: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 18,
  },
  footerWrap: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  closeBtn: {
    width: "100%",
  },
});
