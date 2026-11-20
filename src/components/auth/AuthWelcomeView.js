import React from "react";
import { Image, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText, Button } from "../ui";
import { styles } from "../../screens/AuthScreen.styles";

const logo = require("../../../assets/web/logo_stoodify.png");

export default function AuthWelcomeView({ onLogin, onRegister }) {
  return (
    <View style={styles.welcome}>
      <LinearGradient
        colors={["#1551E8", "#3986FF", "#EAF1FC"]}
        locations={[0, 0.72, 1]}
        style={styles.hero}
      >
        <View style={styles.logoBadge}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <AppText style={styles.brand}>Stoodify</AppText>
      </LinearGradient>
      <View style={styles.welcomeCopy}>
        <AppText style={styles.welcomeSub}>
          Asisten AI cerdas untuk membagi waktu belajar dan menyelesaikan tugas sekolah tanpa burnout.
        </AppText>
      </View>
      <View style={styles.welcomeActions}>
        <Button title="Masuk ke Akun" onPress={onLogin} />
        <Button title="Daftar Akun Baru" variant="outline" onPress={onRegister} />
      </View>
    </View>
  );
}
