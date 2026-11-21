import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler, KeyboardAvoidingView, Linking, NativeModules,
  Platform, Pressable, ScrollView, TurboModuleRegistry, View,
} from "react-native";
import { AppText } from "../components/ui";
import * as authService from "../services/authService";
import AuthWelcomeView from "../components/auth/AuthWelcomeView";
import AuthHeader from "../components/auth/AuthHeader";
import LoginForm from "../components/auth/LoginForm";
import RegisterStepAccount from "../components/auth/RegisterStepAccount";
import RegisterStepEducation from "../components/auth/RegisterStepEducation";
import RegisterSuccessVerify from "../components/auth/RegisterSuccessVerify";
import { styles } from "./AuthScreen.styles";

function isNativeGoogleSigninAvailable() {
  try {
    return Boolean(NativeModules?.RNGoogleSignin || TurboModuleRegistry?.get?.("RNGoogleSignin"));
  } catch {
    return false;
  }
}

function extractTokenFromUrl(url) {
  if (!url) return null;
  try {
    const match = url.match(/[?&]token=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export default function AuthScreen({ onLogin, showMessage, initialMode = "welcome" }) {
  const [mode, setMode] = useState(initialMode || "welcome");
  const [registerStep, setRegisterStep] = useState(1);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState(10);
  const [major, setMajor] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      setRegisterStep(1);
    }
  }, [initialMode]);

  // Deep Link listener untuk verifikasi email (stoodify://verify-email?token=...)
  useEffect(() => {
    let isMounted = true;
    const processUrl = async (url) => {
      const token = extractTokenFromUrl(url);
      if (!token || !isMounted) return;
      setBusy(true);
      try {
        await authService.verifyEmail(token);
        showMessage?.(
          "Email berhasil diverifikasi! Sekarang kamu dapat masuk ke akun belajarmu.",
          "Verifikasi Sukses"
        );
        if (isMounted) {
          setMode("login");
          setRegisterStep(1);
        }
      } catch (err) {
        showMessage?.(
          err.message || "Tautan verifikasi tidak valid atau sudah kedaluwarsa.",
          "Verifikasi Gagal"
        );
      } finally {
        if (isMounted) setBusy(false);
      }
    };

    Linking.getInitialURL().then(processUrl);
    const sub = Linking.addEventListener("url", (event) => processUrl(event.url));
    return () => {
      isMounted = false;
      sub.remove();
    };
  }, [showMessage]);

  const handleLoginSubmit = async () => {
    setError("");
    if (!email.trim() || !password) return setError("Email dan kata sandi harus diisi.");
    setBusy(true);
    try {
      const result = await authService.login(email, password);
      onLogin(result?.data?.user || result?.user || {});
    } catch (err) {
      if (err?.errors?.email_verified === "false" || err?.message?.toLowerCase().includes("verifikasi")) {
        setRegisterStep(3);
        setMode("register");
        setError("Email akun ini belum diverifikasi. Cek kotak masuk atau kirim ulang.");
        return;
      }
      setError(err.message || "Tidak dapat terhubung ke server. Periksa koneksi dan coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const handleRegisterSubmit = async () => {
    setError("");
    setBusy(true);
    try {
      await authService.register({
        name,
        email,
        school,
        grade,
        major,
        password,
        confirmPassword: confirm,
      });
      setRegisterStep(3);
    } catch (err) {
      setError(err.message || "Pendaftaran gagal. Periksa kembali isian formulir.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    if (!isNativeGoogleSigninAvailable()) {
      showMessage?.(
        "Fitur Google Sign-In membutuhkan binary APK native. Silakan masuk dengan Email dan Kata Sandi terlebih dahulu.",
        "Masuk Akun Siswa"
      );
      return;
    }

    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId) {
      showMessage?.(
        "Fitur Google Sign-In belum dikonfigurasi. Harap tentukan EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID di file .env terlebih dahulu.",
        "Konfigurasi Google Sign-In"
      );
      return;
    }

    setBusy(true);
    try {
      const { GoogleSignin } = require("@react-native-google-signin/google-signin");
      GoogleSignin.configure({
        webClientId,
        offlineAccess: false,
      });
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

  const handleBack = useCallback(() => {
    setError("");
    if (mode === "register") {
      if (registerStep === 2) {
        setRegisterStep(1);
        return true;
      }
      if (registerStep === 3) {
        setRegisterStep(1);
        setMode("login");
        return true;
      }
    }
    if (mode !== "welcome") {
      setMode("welcome");
      return true;
    }
    return false;
  }, [mode, registerStep]);

  useEffect(() => {
    if (Platform.OS !== "android") return undefined;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => handleBack());
    return () => subscription.remove();
  }, [handleBack]);

  if (mode === "welcome") {
    return (
      <AuthWelcomeView
        onLogin={() => setMode("login")}
        onRegister={() => {
          setRegisterStep(1);
          setMode("register");
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.auth}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <AuthHeader mode={mode} registerStep={registerStep} onBack={handleBack} />

        {mode === "register" ? (
          registerStep === 1 ? (
            <RegisterStepAccount
              name={name} setName={setName}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              confirm={confirm} setConfirm={setConfirm}
              showPassword={showPassword} setShowPassword={setShowPassword}
              onNext={() => setRegisterStep(2)}
              error={error} setError={setError}
            />
          ) : registerStep === 2 ? (
            <RegisterStepEducation
              school={school} setSchool={setSchool}
              grade={grade} setGrade={setGrade}
              major={major} setMajor={setMajor}
              onBack={() => setRegisterStep(1)}
              onSubmit={handleRegisterSubmit}
              busy={busy} error={error} setError={setError}
            />
          ) : (
            <RegisterSuccessVerify
              email={email}
              onGoToLogin={() => {
                setRegisterStep(1);
                setMode("login");
              }}
              showMessage={showMessage}
            />
          )
        ) : (
          <LoginForm
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            showPassword={showPassword} setShowPassword={setShowPassword}
            busy={busy} error={error}
            onSubmit={handleLoginSubmit}
            onForgotPassword={() =>
              showMessage?.(
                "Pemulihan kata sandi belum tersedia dari layar ini. Hubungi dukungan sekolah.",
                "Lupa Kata Sandi"
              )
            }
            onGoogleSignIn={handleGoogleSignIn}
          />
        )}

        {registerStep !== 3 ? (
          <View style={styles.authFooter}>
            <View style={styles.switchRow}>
              <AppText style={styles.switchText}>
                {mode === "register" ? "Sudah memiliki akun?" : "Belum punya akun?"}
              </AppText>
              <Pressable
                onPress={() => {
                  setError("");
                  setRegisterStep(1);
                  setMode(mode === "register" ? "login" : "register");
                }}
              >
                <AppText style={styles.switchLink}>
                  {mode === "register" ? "Masuk" : "Daftar sekarang"}
                </AppText>
              </Pressable>
            </View>
            {mode === "login" ? (
              <AppText style={styles.copyright}>© 2026 Stoodify, Inc</AppText>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
