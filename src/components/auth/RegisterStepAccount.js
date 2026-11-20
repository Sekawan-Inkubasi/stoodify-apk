import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Eye, EyeOff, Info } from "lucide-react-native";
import { AppText, Button, Field } from "../ui";
import { colors } from "../../constants/theme";
import LegalModal from "./LegalModal";
import { styles } from "../../screens/AuthScreen.styles";

export default function RegisterStepAccount({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirm,
  setConfirm,
  showPassword,
  setShowPassword,
  onNext,
  error,
  setError,
}) {
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalTab, setLegalTab] = useState("terms");

  const openLegal = (tab) => {
    setLegalTab(tab);
    setLegalModalVisible(true);
  };

  const handleProceed = () => {
    setError("");
    if (!name.trim()) return setError("Nama lengkap siswa harus diisi.");
    if (!email.trim()) return setError("Email harus diisi.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return setError("Format email tidak valid.");
    if (!password) return setError("Kata sandi harus diisi.");
    if (password.length < 8) return setError("Kata sandi minimal 8 karakter.");
    if (password !== confirm) return setError("Konfirmasi kata sandi belum sama.");
    onNext();
  };

  return (
    <View style={styles.form}>
      <Field
        label="Nama Lengkap Siswa"
        value={name}
        onChangeText={setName}
        placeholder="Contoh: Kevin Daniswara"
      />
      <Field
        label="Email Siswa / Sekolah"
        value={email}
        onChangeText={setEmail}
        placeholder="nama@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.emailHint}>
        <Info size={12} color={colors.primary} />
        <AppText style={styles.emailHintText}>
          Gunakan email aktif siswa untuk menerima tautan verifikasi
        </AppText>
      </View>
      <Field
        label="Kata Sandi"
        value={password}
        onChangeText={setPassword}
        placeholder="Minimal 8 karakter"
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
      <Field
        label="Konfirmasi Kata Sandi"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Ulangi kata sandi"
        secureTextEntry={!showPassword}
      />

      <AppText style={styles.terms}>
        Dengan mendaftar, kamu menyatakan sebagai siswa SMA/SMK aktif serta menyetujui{" "}
        <AppText
          style={styles.termsLink}
          onPress={() => openLegal("terms")}
          accessibilityRole="button"
        >
          Syarat & Ketentuan
        </AppText>{" "}
        dan{" "}
        <AppText
          style={styles.termsLink}
          onPress={() => openLegal("privacy")}
          accessibilityRole="button"
        >
          Kebijakan Privasi
        </AppText>{" "}
        Stoodify.
      </AppText>

      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      <Button
        title="Lanjut"
        onPress={handleProceed}
        style={styles.submit}
      />

      <LegalModal
        visible={legalModalVisible}
        initialTab={legalTab}
        onClose={() => setLegalModalVisible(false)}
      />
    </View>
  );
}
