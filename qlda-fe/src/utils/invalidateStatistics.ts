import type { QueryClient } from '@tanstack/react-query';

export function invalidateStatisticsQueries(queryClient: QueryClient, projectId: string) {
  queryClient.invalidateQueries({ queryKey: ['statistics', 'overview', projectId] });
  queryClient.invalidateQueries({ queryKey: ['statistics', 'columns', projectId] });
  queryClient.invalidateQueries({ queryKey: ['statistics', 'members', projectId] });
  queryClient.invalidateQueries({ queryKey: ['statistics', 'timeline', projectId] });
  queryClient.invalidateQueries({ queryKey: ['statistics', 'comments', projectId] });
  queryClient.invalidateQueries({ queryKey: ['statistics', 'deadlines', projectId] });
}

