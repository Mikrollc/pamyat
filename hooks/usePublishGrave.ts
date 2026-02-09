import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createGrave, generateSlug, uploadGravePhoto, updateGraveCoverPhoto, findOrCreateCemetery } from '@/lib/api';
import { transliterate } from '@/lib/transliterate';
import { supabase } from '@/lib/supabase';
import type { PartialDate } from '@/stores/add-grave-store';

interface PublishParams {
  latitude: number;
  longitude: number;
  firstName: string;
  lastName: string;
  birthDate: PartialDate;
  deathDate: PartialDate;
  cemeteryName: string;
  cemeteryId: string | null;
  photoUri: string | null;
  inscription: string;
}

export function usePublishGrave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: PublishParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fullName = `${params.firstName} ${params.lastName}`.trim();
      const transliteratedName = transliterate(fullName);

      // 1. Generate slug server-side
      const slug = await generateSlug(
        transliteratedName,
        params.birthDate.unknown ? null : params.birthDate.year,
        params.deathDate.unknown ? null : params.deathDate.year,
      );

      // 2. Use provided cemeteryId, or find/create cemetery by name
      let cemeteryId: string | null = params.cemeteryId;
      if (!cemeteryId && params.cemeteryName.trim()) {
        cemeteryId = await findOrCreateCemetery(
          params.cemeteryName.trim(),
          params.latitude,
          params.longitude,
          user.id,
        );
      }

      // 3. Create grave (trigger auto-creates grave_member)
      const grave = await createGrave({
        location: `POINT(${params.longitude} ${params.latitude})`,
        person_name: fullName,
        slug,
        created_by: user.id,
        cemetery_id: cemeteryId,
        birth_year: params.birthDate.unknown ? null : params.birthDate.year,
        birth_month: params.birthDate.unknown ? null : params.birthDate.month,
        birth_day: params.birthDate.unknown ? null : params.birthDate.day,
        death_year: params.deathDate.unknown ? null : params.deathDate.year,
        death_month: params.deathDate.unknown ? null : params.deathDate.month,
        death_day: params.deathDate.unknown ? null : params.deathDate.day,
        inscription: params.inscription || null,
      });

      // 4. Upload photo if provided (RLS requires grave_member to exist first)
      if (params.photoUri) {
        const storagePath = await uploadGravePhoto(grave.id, params.photoUri, user.id);
        await updateGraveCoverPhoto(grave.id, storagePath);
      }

      return grave;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.graves.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.graves.map });
    },
  });
}
