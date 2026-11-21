import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight, Clock3, Pin } from 'lucide-react-native';
import { AppText, Card } from './ui';
import { colors } from '../constants/theme';

export default function StudySessionCard({
  session,
  index,
  subjectName = 'Mata pelajaran',
  onFocus,
  onEditSession,
}) {
  const dateFormatted = useMemo(() => {
    if (!session?.date) return 'Sesi belajar';
    const parts = String(session.date).split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
      return d.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }
    return session.date;
  }, [session?.date]);

  const statusLabel =
    session.status === 'completed'
      ? 'Selesai'
      : session.status === 'skipped'
      ? 'Terlewat'
      : 'Terjadwal';

  return (
    <Card style={styles.session}>
      <View style={styles.rank}>
        <AppText style={styles.rankText}>{index + 1}</AppText>
      </View>
      <View style={styles.sessionCopy}>
        <View style={styles.sessionMeta}>
          <AppText style={styles.date}>{dateFormatted}</AppText>
          <View style={styles.badgeRow}>
            {session.isPinned ? (
              <View style={styles.pinnedBadge}>
                <Pin size={10} color="#6366F1" />
                <AppText style={styles.pinnedText}>Diatur Sendiri</AppText>
              </View>
            ) : null}
            <AppText style={styles.status}>{statusLabel}</AppText>
          </View>
        </View>

        <AppText style={styles.sessionTitle}>
          {session.task?.title || 'Tugas belajar'}
        </AppText>
        <AppText style={styles.sessionSub}>
          {subjectName} · {session.startTime || '-'} · {session.durationMinutes || 45} menit
        </AppText>

        {session.reason ? (
          <AppText style={styles.reason} numberOfLines={2}>
            {session.reason}
          </AppText>
        ) : null}

        <View style={styles.sessionActions}>
          <Pressable onPress={() => onFocus?.(session.task, session.durationMinutes || 45)} style={styles.focus}>
            <Clock3 size={13} color={colors.primary} />
            <AppText style={styles.focusText}>Mulai Fokus</AppText>
            <ChevronRight size={13} color={colors.primary} />
          </Pressable>
          {onEditSession ? (
            <Pressable onPress={() => onEditSession(session)} style={styles.editBtn}>
              <Pin size={12} color="#475569" />
              <AppText style={styles.editText}>Sesuaikan</AppText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  session: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  rank: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { color: colors.primary, fontFamily: 'Poppins_700Bold', fontSize: 10 },
  sessionCopy: { flex: 1, gap: 4 },
  sessionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: colors.muted, fontSize: 9, fontFamily: 'Poppins_500Medium' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pinnedText: { color: '#6366F1', fontSize: 8, fontFamily: 'Poppins_600SemiBold' },
  status: { color: colors.primary, fontSize: 9, fontFamily: 'Poppins_600SemiBold' },
  sessionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 11, color: '#0F172A' },
  sessionSub: { color: colors.muted, fontSize: 9 },
  reason: {
    color: '#64748B',
    fontSize: 8,
    lineHeight: 12,
    backgroundColor: '#F8FAFC',
    padding: 6,
    borderRadius: 8,
  },
  sessionActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  focus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  focusText: { color: colors.primary, fontSize: 9, fontFamily: 'Poppins_700Bold' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editText: { color: '#475569', fontSize: 9, fontFamily: 'Poppins_600SemiBold' },
});
