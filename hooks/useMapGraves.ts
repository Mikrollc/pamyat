import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchMapGraves } from '@/lib/api/graves';

export function useMapGraves() {
  return useQuery({
    queryKey: queryKeys.graves.map,
    queryFn: fetchMapGraves,
  });
}
