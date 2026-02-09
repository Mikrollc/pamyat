import { supabase } from '@/lib/supabase';
import type { GravePhotoInsert } from '@/types/database';

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'webp'];

export async function uploadGravePhoto(
  graveId: string,
  localUri: string,
  userId: string,
): Promise<string> {
  const rawExt = (localUri.split('.').pop() ?? '').toLowerCase();
  const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : 'jpg';
  const storagePath = `${graveId}/${Date.now()}.${ext}`;

  const response = await fetch(localUri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('grave-photos')
    .upload(storagePath, blob, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` });

  if (uploadError) throw uploadError;

  const photoRow: GravePhotoInsert = {
    grave_id: graveId,
    storage_path: storagePath,
    uploaded_by: userId,
  };

  const { error: insertError } = await supabase
    .from('grave_photos')
    .insert(photoRow);

  if (insertError) throw insertError;

  return storagePath;
}

export function getGravePhotoUrl(storagePath: string): string {
  const { data } = supabase.storage.from('grave-photos').getPublicUrl(storagePath);
  return data.publicUrl;
}
