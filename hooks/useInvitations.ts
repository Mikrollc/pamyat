import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  createInvitation,
  fetchInvitationsByGrave,
  revokeInvitation,
  fetchReceivedInvitations,
  acceptInvitation,
} from '@/lib/api/invitations';
import type { GraveRole } from '@/types/database';

export function useGraveInvitations(graveId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invitations.byGrave(graveId ?? ''),
    queryFn: () => fetchInvitationsByGrave(graveId!),
    enabled: !!graveId,
  });
}

export function useCreateInvitation(graveId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invitedBy,
      recipient,
      role,
    }: {
      invitedBy: string;
      recipient: string;
      role?: GraveRole;
    }) => createInvitation(graveId, invitedBy, recipient, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.byGrave(graveId) });
    },
  });
}

export function useRevokeInvitation(graveId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => revokeInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.byGrave(graveId) });
    },
  });
}

export function useReceivedInvitations(phone: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.invitations.received(phone ?? ''),
    queryFn: () => fetchReceivedInvitations(phone!),
    enabled: !!phone,
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.graves.all });
    },
  });
}
