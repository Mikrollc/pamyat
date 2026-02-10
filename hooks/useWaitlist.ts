import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { joinWaitlist, checkWaitlistStatus } from '@/lib/api/waitlist';

export function useWaitlistStatus(graveId: string, userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.waitlist.status(graveId),
    queryFn: () => {
      if (!userId) throw new Error('userId required');
      return checkWaitlistStatus(graveId, userId);
    },
    enabled: !!graveId && !!userId,
  });
}

export function useJoinWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinWaitlist,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlist.status(variables.grave_id),
      });
    },
  });
}
