import { useEffect, useState } from 'react';
import { getLastReadTime, STORAGE_CHANGE_EVENT } from '@/utils/commentBadgeUtils';

/**
 * Hook to track task read status changes and force re-render when localStorage changes
 * @param taskId - The task ID to track
 * @param userId - The user ID
 * @returns The last read timestamp (or null if never read) - changes trigger re-render
 */
export function useTaskReadStatus(taskId: string | undefined, userId: string | undefined) {
  const [lastReadTime, setLastReadTime] = useState<Date | null>(null);
  const [updateKey, setUpdateKey] = useState(0); // Force re-render key

  useEffect(() => {
    if (!taskId || !userId) {
      setLastReadTime(null);
      return;
    }

    // Get initial value
    const initialTime = getLastReadTime(taskId, userId);
    setLastReadTime(initialTime);

    // Listen for storage changes
    const handleStorageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ taskId: string; userId: string }>;
      if (customEvent.detail?.taskId === taskId && customEvent.detail?.userId === userId) {
        // Task read status changed for this task
        const newTime = getLastReadTime(taskId, userId);
        setLastReadTime(newTime);
        setUpdateKey((prev) => prev + 1); // Force re-render
      }
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);

    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, [taskId, userId]);

  return { lastReadTime, updateKey };
}

