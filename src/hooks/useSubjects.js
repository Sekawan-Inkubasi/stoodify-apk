import { useMemo } from 'react';
import { useStoodify } from '../context/StoodifyContext';

export function useSubjects() {
  const {
    subjects,
    isLoadingData,
    error,
    addSubject,
    updateSubject,
    deleteSubject,
    refreshAllData,
  } = useStoodify();

  const subjectsMap = useMemo(() => {
    const map = {};
    subjects.forEach((subj) => {
      map[subj.id] = subj;
    });
    return map;
  }, [subjects]);

  const getSubjectById = (id) => subjectsMap[String(id)] || null;

  return {
    subjects,
    subjectsMap,
    getSubjectById,
    totalCount: subjects.length,
    isLoading: isLoadingData,
    error,
    addSubject,
    updateSubject,
    deleteSubject,
    refreshSubjects: refreshAllData,
  };
}

export default useSubjects;
