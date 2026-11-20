import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Bell, CalendarDays, CheckCircle2, ShieldCheck, Sparkles, Timer } from 'lucide-react-native';
import { AppText, Button, Card } from '../ui';
import { colors, radii, shadow } from '../../constants/theme';

const logo = require('../../../assets/web/logo_stoodify.png');

export default function OnboardingSlide({
  index,
  onPermissionRequest,
  hasNotificationPerm = false,
}) {
  if (index === 0) {
    return (
      <View style={styles.slide}>
        <View style={styles.heroWrap}>
          <View style={styles.logoBadge}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.sparkleBadge}>
            <Sparkles size={16} color="#fff" />
          </View>
        </View>
        <AppText style={styles.title}>Welcome to Stoodify</AppText>
        <AppText style={styles.subtitle}>
          Asisten AI cerdas untuk membagi waktu belajar, merapikan jadwal sekolah, dan menuntaskan tugas tanpa burnout.
        </AppText>
        <View style={styles.badgeRow}>
          <View style={styles.featureBadge}>
            <CheckCircle2 size={13} color={colors.primary} />
            <AppText style={styles.featureBadgeText}>Anti Prokrastinasi</AppText>
          </View>
          <View style={styles.featureBadge}>
            <Sparkles size={13} color={colors.primary} />
            <AppText style={styles.featureBadgeText}>AI Scheduler</AppText>
          </View>
        </View>
      </View>
    );
  }

  if (index === 1) {
    return (
      <View style={styles.slide}>
        <View style={[styles.iconHero, { backgroundColor: '#EFF6FF' }]}>
          <CalendarDays size={48} color={colors.primary} strokeWidth={2.2} />
        </View>
        <AppText style={styles.title}>Penjadwalan Otomatis & Adaptif</AppText>
        <AppText style={styles.subtitle}>
          AI menyusun jadwal belajar harianmu secara otomatis menyesuaikan jam sekolah, tingkat kesulitan tugas, dan waktu luangmu.
        </AppText>
        <Card style={styles.previewCard}>
          <View style={styles.previewRow}>
            <View style={styles.previewDot} />
            <View style={{ flex: 1 }}>
              <AppText style={styles.previewTitle}>Sesi Belajar Matematika</AppText>
              <AppText style={styles.previewSub}>16:30 - 17:30 · 60 menit fokus</AppText>
            </View>
            <View style={styles.priorityPill}>
              <AppText style={styles.priorityPillText}>Prioritas Tinggi</AppText>
            </View>
          </View>
        </Card>
      </View>
    );
  }

  if (index === 2) {
    return (
      <View style={styles.slide}>
        <View style={[styles.iconHero, { backgroundColor: '#FEF3C7' }]}>
          <Bell size={48} color="#D97706" strokeWidth={2.2} />
        </View>
        <AppText style={styles.title}>Jangan Lewatkan Deadline</AppText>
        <AppText style={styles.subtitle}>
          Dapatkan pengingat bertingkat H-2, H-1 darurat, dan hari-H sebelum tugasmu jatuh tempo. Dilengkapi pengingat 10 menit sebelum sesi belajar dimulai.
        </AppText>
        <Card style={styles.permCard}>
          <View style={styles.permRow}>
            <ShieldCheck size={20} color={hasNotificationPerm ? colors.success : colors.primary} />
            <View style={{ flex: 1 }}>
              <AppText style={styles.permTitle}>
                {hasNotificationPerm ? 'Notifikasi Aktif' : 'Izin Notifikasi Pengingat'}
              </AppText>
              <AppText style={styles.permSub}>
                {hasNotificationPerm
                  ? 'Pengingat deadline dan sesi belajar siap dikirimkan ke perangkatmu.'
                  : 'Aktifkan izin agar Stoodify dapat mengingatkan tugasmu tepat waktu.'}
              </AppText>
            </View>
          </View>
          {!hasNotificationPerm ? (
            <Button
              title="Aktifkan Notifikasi"
              onPress={onPermissionRequest}
              compact
              style={styles.permButton}
            />
          ) : null}
        </Card>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  slide: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  heroWrap: {
    position: 'relative',
    marginBottom: 24,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    ...shadow,
  },
  logo: {
    width: 58,
    height: 58,
  },
  sparkleBadge: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  iconHero: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...shadow,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
    maxWidth: 320,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
  },
  featureBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: colors.primary,
  },
  previewCard: {
    width: '100%',
    maxWidth: 340,
    marginTop: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  previewTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: colors.ink,
  },
  previewSub: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  priorityPill: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityPillText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    color: colors.danger,
  },
  permCard: {
    width: '100%',
    maxWidth: 340,
    marginTop: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  permTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: colors.ink,
  },
  permSub: {
    fontSize: 10,
    color: colors.muted,
    lineHeight: 15,
    marginTop: 2,
  },
  permButton: {
    alignSelf: 'flex-start',
  },
});
