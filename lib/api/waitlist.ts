import { supabase } from '@/lib/supabase';
import type { WaitlistInsert } from '@/types/database';

export async function joinWaitlist(data: WaitlistInsert) {
  const { data: entry, error } = await supabase
    .from('maintenance_waitlist')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return entry;
}

export async function checkWaitlistStatus(graveId: string, userId: string) {
  const { data, error } = await supabase
    .from('maintenance_waitlist')
    .select('*')
    .eq('grave_id', graveId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
