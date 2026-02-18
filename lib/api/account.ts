import { supabase } from '@/lib/supabase';

export async function deleteAccount() {
  const { data, error } = await supabase.functions.invoke('delete-user');

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
}
