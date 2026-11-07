import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, Pressable } from 'react-native';
import EmergencyWebView from './EmergencyWebView';
import { colors } from '../constants/theme';

export default class AppErrorBoundary extends React.Component {
  state = { failed: false, web: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('Native app render failed:', error?.message); }
  render() {
    if (this.state.web) return <EmergencyWebView onClose={() => this.setState({ web: false, failed: true })} />;
    if (this.state.failed) return <SafeAreaView style={styles.root}><StatusBar barStyle="dark-content" /><View style={styles.center}><Text style={styles.icon}>!</Text><Text style={styles.title}>Aplikasi mengalami kendala</Text><Text style={styles.body}>Coba buka kembali aplikasi native atau gunakan versi web sementara.</Text><Pressable style={styles.primary} onPress={() => this.setState({ failed: false })}><Text style={styles.primaryText}>Coba Lagi</Text></Pressable><Pressable style={styles.secondary} onPress={() => this.setState({ web: true })}><Text style={styles.secondaryText}>Buka Versi Web Darurat</Text></Pressable></View></SafeAreaView>;
    return this.props.children;
  }
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.canvas }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }, icon: { width: 54, height: 54, borderRadius: 28, backgroundColor: '#FFF1F2', color: colors.danger, fontSize: 32, textAlign: 'center', textAlignVertical: 'center', marginBottom: 14 }, title: { color: '#0F172A', fontSize: 18, fontWeight: '700' }, body: { color: colors.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 8, marginBottom: 18 }, primary: { minHeight: 44, borderRadius: 24, backgroundColor: colors.primary, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' }, primaryText: { color: '#fff', fontWeight: '600' }, secondary: { padding: 14 }, secondaryText: { color: colors.primary, fontWeight: '600' } });
