import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchGrave } from '@/lib/api/graves';

export function useGrave(slug: string) {
  return useQuery({
    queryKey: queryKeys.graves.bySlug(slug),
    queryFn: () => fetchGrave(slug),
    enabled: !!slug,
  });
}
