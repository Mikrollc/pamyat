import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchGravesByUser } from '@/lib/api/graves';

export function useMyGraves(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.graves.byUser(userId!),
    queryFn: () => fetchGravesByUser(userId!),
    enabled: !!userId,
  });
}
