import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchProfile, updateProfile } from '@/lib/api/profiles';
import type { Database } from '@/types/database';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profiles.byId(userId!),
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileUpdate) => updateProfile(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.byId(userId) });
    },
  });
}
