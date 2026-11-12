import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import EmergencyWebView from './EmergencyWebView';
import { colors } from '../constants/theme';

export default class AppErrorBoundary extends React.Component {
  state = { failed: false, web: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { failed: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Native app render failed:', error?.message, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.web) {
      return <EmergencyWebView onClose={() => this.setState({ web: false, failed: true })} />;
    }

    if (this.state.failed) {
      const errorMsg = this.state.error?.message || this.state.error?.toString() || 'Kendala tidak terduga pada komponen native.';
      const stack = this.state.error?.stack || this.state.errorInfo?.componentStack || '';

      return (
        <SafeAreaView style={styles.root}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.center}>
            <Text style={styles.icon}>!</Text>
            <Text style={styles.title}>Aplikasi mengalami kendala</Text>
            <Text style={styles.body}>Coba buka kembali aplikasi native atau gunakan versi web sementara.</Text>
            
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Detail Kendala:</Text>
              <ScrollView style={styles.scrollArea}>
                <Text selectable style={styles.errorText}>{errorMsg}</Text>
                {stack ? <Text selectable style={styles.stackText}>{stack}</Text> : null}
              </ScrollView>
            </View>

            <Pressable
              style={styles.primary}
              onPress={() => this.setState({ failed: false, error: null, errorInfo: null })}
            >
              <Text style={styles.primaryText}>Coba Lagi</Text>
            </Pressable>
            <Pressable style={styles.secondary} onPress={() => this.setState({ web: true })}>
              <Text style={styles.secondaryText}>Buka Versi Web Darurat</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 28,
    backgroundColor: '#FFF1F2',
    color: colors.danger,
    fontSize: 32,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginBottom: 14,
  },
  title: { color: '#0F172A', fontSize: 18, fontWeight: '700' },
  body: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  errorTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  scrollArea: { maxHeight: 120 },
  errorText: { fontSize: 11, color: colors.danger, fontFamily: 'monospace' },
  stackText: { fontSize: 9, color: '#64748B', fontFamily: 'monospace', marginTop: 4 },
  primary: {
    minHeight: 44,
    minWidth: 140,
    borderRadius: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondary: { padding: 14 },
  secondaryText: { color: colors.primary, fontWeight: '600' },
});
