import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createGrave } from '@/lib/api/graves';

export function useCreateGrave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGrave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.graves.all });
    },
  });
}
