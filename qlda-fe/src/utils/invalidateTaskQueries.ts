import type { QueryClient } from "@tanstack/react-query";

export function invalidateTaskQueries(queryClient: QueryClient, projectId: string) {
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId, 'columns'] });

}