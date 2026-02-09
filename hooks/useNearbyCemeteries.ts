import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchNearbyCemeteries } from '@/lib/api/cemeteries';

export function useNearbyCemeteries(
  lat: number | undefined,
  lng: number | undefined,
  radiusKm: number = 50,
) {
  return useQuery({
    queryKey: queryKeys.cemeteries.nearby(lat!, lng!, radiusKm),
    queryFn: () => fetchNearbyCemeteries(lat!, lng!, radiusKm),
    enabled: lat != null && lng != null,
  });
}
