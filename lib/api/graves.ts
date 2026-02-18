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
  // Insert without .select() — the AFTER INSERT trigger creates the
  // grave_member row needed by the SELECT RLS policy, but it may not
  // be visible in the same statement. So we insert first, then fetch.
  const { error: insertError } = await supabase
    .from('graves')
    .insert(data);

  if (insertError) throw insertError;

  // Fetch the newly created grave by slug (unique, just created)
  const { data: grave, error: fetchError } = await supabase
    .from('graves')
    .select()
    .eq('slug', data.slug)
    .single();

  if (fetchError) throw fetchError;
  return grave;
}

export async function generateSlug(
  name: string,
  birthYear?: number | null,
  deathYear?: number | null,
): Promise<string> {
  const { data, error } = await supabase.rpc('generate_grave_slug', {
    p_name: name,
    p_birth_year: birthYear ?? null,
    p_death_year: deathYear ?? null,
  });

  if (error) throw error;
  return data;
}

export async function updateGraveCoverPhoto(graveId: string, storagePath: string) {
  const { error } = await supabase
    .from('graves')
    .update({ cover_photo_path: storagePath })
    .eq('id', graveId);

  if (error) throw error;
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

export interface MapGrave {
  id: string;
  slug: string;
  person_name: string;
  lat: number;
  lng: number;
}

export async function fetchMapGraves(): Promise<MapGrave[]> {
  const { data, error } = await supabase.rpc('map_graves');
  if (error) throw error;
  return data as MapGrave[];
}

export async function fetchGraveById(id: string) {
  const { data, error } = await supabase
    .from('graves')
    .select('*, cemetery:cemeteries(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function softDeleteGrave(id: string) {
  const { error } = await supabase.rpc('soft_delete_grave', { p_grave_id: id });
  if (error) throw error;
}

export async function fetchGraveMembership(graveId: string, userId: string) {
  const { data, error } = await supabase
    .from('grave_members')
    .select('role, relationship')
    .eq('grave_id', graveId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
