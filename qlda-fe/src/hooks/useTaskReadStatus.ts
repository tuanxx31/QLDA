import { useEffect, useState } from 'react';
import { getLastReadTime, STORAGE_CHANGE_EVENT } from '@/utils/commentBadgeUtils';

export function useTaskReadStatus(taskId: string | undefined, userId: string | undefined) {
  const [lastReadTime, setLastReadTime] = useState<Date | null>(null);
  const [updateKey, setUpdateKey] = useState(0); 

  useEffect(() => {
    if (!taskId || !userId) {
      setLastReadTime(null);
      return;
    }

    
    const initialTime = getLastReadTime(taskId, userId);
    setLastReadTime(initialTime);

    
    const handleStorageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ taskId: string; userId: string }>;
      if (customEvent.detail?.taskId === taskId && customEvent.detail?.userId === userId) {
        
        const newTime = getLastReadTime(taskId, userId);
        setLastReadTime(newTime);
        setUpdateKey((prev) => prev + 1); 
      }
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);

    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, [taskId, userId]);

  return { lastReadTime, updateKey };
}

