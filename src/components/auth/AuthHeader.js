import React from "react";
import { Image, Pressable, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { AppText } from "../ui";
import { styles } from "../../screens/AuthScreen.styles";

const logo = require("../../../assets/web/logo_stoodify.png");

export default function AuthHeader({ mode, registerStep, onBack }) {
  const backButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Kembali"
      onPress={onBack}
      style={styles.back}
    >
      <ArrowLeft size={20} color="#64748B" />
    </Pressable>
  );

  if (mode === "register") {
    return (
      <View style={styles.registerHead}>
        {backButton}
        <View style={styles.registerHeading}>
          <AppText style={styles.authTitle}>
            {registerStep === 3 ? "Aktivasi Akun" : "Daftar Akun Baru"}
          </AppText>
          {registerStep < 3 ? (
            <View style={styles.stepIndicatorRow}>
              <View style={styles.stepDots}>
                <View style={[styles.stepDot, registerStep >= 1 && styles.stepDotActive]} />
                <View style={[styles.stepDot, registerStep >= 2 && styles.stepDotActive]} />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.authTop}>
        {backButton}
        <View style={styles.smallLogo}>
          <Image source={logo} style={styles.smallLogoImage} resizeMode="contain" />
        </View>
        <AppText style={styles.version}>1.0.0 Stoodify</AppText>
      </View>
      <View style={styles.authHead}>
        <AppText style={styles.authTitle}>Selamat Datang Kembali</AppText>
        <AppText style={styles.authSub}>
          Masuk untuk mengakses jadwal dan tugas belajarmu
        </AppText>
      </View>
    </>
  );
}
