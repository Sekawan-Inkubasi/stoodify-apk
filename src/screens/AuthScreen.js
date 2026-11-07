import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Eye, EyeOff, GraduationCap } from 'lucide-react-native';
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
      <AppText style={styles.brandSub}>Asisten belajar pintar</AppText>
    </LinearGradient>
    <View style={styles.welcomeCopy}><AppText style={styles.welcomeTitle}>Belajar lebih terarah</AppText><AppText style={styles.welcomeSub}>Asisten AI cerdas untuk membagi waktu belajar dan menyelesaikan tugas sekolah tanpa burnout.</AppText></View>
    <View style={styles.welcomeActions}><Button title="Masuk ke Akun" onPress={() => setMode('login')} /><Button title="Daftar Akun Baru" variant="outline" onPress={() => setMode('register')} /></View>
  </View>;

  return <KeyboardAvoidingView style={styles.auth} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.authHead}><View style={styles.smallLogo}><GraduationCap size={21} color="#fff" /></View><AppText style={styles.authTitle}>{mode === 'register' ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}</AppText><AppText style={styles.authSub}>{mode === 'register' ? 'Mulai atur perjalanan belajarmu' : 'Masuk untuk mengakses jadwal dan tugas belajarmu'}</AppText></View>
    <View style={styles.form}>
      {mode === 'register' ? <Field label="NAMA LENGKAP" value={name} onChangeText={setName} placeholder="Nama siswa" /> : null}
      <Field label="EMAIL SISWA" value={email} onChangeText={setEmail} placeholder="nama@email.com" keyboardType="email-address" />
      <Field label="KATA SANDI" value={password} onChangeText={setPassword} placeholder="Masukkan kata sandi" secureTextEntry={!showPassword} right={<Pressable onPress={() => setShowPassword(!showPassword)} accessibilityLabel="Tampilkan kata sandi" style={styles.eye}>{showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}</Pressable>} />
      {mode === 'register' ? <Field label="KONFIRMASI KATA SANDI" value={confirm} onChangeText={setConfirm} placeholder="Ulangi kata sandi" secureTextEntry={!showPassword} /> : null}
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      <Button title={busy ? 'Menghubungkan ke Backend...' : mode === 'register' ? 'Daftar Sekarang' : 'Masuk Sekarang'} onPress={submit} disabled={busy} style={styles.submit} />
      {mode === 'login' ? <Pressable onPress={() => showMessage('Pemulihan kata sandi belum tersedia dari layar ini. Hubungi dukungan sekolah.', 'Lupa Kata Sandi')}><AppText style={styles.forgot}>Lupa Kata Sandi?</AppText></Pressable> : null}
      <Button title="Lanjutkan dengan Akun Siswa" variant="ghost" onPress={() => showMessage('Fitur SSO sekolah sedang dipersiapkan untuk sekolah terdaftar.', 'Masuk Akun Siswa')} />
      <View style={styles.switchRow}><AppText style={styles.switchText}>{mode === 'register' ? 'Sudah punya akun?' : 'Belum punya akun?'}</AppText><Pressable onPress={() => { setError(''); setMode(mode === 'register' ? 'login' : 'register'); }}><AppText style={styles.switchLink}>{mode === 'register' ? 'Masuk' : 'Daftar sekarang'}</AppText></Pressable></View>
    </View>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  welcome: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 26 },
  hero: { width: '100%', height: '47%', alignItems: 'center', paddingTop: '15%', borderBottomLeftRadius: 80, borderBottomRightRadius: 80 },
  logoBadge: { width: 74, height: 74, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)', alignItems: 'center', justifyContent: 'center' }, logo: { width: 42, height: 42 }, brand: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 27, marginTop: 9 }, brandSub: { color: '#EAF2FF', fontFamily: 'Poppins_500Medium', fontSize: 10 },
  welcomeCopy: { alignItems: 'center', paddingHorizontal: 38, marginTop: -32 }, welcomeTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18 }, welcomeSub: { color: colors.muted, textAlign: 'center', lineHeight: 20, marginTop: 8, fontSize: 12 }, welcomeActions: { width: '100%', paddingHorizontal: 24, gap: 11 },
  auth: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24 }, authHead: { alignItems: 'center', paddingTop: 46, paddingBottom: 30 }, smallLogo: { width: 50, height: 50, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 17 }, authTitle: { fontFamily: 'Poppins_700Bold', fontSize: 21 }, authSub: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 5 }, form: { gap: 15 }, eye: { padding: 4 }, submit: { marginTop: 5 }, forgot: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', textAlign: 'center', paddingVertical: 7, fontSize: 11 }, error: { color: colors.danger, backgroundColor: '#FFF1F2', padding: 10, borderRadius: 12, fontSize: 10 }, switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 4 }, switchText: { color: colors.muted, fontSize: 10 }, switchLink: { color: colors.primary, fontFamily: 'Poppins_700Bold', fontSize: 10 },
});
