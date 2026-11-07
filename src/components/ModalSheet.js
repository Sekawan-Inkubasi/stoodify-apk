import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import { AppText } from './ui';
import { colors } from '../constants/theme';

export default function ModalSheet({ visible, title, subtitle, onClose, children, full = false }) {
  return <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Tutup dialog" />
      <View style={[styles.sheet, full && styles.full]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.titleWrap}><AppText style={styles.title}>{title}</AppText>{subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}</View>
          <Pressable accessibilityRole="button" accessibilityLabel="Tutup" onPress={onClose} style={styles.close}><X size={18} color="#64748B" /></Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>{children}</ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.48)' },
  sheet: { maxHeight: '92%', minHeight: '35%', backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingBottom: 20 },
  full: { height: '92%' }, handle: { width: 40, height: 4, borderRadius: 3, backgroundColor: '#CBD5E1', alignSelf: 'center', marginTop: 10, marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  titleWrap: { flex: 1 }, title: { fontFamily: 'Poppins_700Bold', fontSize: 15 }, subtitle: { fontSize: 10, color: colors.muted, marginTop: 3 },
  close: { width: 34, height: 34, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  body: { paddingTop: 16, paddingBottom: 20, gap: 14 },
});
