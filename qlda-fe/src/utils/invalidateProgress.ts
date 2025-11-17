import { QueryClient } from '@tanstack/react-query';

/**
 * Invalidate tất cả progress queries cho một project
 */
export function invalidateProgressQueries(queryClient: QueryClient, projectId: string) {
  queryClient.invalidateQueries({ queryKey: ['projectProgress', projectId] });
  queryClient.invalidateQueries({ queryKey: ['columnProgress', projectId] });
  queryClient.invalidateQueries({ queryKey: ['userProgress', projectId] });
  queryClient.invalidateQueries({ queryKey: ['deadlineSummary', projectId] });
}

