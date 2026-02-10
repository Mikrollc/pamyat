import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchGraveMembership } from '@/lib/api/graves';

export function useGraveMembership(graveId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.graveMembers.byGraveAndUser(graveId ?? '', userId ?? ''),
    queryFn: () => {
      if (!graveId || !userId) throw new Error('graveId and userId required');
      return fetchGraveMembership(graveId, userId);
    },
    enabled: !!graveId && !!userId,
  });
}
