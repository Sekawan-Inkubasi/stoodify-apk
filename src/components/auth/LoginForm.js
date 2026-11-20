import React from "react";
import { Pressable, View } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { AppText, Button, Field } from "../ui";
import { styles } from "../../screens/AuthScreen.styles";

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  busy,
  error,
  onSubmit,
  onForgotPassword,
  onGoogleSignIn,
}) {
  return (
    <View style={styles.form}>
      <Field
        label="Email Siswa"
        value={email}
        onChangeText={setEmail}
        placeholder="nama@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
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
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      <Button
        title={busy ? "Memuat..." : "Masuk Sekarang"}
        onPress={onSubmit}
        disabled={busy}
        loading={busy}
        style={styles.submit}
      />
      <Pressable onPress={onForgotPassword}>
        <AppText style={styles.forgot}>Lupa Kata Sandi?</AppText>
      </Pressable>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <AppText style={styles.dividerText}>Atau</AppText>
        <View style={styles.dividerLine} />
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={onGoogleSignIn}
        style={styles.schoolButton}
      >
        <AppText style={styles.googleMark}>G</AppText>
        <AppText style={styles.schoolButtonText}>
          {busy ? "Menghubungkan..." : "Lanjutkan dengan Google"}
        </AppText>
      </Pressable>
    </View>
  );
}
