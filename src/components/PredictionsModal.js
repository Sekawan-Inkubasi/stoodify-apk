import React, { useState } from 'react';
import { View } from 'react-native';
import { CheckCircle2, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import ModalSheet from './ModalSheet';
import { AppText, Button, Card, EmptyState, Pill } from './ui';
import { colors } from '../constants/theme';

export default function PredictionsModal({ visible, onClose, subjects, predictions, onGenerate, onFeedback, busy }) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  return <ModalSheet visible={visible} title="Prediksi Materi" subtitle="Prediksi pembelajaran dari layanan AI" onClose={onClose}>
    <AppText style={{ color: '#475569', fontFamily: 'Poppins_600SemiBold', fontSize: 10 }}>PILIH MATA PELAJARAN</AppText>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>{subjects.map((subject) => <Pill key={subject.id} title={subject.name} active={String(subjectId) === String(subject.id)} onPress={() => setSubjectId(String(subject.id))} />)}</View>
    <Button title={busy ? 'Menganalisis...' : 'Buat Prediksi Materi'} icon={Sparkles} onPress={() => onGenerate(subjectId)} disabled={busy || !subjectId} />
    {predictions.length ? predictions.map((prediction) => <Card key={prediction.id} style={{ gap: 9 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><AppText style={{ fontFamily: 'Poppins_700Bold', fontSize: 12 }}>{prediction.subject?.name || 'Mata Pelajaran'}</AppText><AppText style={{ color: colors.primary, fontFamily: 'Poppins_700Bold', fontSize: 10 }}>{Math.round(prediction.confidencePercent || prediction.confidence || 0)}% cocok</AppText></View><AppText style={{ fontFamily: 'Poppins_700Bold', fontSize: 15 }}>{prediction.predictedMaterial || prediction.predictedTopic}</AppText>{prediction.reason ? <AppText style={{ color: colors.muted, fontSize: 9, lineHeight: 15 }}>{prediction.reason}</AppText> : null}{prediction.prerequisites ? <AppText style={{ fontSize: 9 }}><AppText style={{ fontFamily: 'Poppins_700Bold' }}>Prasyarat: </AppText>{Array.isArray(prediction.prerequisites) ? prediction.prerequisites.join(', ') : prediction.prerequisites}</AppText> : null}{prediction.preparationSuggestion ? <AppText style={{ color: '#475569', fontSize: 9 }}>{prediction.preparationSuggestion}</AppText> : null}<View style={{ flexDirection: 'row', gap: 16, marginTop: 2 }}><AppText style={{ color: colors.muted, fontSize: 9 }}>Apakah prediksi ini akurat?</AppText><ThumbsUp size={15} color={colors.success} onPress={() => onFeedback(prediction, 'accurate')} /><ThumbsDown size={15} color={colors.danger} onPress={() => onFeedback(prediction, 'inaccurate')} /></View></Card>) : <EmptyState icon={CheckCircle2} title="Prediksi Materi" subtitle="Pilih mata pelajaran untuk meminta prediksi terbaru dari backend." />}
  </ModalSheet>;
}
