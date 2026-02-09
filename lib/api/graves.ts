import { supabase } from '@/lib/supabase';
import type { GraveInsert, GraveUpdate } from '@/types/database';

export async function fetchGrave(slug: string) {
  const { data, error } = await supabase
    .from('graves')
    .select('*, cemetery:cemeteries(*)')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchGravesByUser(userId: string) {
  const { data, error } = await supabase
    .from('grave_members')
    .select('grave:graves(*, cemetery:cemeteries(*))')
    .eq('user_id', userId);

  if (error) throw error;

  return data
    .map((row) => row.grave)
    .filter((g): g is NonNullable<typeof g> => g !== null && g.deleted_at === null);
}

export async function createGrave(data: GraveInsert) {
  const { data: grave, error } = await supabase
    .from('graves')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return grave;
}

export async function updateGrave(id: string, data: GraveUpdate) {
  const { data: grave, error } = await supabase
    .from('graves')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return grave;
}
