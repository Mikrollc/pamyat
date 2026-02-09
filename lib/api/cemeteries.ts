import { supabase } from '@/lib/supabase';

export interface MapCemetery {
  id: string;
  name: string;
  name_ru: string | null;
  city: string | null;
  state: string | null;
  lat: number;
  lng: number;
}

export async function fetchAllCemeteries(): Promise<MapCemetery[]> {
  const { data, error } = await supabase.rpc('all_cemeteries');
  if (error) throw error;
  return data as MapCemetery[];
}

export interface CemeterySearchResult {
  id: string;
  name: string;
  name_ru: string | null;
  city: string | null;
  state: string | null;
  location: unknown;
}

export async function searchCemeteries(query: string): Promise<CemeterySearchResult[]> {
  const pattern = `%${query}%`;
  const { data, error } = await supabase
    .from('cemeteries')
    .select('id, name, name_ru, city, state, location')
    .or(`name.ilike.${pattern},name_ru.ilike.${pattern}`)
    .limit(20);

  if (error) throw error;
  return data;
}

export async function fetchNearbyCemeteries(
  lat: number,
  lng: number,
  radiusKm: number,
) {
  const { data, error } = await supabase.rpc('nearby_cemeteries', {
    lat,
    lng,
    radius_m: radiusKm * 1000,
  });

  if (error) throw error;
  return data;
}

export async function findOrCreateCemetery(
  name: string,
  lat: number,
  lng: number,
  userId: string,
): Promise<string> {
  // Try to find existing cemetery by name (case-insensitive)
  const { data: existing } = await supabase
    .from('cemeteries')
    .select('id')
    .ilike('name', name)
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  // Create new cemetery
  const { data: created, error } = await supabase
    .from('cemeteries')
    .insert({
      name,
      location: `POINT(${lng} ${lat})`,
      created_by: userId,
    })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}
