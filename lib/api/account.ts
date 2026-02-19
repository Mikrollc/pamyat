import { supabase } from '@/lib/supabase';

export async function deleteAccount() {
  const { data: { session } } = await supabase.auth.getSession();

  const { data, error } = await supabase.functions.invoke('delete-user', {
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
}
