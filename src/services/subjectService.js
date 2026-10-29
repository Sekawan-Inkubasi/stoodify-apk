import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';
import { ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Adapter: Konversi mata pelajaran dari model server ke format visual antarmuka mobile
 */
export function mapSubjectToUI(subject) {
  if (!subject) return null;

  const name = subject.name || 'Mata Pelajaran';
  const words = name.trim().split(/\s+/);
  const code =
    words.length === 1
      ? name.slice(0, 3).toUpperCase()
      : words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();

  const color = subject.color || '#0066FF';
  const difficultyNum = Number(subject.difficulty) || 3;
  const generalDifficulty =
    difficultyNum <= 2 ? 'mudah' : difficultyNum <= 3 ? 'sedang' : 'sulit';

  return {
    id: String(subject.id),
    name,
    code,
    color,
    accentBg: `${color}18`, // Hex 10% opacity tint
    difficulty: difficultyNum,
    generalDifficulty,
    createdAt: subject.created_at,
  };
}

export function mapDifficultyToBackend(diff) {
  if (typeof diff === 'number') return Math.max(1, Math.min(5, Math.round(diff)));
  if (diff === 'mudah') return 2;
  if (diff === 'sedang') return 3;
  if (diff === 'sulit') return 5;
  return 3;
}

export async function getSubjects(params = {}) {
  const result = await apiGet(ENDPOINTS.SUBJECTS, params);
  const list = result?.data || [];
  return list.map(mapSubjectToUI);
}

export async function getSubjectById(id) {
  const result = await apiGet(ENDPOINTS.SUBJECT_DETAIL(id));
  return mapSubjectToUI(result?.data);
}

export async function createSubject({ name, color = '#0066FF', difficulty = 3 }) {
  const payload = {
    name: name.trim(),
    color,
    difficulty: mapDifficultyToBackend(difficulty),
  };
  const result = await apiPost(ENDPOINTS.SUBJECTS, payload);
  return mapSubjectToUI(result?.data);
}

export async function updateSubject(id, { name, color, difficulty }) {
  const payload = {};
  if (name !== undefined) payload.name = name.trim();
  if (color !== undefined) payload.color = color;
  if (difficulty !== undefined) payload.difficulty = mapDifficultyToBackend(difficulty);

  const result = await apiPatch(ENDPOINTS.SUBJECT_DETAIL(id), payload);
  return mapSubjectToUI(result?.data);
}

export async function deleteSubject(id) {
  return apiDelete(ENDPOINTS.SUBJECT_DETAIL(id));
}

export default {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  mapSubjectToUI,
  mapDifficultyToBackend,
};
