import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { REMOTE_WEB_URL } from '../constants/config';
import { colors } from '../constants/theme';

export default function EmergencyWebView({ onClose }) {
  const [key, setKey] = useState(0);
  const [failed, setFailed] = useState(false);
  return <View style={styles.root}>
    <View style={styles.banner}><Text style={styles.bannerTitle}>Versi Web Darurat</Text><Pressable onPress={onClose}><Text style={styles.close}>Kembali ke aplikasi</Text></Pressable></View>
    {!failed ? <WebView key={key} source={{ uri: REMOTE_WEB_URL }} style={styles.web} javaScriptEnabled domStorageEnabled cacheEnabled originWhitelist={['https://*']} onError={() => setFailed(true)} onHttpError={(event) => { if (event.nativeEvent.statusCode >= 500) setFailed(true); }} startInLoadingState renderLoading={() => <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>} /> : <View style={styles.error}><Text style={styles.errorTitle}>Versi web tidak dapat dimuat</Text><Text style={styles.errorSub}>Periksa koneksi internet lalu coba lagi.</Text><Pressable style={styles.retry} onPress={() => { setFailed(false); setKey((value) => value + 1); }}><Text style={styles.retryText}>Coba Lagi</Text></Pressable></View>}
  </View>;
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#F8FAFC' }, banner: { minHeight: 54, paddingHorizontal: 16, paddingTop: 8, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#E2E8F0' }, bannerTitle: { color: '#0F172A', fontSize: 12, fontWeight: '700' }, close: { color: colors.primary, fontSize: 11, fontWeight: '600' }, web: { flex: 1, backgroundColor: '#EAF1FC' }, loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }, error: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }, errorTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' }, errorSub: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 6 }, retry: { marginTop: 18, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 24 }, retryText: { color: '#fff', fontWeight: '600' } });
