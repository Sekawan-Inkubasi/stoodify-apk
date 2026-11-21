import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Mail, Send } from 'lucide-react-native';
import ModalSheet from '../ModalSheet';
import { AppText, Button, Field } from '../ui';
import { colors } from '../../constants/theme';
import * as authService from '../../services/authService';

export default function ForgotPasswordModal({
  visible,
  initialEmail = '',
  onClose,
  showMessage,
}) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      setEmail(initialEmail || '');
      setError('');
      setSentSuccess(false);
      setBusy(false);
    }
  }, [visible, initialEmail]);

  const handleSubmit = async () => {
    setError('');
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return setError('Alamat email harus diisi.');
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return setError('Format alamat email tidak valid.');
    }

    setBusy(true);
    try {
      await authService.requestPasswordReset(cleanEmail);
      setSentSuccess(true);
    } catch (err) {
      setError(err?.message || 'Gagal mengirim permintaan reset kata sandi. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Lupa Kata Sandi"
      subtitle="Kirimkan tautan reset kata sandi ke email terdaftar"
      icon={Mail}
    >
      <View style={styles.container}>
        {sentSuccess ? (
          <View style={styles.successBox}>
            <View style={styles.successIconBadge}>
              <Mail size={32} color={colors.primary} />
            </View>
            <AppText style={styles.successTitle}>Tautan Telah Dikirim!</AppText>
            <AppText style={styles.successMessage}>
              Jika email <AppText style={styles.emailHighlight}>{email}</AppText> terdaftar di Stoodify,
              kami telah mengirimkan tautan untuk mengatur ulang kata sandi kamu.
            </AppText>
            <View style={styles.tipBox}>
              <AppText style={styles.tipText}>
                • Periksa folder Inbox atau Spam pada aplikasi email kamu.{'\n'}
                • Tautan berlaku selama 15 menit.{'\n'}
                • Klik tautan di email untuk langsung membuka form reset di Stoodify.
              </AppText>
            </View>
            <Button
              title="Kembali ke Masuk"
              onPress={onClose}
              style={styles.doneButton}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <AppText style={styles.intro}>
              Masukkan alamat email yang kamu gunakan saat mendaftar. Kami akan mengirimkan tautan untuk membuat kata sandi baru.
            </AppText>

            <Field
              label="Email Siswa"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError('');
              }}
              placeholder="nama@email.sch.id"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {error ? <AppText style={styles.error}>{error}</AppText> : null}

            <View style={styles.actions}>
              <Button
                title={busy ? 'Mengirim...' : 'Kirim Tautan Reset'}
                onPress={handleSubmit}
                disabled={busy}
                loading={busy}
                icon={Send}
                style={styles.submit}
              />
              <Button
                title="Batal"
                variant="outline"
                onPress={onClose}
                disabled={busy}
                style={styles.cancel}
              />
            </View>
          </View>
        )}
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
  form: {
    gap: 8,
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
  error: {
    color: colors.danger,
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    marginTop: -4,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Poppins_400Regular',
  },
  emailHighlight: {
    fontFamily: 'Poppins_600SemiBold',
    color: colors.primary,
  },
  tipBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: 'Poppins_400Regular',
  },
  doneButton: {
    width: '100%',
  },
});
