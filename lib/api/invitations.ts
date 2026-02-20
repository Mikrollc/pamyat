import { supabase } from '@/lib/supabase';
import type { GraveRole } from '@/types/database';

export async function createInvitation(
  graveId: string,
  invitedBy: string,
  recipient: string,
  role: GraveRole = 'viewer',
) {
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      grave_id: graveId,
      invited_by: invitedBy,
      channel: 'sms' as const,
      recipient,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchInvitationsByGrave(graveId: string) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, grave:graves(person_name)')
    .eq('grave_id', graveId)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function revokeInvitation(invitationId: string) {
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'revoked' as const })
    .eq('id', invitationId);

  if (error) throw error;
}

export async function fetchReceivedInvitations(phone: string) {
  const normalized = phone.startsWith('+') ? phone : `+${phone}`;

  const { data, error } = await supabase
    .from('invitations')
    .select('*, grave:graves(person_name, slug)')
    .eq('recipient', normalized)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function acceptInvitation(token: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke('accept-invite', {
    body: { token },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
