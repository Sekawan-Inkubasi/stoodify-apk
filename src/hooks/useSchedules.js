import { useMemo } from 'react';
import { useStoodify } from '../context/StoodifyContext';

const DAY_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export function useSchedules() {
  const {
    schedules,
    isLoadingData,
    error,
    addSchedule,
    deleteSchedule,
    refreshAllData,
  } = useStoodify();

  const schedulesByDay = useMemo(() => {
    const grouped = {};
    DAY_ORDER.forEach((day) => {
      grouped[day] = [];
    });

    schedules.forEach((sch) => {
      const day = sch.dayOfWeek || 'Senin';
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(sch);
    });

    // Urutkan per jam mulai
    Object.keys(grouped).forEach((day) => {
      grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [schedules]);

  return {
    schedules,
    schedulesByDay,
    totalCount: schedules.length,
    isLoading: isLoadingData,
    error,
    addSchedule,
    deleteSchedule,
    refreshSchedules: refreshAllData,
  };
}

export default useSchedules;
