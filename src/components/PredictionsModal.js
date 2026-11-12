import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  Brain,
  Check,
  Info,
  Lightbulb,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react-native';
import ModalSheet from './ModalSheet';
import { AppText, Button, Card, EmptyState, Pill } from './ui';
import { colors, radii } from '../constants/theme';

export default function PredictionsModal({
  visible,
  onClose,
  subjects = [],
  predictions = [],
  onGenerate,
  onFeedback,
  busy = false,
}) {
  const [selectedSubId, setSelectedSubId] = useState(
    subjects[0]?.id ? String(subjects[0].id) : ''
  );

  const activeSubjectId = useMemo(() => {
    if (selectedSubId && subjects.some((s) => String(s.id) === String(selectedSubId))) {
      return String(selectedSubId);
    }
    return subjects[0]?.id ? String(subjects[0].id) : '';
  }, [selectedSubId, subjects]);

  const selectedSubject = useMemo(
    () => subjects.find((s) => String(s.id) === activeSubjectId),
    [subjects, activeSubjectId]
  );

  const filteredPredictions = useMemo(() => {
    if (!activeSubjectId) return predictions;
    return predictions.filter((p) => String(p.subjectId) === activeSubjectId);
  }, [predictions, activeSubjectId]);

  return (
    <ModalSheet
      visible={visible}
      title="Prediksi Materi Selanjutnya"
      subtitle="Analisis riwayat PR & Kurikulum Merdeka"
      onClose={onClose}
    >
      <View style={styles.infoBanner}>
        <View style={styles.infoIconWrap}>
          <Info size={16} color={colors.primary} />
        </View>
        <AppText style={styles.infoText}>
          AI menganalisis materi tugas lampau dan silabus Kurikulum Merdeka untuk
          memperkirakan bab pembelajaran berikutnya agar kamu bisa curi start belajar!
        </AppText>
      </View>

      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionLabel}>PILIH MATA PELAJARAN</AppText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subjectScroll}
      >
        {subjects.map((sub) => {
          const isSelected = String(sub.id) === activeSubjectId;
          return (
            <Pill
              key={sub.id}
              title={sub.name}
              active={isSelected}
              onPress={() => setSelectedSubId(String(sub.id))}
            />
          );
        })}
      </ScrollView>

      <Button
        title={busy ? 'Menganalisis Silabus...' : 'Analisis AI Materi Berikutnya'}
        icon={Sparkles}
        onPress={() => activeSubjectId && onGenerate(activeSubjectId)}
        disabled={busy || !activeSubjectId}
      />

      <View style={styles.listContainer}>
        {filteredPredictions.length > 0 ? (
          filteredPredictions.map((pred) => {
            const prereqList = (pred.prerequisites || '')
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean);

            const isAccurate = pred.userFeedback === 'accurate';
            const isInaccurate = pred.userFeedback === 'inaccurate';

            return (
              <Card key={pred.id} style={styles.predCard}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.subjectBadge,
                      { backgroundColor: pred.subject?.color || colors.primary },
                    ]}
                  >
                    <AppText style={styles.subjectBadgeText}>
                      {pred.subject?.name || selectedSubject?.name || 'Mata Pelajaran'}
                    </AppText>
                  </View>
                  <View style={styles.confidenceBadge}>
                    <Sparkles size={12} color={colors.primary} />
                    <AppText style={styles.confidenceText}>
                      {pred.confidencePercent || Math.round(pred.confidence || 0)}% Yakin
                    </AppText>
                  </View>
                </View>

                <View style={styles.titleSection}>
                  <AppText style={styles.topicSubtitle}>TOPIK PEMBELAJARAN MENDATANG</AppText>
                  <AppText style={styles.topicTitle}>{pred.predictedMaterial}</AppText>
                </View>

                {pred.reason ? (
                  <View style={styles.reasonBox}>
                    <AppText style={styles.reasonText}>
                      <AppText style={styles.boldLabel}>Alasan Analisis: </AppText>
                      {pred.reason}
                    </AppText>
                  </View>
                ) : null}

                {prereqList.length > 0 ? (
                  <View style={styles.prereqSection}>
                    <AppText style={styles.prereqHeader}>Materi Prasyarat:</AppText>
                    <View style={styles.prereqList}>
                      {prereqList.map((prereq, idx) => (
                        <View key={idx} style={styles.prereqChip}>
                          <Check size={11} color="#059669" />
                          <AppText style={styles.prereqText}>{prereq}</AppText>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {pred.preparationSuggestion ? (
                  <View style={styles.tipBox}>
                    <Lightbulb size={15} color="#D97706" style={styles.tipIcon} />
                    <AppText style={styles.tipText}>
                      <AppText style={styles.tipBold}>Saran Curi Start: </AppText>
                      {pred.preparationSuggestion}
                    </AppText>
                  </View>
                ) : null}

                <View style={styles.feedbackRow}>
                  <AppText style={styles.feedbackPrompt}>Prediksi ini akurat di kelasmu?</AppText>
                  <View style={styles.feedbackActions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Tandai tepat"
                      onPress={() => onFeedback(pred, 'accurate')}
                      style={[styles.feedbackButton, isAccurate && styles.btnAccurateActive]}
                      hitSlop={6}
                    >
                      <ThumbsUp size={13} color={isAccurate ? '#fff' : '#059669'} />
                      <AppText style={[styles.feedbackBtnText, isAccurate && styles.textWhite]}>
                        Tepat
                      </AppText>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Tandai meleset"
                      onPress={() => onFeedback(pred, 'inaccurate')}
                      style={[styles.feedbackButton, isInaccurate && styles.btnInaccurateActive]}
                      hitSlop={6}
                    >
                      <ThumbsDown size={13} color={isInaccurate ? '#fff' : '#E11D48'} />
                      <AppText style={[styles.feedbackBtnText, isInaccurate && styles.textWhite]}>
                        Meleset
                      </AppText>
                    </Pressable>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon={Brain}
            title="Belum Ada Prediksi"
            subtitle={
              selectedSubject
                ? `Tekan tombol Analisis AI di atas untuk memprediksi materi ${selectedSubject.name} selanjutnya.`
                : 'Pilih mata pelajaran untuk melihat prediksi materi mendatang.'
            }
          />
        )}
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  infoBanner: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoIconWrap: { marginTop: 2 },
  infoText: { flex: 1, color: '#1E3A8A', fontSize: 12, lineHeight: 17 },
  sectionHeader: { marginTop: 4 },
  sectionLabel: { color: '#475569', fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  subjectScroll: { gap: 8, paddingBottom: 2 },
  listContainer: { gap: 14, marginTop: 4 },
  predCard: { gap: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  subjectBadgeText: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  confidenceBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 9, paddingVertical: 4, borderRadius: radii.pill },
  confidenceText: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  titleSection: { gap: 2 },
  topicSubtitle: { color: '#64748B', fontFamily: 'Poppins_600SemiBold', fontSize: 10, letterSpacing: 0.5 },
  topicTitle: { color: '#0F172A', fontFamily: 'Poppins_700Bold', fontSize: 15, lineHeight: 21 },
  reasonBox: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 10 },
  reasonText: { color: '#334155', fontSize: 12, lineHeight: 18 },
  boldLabel: { fontFamily: 'Poppins_600SemiBold', color: '#1E293B' },
  prereqSection: { gap: 6 },
  prereqHeader: { color: '#475569', fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  prereqList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  prereqChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill },
  prereqText: { color: '#166534', fontFamily: 'Poppins_500Medium', fontSize: 11 },
  tipBox: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 14, padding: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  tipIcon: { marginTop: 2 },
  tipText: { flex: 1, color: '#78350F', fontSize: 12, lineHeight: 18 },
  tipBold: { fontFamily: 'Poppins_600SemiBold', color: '#78350F' },
  feedbackRow: { borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  feedbackPrompt: { color: '#64748B', fontSize: 11 },
  feedbackActions: { flexDirection: 'row', gap: 8 },
  feedbackButton: { minHeight: 34, paddingHorizontal: 12, borderRadius: 17, backgroundColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', gap: 5 },
  btnAccurateActive: { backgroundColor: '#059669' },
  btnInaccurateActive: { backgroundColor: '#E11D48' },
  feedbackBtnText: { color: '#475569', fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  textWhite: { color: '#fff' },
});
