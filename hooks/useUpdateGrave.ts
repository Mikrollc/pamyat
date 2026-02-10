import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { updateGrave, updateGraveCoverPhoto, uploadGravePhoto, deleteGravePhoto, findOrCreateCemetery } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { PartialDate } from '@/stores/add-grave-store';

export interface UpdateGraveParams {
  graveId: string;
  firstName: string;
  lastName: string;
  birthDate: PartialDate;
  deathDate: PartialDate;
  cemeteryName: string;
  cemeteryId: string | null;
  cemeteryNameChanged: boolean;
  latitude: number;
  longitude: number;
  plotInfo: string;
  relationship: string | null;
  originalRelationship: string | null;
  inscription: string;
  photoUri: string | null;
  photoChanged: boolean;
  originalPhotoPath: string | null;
}

export function useUpdateGrave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateGraveParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Resolve cemetery if name changed
      let cemeteryId = params.cemeteryId;
      if (params.cemeteryNameChanged && params.cemeteryName.trim()) {
        cemeteryId = await findOrCreateCemetery(
          params.cemeteryName.trim(),
          params.latitude,
          params.longitude,
          user.id,
        );
      }

      // 2. Update grave fields
      const fullName = `${params.firstName} ${params.lastName}`.trim();
      await updateGrave(params.graveId, {
        person_name: fullName,
        cemetery_id: cemeteryId,
        birth_year: params.birthDate.year,
        birth_month: params.birthDate.month,
        birth_day: params.birthDate.day,
        death_year: params.deathDate.year,
        death_month: params.deathDate.month,
        death_day: params.deathDate.day,
        inscription: params.inscription || null,
        plot_info: params.plotInfo || null,
      });

      // 3. Update relationship on grave_member
      if (params.relationship !== params.originalRelationship) {
        const { error: relError } = await supabase
          .from('grave_members')
          .update({ relationship: params.relationship })
          .eq('grave_id', params.graveId)
          .eq('user_id', user.id);
        if (relError) throw relError;
      }

      // 4. Handle photo changes
      if (params.photoChanged) {
        if (params.originalPhotoPath) {
          await deleteGravePhoto(params.graveId, params.originalPhotoPath);
        }
        if (params.photoUri) {
          const storagePath = await uploadGravePhoto(params.graveId, params.photoUri, user.id);
          await updateGraveCoverPhoto(params.graveId, storagePath);
        } else {
          await updateGrave(params.graveId, { cover_photo_path: null });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.graves.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.graves.map });
    },
  });
}
