import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { searchCemeteries } from '@/lib/api/cemeteries';

export function useCemeterySearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: queryKeys.cemeteries.search(trimmed),
    queryFn: () => searchCemeteries(trimmed),
    enabled: trimmed.length >= 2,
  });
}
