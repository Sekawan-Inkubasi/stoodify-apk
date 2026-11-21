import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react-native';
import ModalSheet from '../ModalSheet';
import { AppText, Button, Field } from '../ui';
import { colors } from '../../constants/theme';
import * as authService from '../../services/authService';

export default function ResetPasswordModal({
  visible,
  token,
  onClose,
  onSuccess,
  showDialog,
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleReset = () => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
    setBusy(false);
  };

  const handleSubmit = async () => {
    setError('');
    if (!token) {
      return setError('Token reset kata sandi tidak ditemukan atau sudah kadaluwarsa.');
    }
    if (!password) {
      return setError('Kata sandi baru harus diisi.');
    }
    if (password.length < 8) {
      return setError('Kata sandi baru minimal 8 karakter.');
    }
    if (password !== confirmPassword) {
      return setError('Konfirmasi kata sandi tidak cocok.');
    }

    setBusy(true);
    try {
      const result = await authService.confirmPasswordReset(token, password, confirmPassword);
      handleReset();
      onClose?.();

      showDialog?.({
        title: 'Kata Sandi Diperbarui!',
        message: 'Kata sandi kamu berhasil diubah. Silakan masuk dengan kata sandi barumu.',
        type: 'success',
      });

      // Berikan data email jika dikembalikan oleh backend untuk auto-fill form login
      onSuccess?.(result?.data?.email || result?.email || '');
    } catch (err) {
      const errMsg = (err?.message || '').toLowerCase();
      if (errMsg.includes('token_invalid') || errMsg.includes('tidak valid') || errMsg.includes('sudah dipakai')) {
        setError('Tautan reset sudah tidak valid atau sudah digunakan. Minta tautan baru dari Lupa Kata Sandi.');
      } else if (errMsg.includes('kedaluwarsa') || errMsg.includes('expired')) {
        setError('Tautan reset sudah kedaluwarsa (berlaku 15 menit). Minta tautan baru.');
      } else {
        setError(err?.message || 'Gagal mengubah kata sandi. Periksa koneksi dan coba lagi.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={() => {
        handleReset();
        onClose?.();
      }}
      title="Buat Kata Sandi Baru"
      subtitle="Perbarui kata sandi akun belajarmu"
      icon={Lock}
    >
      <View style={styles.container}>
        <AppText style={styles.intro}>
          Buat kata sandi baru yang aman dan mudah kamu ingat. Minimal terdiri dari 8 karakter.
        </AppText>

        <Field
          label="Kata Sandi Baru"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError('');
          }}
          placeholder="Minimal 8 karakter"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          right={
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel="Tampilkan kata sandi baru"
              style={styles.eye}
            >
              {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
            </Pressable>
          }
        />

        <Field
          label="Konfirmasi Kata Sandi Baru"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (error) setError('');
          }}
          placeholder="Ulangi kata sandi baru"
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoCorrect={false}
          right={
            <Pressable
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              accessibilityLabel="Tampilkan konfirmasi kata sandi"
              style={styles.eye}
            >
              {showConfirmPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
            </Pressable>
          }
        />

        {error ? <AppText style={styles.error}>{error}</AppText> : null}

        <View style={styles.actions}>
          <Button
            title={busy ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
            onPress={handleSubmit}
            disabled={busy}
            loading={busy}
            icon={CheckCircle2}
            style={styles.submit}
          />
          <Button
            title="Batal"
            variant="outline"
            onPress={() => {
              handleReset();
              onClose?.();
            }}
            disabled={busy}
            style={styles.cancel}
          />
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  intro: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Poppins_400Regular',
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
  submit: {
    width: '100%',
  },
  cancel: {
    width: '100%',
  },
  eye: {
    padding: 8,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    marginTop: -4,
  },
});
