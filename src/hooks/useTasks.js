import { useMemo } from 'react';
import { useStoodify } from '../context/StoodifyContext';

export function useTasks(filterOptions = {}) {
  const {
    tasks,
    isLoadingData,
    error,
    addTask,
    updateTaskStatus,
    updateTaskProgress,
    deleteTask,
    refreshAllData,
  } = useStoodify();

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filterOptions.status) {
      result = result.filter((t) => t.status === filterOptions.status);
    }

    if (filterOptions.subjectId) {
      result = result.filter((t) => t.subjectId === filterOptions.subjectId);
    }

    if (filterOptions.search) {
      const q = filterOptions.search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [tasks, filterOptions.status, filterOptions.subjectId, filterOptions.search]);

  const urgentTasks = useMemo(() => {
    return tasks.filter((t) => t.priority === 'sangat-tinggi' || t.priority === 'tinggi');
  }, [tasks]);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    urgentTasks,
    totalCount: tasks.length,
    isLoading: isLoadingData,
    error,
    addTask,
    updateTaskStatus,
    updateTaskProgress,
    deleteTask,
    refreshTasks: refreshAllData,
  };
}

export default useTasks;
