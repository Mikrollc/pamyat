import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchAllCemeteries } from '@/lib/api';

export function useAllCemeteries() {
  return useQuery({
    queryKey: queryKeys.cemeteries.allMap,
    queryFn: fetchAllCemeteries,
    staleTime: Infinity,
  });
}
