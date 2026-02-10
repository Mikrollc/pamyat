import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { softDeleteGrave } from '@/lib/api';

export function useDeleteGrave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (graveId: string) => {
      await softDeleteGrave(graveId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.graves.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.graves.map });
    },
  });
}
