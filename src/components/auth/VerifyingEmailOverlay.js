import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { AppText } from '../ui';
import { colors, radii, shadow } from '../../constants/theme';

export default function VerifyingEmailOverlay({ visible = false }) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.spinnerWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <AppText style={styles.title}>Memverifikasi Email...</AppText>
          <AppText style={styles.subtitle}>
            Sedang mengaktifkan akun belajarmu. Mohon tunggu sebentar...
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...shadow.lg,
  },
  spinnerWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
