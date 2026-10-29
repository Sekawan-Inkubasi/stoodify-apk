import { apiGet, apiPost } from './apiClient';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { mapSubjectToUI } from './subjectService';

export function mapPredictionToUI(pred) {
  if (!pred) return null;

  return {
    id: String(pred.id),
    subjectId: String(pred.subject_id),
    subject: pred.subject ? mapSubjectToUI(pred.subject) : null,
    predictedMaterial: pred.predicted_material || '',
    confidence: Number(pred.confidence) || 0,
    confidencePercent: Math.round(Number(pred.confidence) || 0),
    reason: pred.reason || 'Prediksi berdasarkan riwayat materi dan pola tugas.',
    prerequisites: pred.prerequisites || '',
    preparationSuggestion: pred.preparation_suggestion || '',
    userFeedback: pred.user_feedback || null,
    createdAt: pred.created_at,
  };
}

export async function generatePrediction(subjectId) {
  const result = await apiPost(ENDPOINTS.AI_PREDICTION_GENERATE, {
    subject_id: Number(subjectId),
  });
  return mapPredictionToUI(result?.data);
}

export async function getPredictionsBySubject(subjectId) {
  const result = await apiGet(ENDPOINTS.AI_PREDICTIONS_BY_SUBJECT(subjectId));
  const list = result?.data || [];
  return list.map(mapPredictionToUI);
}

export async function submitFeedback(predictionId, feedback) {
  const normalizedFeedback =
    feedback === 'correct' || feedback === 'accurate' ? 'accurate' : 'inaccurate';
  const result = await apiPost(ENDPOINTS.AI_PREDICTION_FEEDBACK(predictionId), {
    feedback: normalizedFeedback,
  });
  return mapPredictionToUI(result?.data);
}

export default {
  generatePrediction,
  getPredictionsBySubject,
  submitFeedback,
  mapPredictionToUI,
};
