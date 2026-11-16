import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, Eye, EyeOff, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText, Button, Field } from '../components/ui';
import { colors } from '../constants/theme';
import * as authService from '../services/authService';

const logo = require('../../assets/web/logo_stoodify.png');

export default function AuthScreen({ onLogin, showMessage }) {
  const [mode, setMode] = useState('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email.trim() || !password) return setError('Email dan kata sandi harus diisi.');
    if (mode === 'register' && (!name.trim() || password !== confirm)) return setError(password !== confirm ? 'Konfirmasi kata sandi belum sama.' : 'Nama harus diisi.');
    if (mode === 'register' && password.length < 8) return setError('Kata sandi minimal 8 karakter.');
    setBusy(true);
    try {
      if (mode === 'register') {
        await authService.register(name, email, password, confirm);
      }
      const result = await authService.login(email, password);
      const user = result?.data?.user || result?.user || {};
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Tidak dapat terhubung ke server. Periksa koneksi dan coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'welcome') return <View style={styles.welcome}>
    <LinearGradient colors={['#1551E8', '#3986FF', '#EAF1FC']} locations={[0, 0.72, 1]} style={styles.hero}>
      <View style={styles.logoBadge}><Image source={logo} style={styles.logo} resizeMode="contain" /></View>
      <AppText style={styles.brand}>Stoodify</AppText>
    </LinearGradient>
    <View style={styles.welcomeCopy}><AppText style={styles.welcomeSub}>Asisten AI cerdas untuk membagi waktu belajar dan menyelesaikan tugas sekolah tanpa burnout.</AppText></View>
    <View style={styles.welcomeActions}><Button title="Masuk ke Akun" onPress={() => setMode('login')} /><Button title="Daftar Akun Baru" variant="outline" onPress={() => setMode('register')} /></View>
  </View>;

  const backButton = <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={() => setMode('welcome')} style={styles.back}><ArrowLeft size={20} color="#64748B" /></Pressable>;

  return <KeyboardAvoidingView style={styles.auth} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
    {mode === 'register' ? <View style={styles.registerHead}>{backButton}<View style={styles.registerHeading}><AppText style={styles.authTitle}>Daftar Akun Baru</AppText><AppText style={styles.authSub}>Lengkapi data untuk membuat akun belajarmu</AppText></View></View> : <><View style={styles.authTop}>{backButton}<View style={styles.smallLogo}><Image source={logo} style={styles.smallLogoImage} resizeMode="contain" /></View><AppText style={styles.version}>1.0.0 Stoodify</AppText></View><View style={styles.authHead}><AppText style={styles.authTitle}>Selamat Datang Kembali</AppText><AppText style={styles.authSub}>Masuk untuk mengakses jadwal dan tugas belajarmu</AppText></View></>}
    <View style={styles.form}>
      {mode === 'register' ? <Field label="Nama Lengkap Siswa" value={name} onChangeText={setName} placeholder="Nama siswa" /> : null}
      <Field label={mode === 'register' ? 'Email Siswa / Sekolah' : 'Email Siswa'} value={email} onChangeText={setEmail} placeholder="nama@email.com" keyboardType="email-address" />
      {mode === 'register' ? <View style={styles.emailHint}><Info size={12} color={colors.primary} /><AppText style={styles.emailHintText}>Gunakan email sekolah atau email aktif siswa</AppText></View> : null}
      <Field label="Kata Sandi" value={password} onChangeText={setPassword} placeholder="Masukkan kata sandi" secureTextEntry={!showPassword} right={<Pressable onPress={() => setShowPassword(!showPassword)} accessibilityLabel="Tampilkan kata sandi" style={styles.eye}>{showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}</Pressable>} />
      {mode === 'register' ? <Field label="Konfirmasi Kata Sandi" value={confirm} onChangeText={setConfirm} placeholder="Ulangi kata sandi" secureTextEntry={!showPassword} /> : null}
      {mode === 'register' ? <AppText style={styles.terms}>Dengan mendaftar, kamu menyetujui Syarat & Ketentuan dan Kebijakan Privasi Stoodify.</AppText> : null}
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      <Button title={busy ? 'Menghubungkan ke Backend...' : mode === 'register' ? 'Daftar Sekarang' : 'Masuk Sekarang'} onPress={submit} disabled={busy} style={styles.submit} />
      {mode === 'login' ? <Pressable onPress={() => showMessage('Pemulihan kata sandi belum tersedia dari layar ini. Hubungi dukungan sekolah.', 'Lupa Kata Sandi')}><AppText style={styles.forgot}>Lupa Kata Sandi?</AppText></Pressable> : null}
      {mode === 'login' ? <View style={styles.divider}><View style={styles.dividerLine} /><AppText style={styles.dividerText}>Atau</AppText><View style={styles.dividerLine} /></View> : null}
      {mode === 'login' ? <Pressable accessibilityRole="button" onPress={() => showMessage('Fitur SSO sekolah sedang dipersiapkan untuk sekolah terdaftar.', 'Masuk Akun Siswa')} style={styles.schoolButton}><AppText style={styles.googleMark}>G</AppText><AppText style={styles.schoolButtonText}>Lanjutkan dengan Akun Siswa</AppText></Pressable> : null}
    </View>
    <View style={styles.authFooter}><View style={styles.switchRow}><AppText style={styles.switchText}>{mode === 'register' ? 'Sudah memiliki akun?' : 'Belum punya akun?'}</AppText><Pressable onPress={() => { setError(''); setMode(mode === 'register' ? 'login' : 'register'); }}><AppText style={styles.switchLink}>{mode === 'register' ? 'Masuk' : 'Daftar sekarang'}</AppText></Pressable></View>{mode === 'login' ? <AppText style={styles.copyright}>© 2026 Stoodify, Inc</AppText> : null}</View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  welcome: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8 },
  hero: { width: '100%', height: '40%', alignItems: 'center', paddingTop: '32%', borderBottomLeftRadius: 45, borderBottomRightRadius: 45 },
  logoBadge: { width: 64, height: 64, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)', alignItems: 'center', justifyContent: 'center' }, logo: { width: 36, height: 36, tintColor: '#fff' }, brand: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 24, marginTop: 9 },
  welcomeCopy: { alignItems: 'center', paddingHorizontal: 38, marginTop: -4 }, welcomeSub: { color: colors.muted, textAlign: 'center', lineHeight: 24, fontSize: 14 }, welcomeActions: { width: '100%', paddingHorizontal: 36, gap: 11 },
  auth: { flex: 1, backgroundColor: '#fff' }, authScroll: { flexGrow: 1, paddingHorizontal: 30, paddingBottom: 18 }, authTop: { flexDirection: 'row', alignItems: 'center', paddingTop: 28, gap: 12 }, registerHead: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 12, gap: 2 }, registerHeading: { flex: 1, paddingTop: 0 }, back: { width: 28, height: 44, justifyContent: 'center' }, smallLogo: { width: 46, height: 46, borderRadius: 25, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }, smallLogoImage: { width: 25, height: 25, tintColor: colors.primary }, version: { marginLeft: 'auto', color: '#94A3B8', fontFamily: 'monospace', fontSize: 10 }, authHead: { alignItems: 'flex-start', paddingTop: 30, paddingBottom: 26 }, authTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18 }, authSub: { color: colors.muted, fontSize: 11, marginTop: 5 }, form: { gap: 15 }, emailHint: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: -10 }, emailHintText: { color: colors.muted, fontSize: 9 }, terms: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: -5 }, eye: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, submit: { marginTop: 5 }, forgot: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', textAlign: 'center', paddingVertical: 7, fontSize: 11 }, divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 1 }, dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' }, dividerText: { color: '#94A3B8', fontSize: 10 }, schoolButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 15, backgroundColor: '#F1F5F9', paddingHorizontal: 12 }, googleMark: { color: '#4285F4', fontFamily: 'Poppins_700Bold', fontSize: 16 }, schoolButtonText: { color: '#475569', fontFamily: 'Poppins_600SemiBold', fontSize: 11 }, error: { color: colors.danger, backgroundColor: '#FFF1F2', padding: 10, borderRadius: 12, fontSize: 10 }, authFooter: { marginTop: 'auto', paddingTop: 36, alignItems: 'center' }, switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 4 }, switchText: { color: colors.muted, fontSize: 10 }, switchLink: { color: colors.primary, fontFamily: 'Poppins_700Bold', fontSize: 10 }, copyright: { color: '#94A3B8', fontFamily: 'monospace', fontSize: 9, marginTop: 9 },
});
