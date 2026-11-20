import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  NativeModules,
  Platform,
  Pressable,
  ScrollView,
  TurboModuleRegistry,
  View,
} from "react-native";
import { ArrowLeft, Eye, EyeOff, Info } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText, Button, Field } from "../components/ui";
import { colors } from "../constants/theme";
import * as authService from "../services/authService";
import { styles } from "./AuthScreen.styles";

const logo = require("../../assets/web/logo_stoodify.png");

function isNativeGoogleSigninAvailable() {
  try {
    if (NativeModules && NativeModules.RNGoogleSignin) return true;
    if (TurboModuleRegistry && typeof TurboModuleRegistry.get === "function") {
      return Boolean(TurboModuleRegistry.get("RNGoogleSignin"));
    }
  } catch {
    return false;
  }
  return false;
}

export default function AuthScreen({ onLogin, showMessage, initialMode = "welcome" }) {
  const [mode, setMode] = useState(initialMode || "welcome");

  React.useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!email.trim() || !password) return setError("Email dan kata sandi harus diisi.");
    if (mode === "register") {
      if (!name.trim()) return setError("Nama harus diisi.");
      if (password !== confirm) return setError("Konfirmasi kata sandi belum sama.");
      if (password.length < 8) return setError("Kata sandi minimal 8 karakter.");
    }
    setBusy(true);
    try {
      if (mode === "register") await authService.register(name, email, password, confirm);
      const result = await authService.login(email, password);
      onLogin(result?.data?.user || result?.user || {});
    } catch (err) {
      setError(err.message || "Tidak dapat terhubung ke server. Periksa koneksi dan coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    if (!isNativeGoogleSigninAvailable()) {
      showMessage?.(
        "Fitur Google Sign-In membutuhkan binary APK hasil kompilasi native baru (npx expo prebuild & assembleRelease). Silakan masuk dengan Email dan Kata Sandi terlebih dahulu.",
        "Masuk Akun Siswa",
      );
      return;
    }

    setBusy(true);
    try {
      const { GoogleSignin } = require("@react-native-google-signin/google-signin");
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response?.data?.idToken || response?.idToken;
      if (!idToken) throw new Error("Gagal memperoleh ID token dari akun Google.");

      const result = await authService.loginWithGoogle(idToken);
      onLogin(result?.data?.user || result?.user || {});
    } catch (err) {
      if (err?.code === "SIGN_IN_CANCELLED" || err?.message?.includes?.("cancelled")) return;
      setError(err?.message || "Gagal masuk dengan akun Google. Periksa koneksi dan coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  if (mode === "welcome")
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
            Asisten AI cerdas untuk membagi waktu belajar dan menyelesaikan
            tugas sekolah tanpa burnout.
          </AppText>
        </View>
        <View style={styles.welcomeActions}>
          <Button title="Masuk ke Akun" onPress={() => setMode("login")} />
          <Button
            title="Daftar Akun Baru"
            variant="outline"
            onPress={() => setMode("register")}
          />
        </View>
      </View>
    );

  const backButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Kembali"
      onPress={() => setMode("welcome")}
      style={styles.back}
    >
      <ArrowLeft size={20} color="#64748B" />
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={styles.auth}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.authScroll}
        keyboardShouldPersistTaps="handled"
      >
        {mode === "register" ? (
          <View style={styles.registerHead}>
            {backButton}
            <View style={styles.registerHeading}>
              <AppText style={styles.authTitle}>Daftar Akun Baru</AppText>
              <AppText style={styles.authSub}>Lengkapi data untuk membuat akun belajarmu</AppText>
            </View>
          </View>
        ) : (
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
              <AppText style={styles.authSub}>Masuk untuk mengakses jadwal dan tugas belajarmu</AppText>
            </View>
          </>
        )}
        <View style={styles.form}>
          {mode === "register" ? (
            <Field
              label="Nama Lengkap Siswa"
              value={name}
              onChangeText={setName}
              placeholder="Nama siswa"
            />
          ) : null}
          <Field
            label={
              mode === "register" ? "Email Siswa / Sekolah" : "Email Siswa"
            }
            value={email}
            onChangeText={setEmail}
            placeholder="nama@email.com"
            keyboardType="email-address"
          />
          {mode === "register" ? (
            <View style={styles.emailHint}>
              <Info size={12} color={colors.primary} />
              <AppText style={styles.emailHintText}>
                Gunakan email sekolah atau email aktif siswa
              </AppText>
            </View>
          ) : null}
          <Field
            label="Kata Sandi"
            value={password}
            onChangeText={setPassword}
            placeholder="Masukkan kata sandi"
            secureTextEntry={!showPassword}
            right={
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel="Tampilkan kata sandi"
                style={styles.eye}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#64748B" />
                ) : (
                  <Eye size={18} color="#64748B" />
                )}
              </Pressable>
            }
          />
          {mode === "register" ? (
            <Field
              label="Konfirmasi Kata Sandi"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Ulangi kata sandi"
              secureTextEntry={!showPassword}
            />
          ) : null}
          {mode === "register" ? (
            <AppText style={styles.terms}>
              Dengan mendaftar, kamu menyetujui Syarat & Ketentuan dan Kebijakan
              Privasi Stoodify.
            </AppText>
          ) : null}
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          <Button
            title={
              busy
                ? "Memuat..."
                : mode === "register"
                  ? "Daftar Sekarang"
                  : "Masuk Sekarang"
            }
            onPress={submit}
            disabled={busy}
            loading={busy}
            style={styles.submit}
          />
          {mode === "login" ? (
            <Pressable
              onPress={() =>
                showMessage(
                  "Pemulihan kata sandi belum tersedia dari layar ini. Hubungi dukungan sekolah.",
                  "Lupa Kata Sandi",
                )
              }
            >
              <AppText style={styles.forgot}>Lupa Kata Sandi?</AppText>
            </Pressable>
          ) : null}
          {mode === "login" ? (
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <AppText style={styles.dividerText}>Atau</AppText>
              <View style={styles.dividerLine} />
            </View>
          ) : null}
          {mode === "login" ? (
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={handleGoogleSignIn}
              style={styles.schoolButton}
            >
              <AppText style={styles.googleMark}>G</AppText>
              <AppText style={styles.schoolButtonText}>
                {busy ? "Menghubungkan..." : "Lanjutkan dengan Google"}
              </AppText>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.authFooter}>
          <View style={styles.switchRow}>
            <AppText style={styles.switchText}>
              {mode === "register" ? "Sudah memiliki akun?" : "Belum punya akun?"}
            </AppText>
            <Pressable onPress={() => { setError(""); setMode(mode === "register" ? "login" : "register"); }}>
              <AppText style={styles.switchLink}>
                {mode === "register" ? "Masuk" : "Daftar sekarang"}
              </AppText>
            </Pressable>
          </View>
          {mode === "login" ? <AppText style={styles.copyright}>© 2026 Stoodify, Inc</AppText> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
