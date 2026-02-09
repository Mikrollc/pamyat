import { supabase } from '@/lib/supabase';

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
