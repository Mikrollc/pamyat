import { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  useSession,
  useProfile,
  useReceivedInvitations,
  useAcceptInvitation,
} from '@/hooks';
import { colors, spacing } from '@/constants/tokens';

export function PendingInvitations() {
  const { t } = useTranslation();
  const session = useSession();
  const { data: profile } = useProfile(session?.user?.id);
  const { data: invitations } = useReceivedInvitations(profile?.phone);
  const acceptInvite = useAcceptInvitation();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const visible = invitations?.filter((inv) => !dismissedIds.has(inv.id));

  if (!visible?.length) return null;

  function handleAccept(id: string, token: string) {
    setAcceptingId(id);
    acceptInvite.mutate(token, {
      onSuccess: () => {
        setDismissedIds((prev) => new Set(prev).add(id));
        setAcceptingId(null);
      },
      onError: () => {
        setAcceptingId(null);
        Alert.alert('', t('invite.acceptError'));
      },
    });
  }

  function handleDismiss(id: string) {
    setDismissedIds((prev) => new Set(prev).add(id));
  }

  return (
    <View style={styles.section}>
      <Typography variant="body" color={colors.textSecondary}>
        {t('invite.pendingInvites')}
      </Typography>

      {visible.map((inv) => {
        const personName = inv.grave?.person_name ?? '';
        const isAccepting = acceptingId === inv.id;

        return (
          <Card key={inv.id} style={styles.card} testID={`invitation-${inv.id}`}>
            <View style={styles.row}>
              <View style={styles.iconCircle}>
                <FontAwesome name="envelope-open" size={18} color={colors.brand} />
              </View>
              <View style={styles.info}>
                <Typography variant="body" numberOfLines={1}>
                  {personName}
                </Typography>
                <Typography variant="caption" color={colors.textTertiary}>
                  {t('invite.receivedSubtitle')}
                </Typography>
              </View>
            </View>
            <View style={styles.actions}>
              <Button
                variant="brand"
                title={t('invite.accept')}
                icon="check"
                onPress={() => handleAccept(inv.id, inv.token)}
                loading={isAccepting}
                disabled={acceptingId !== null && !isAccepting}
                style={styles.actionButton}
                testID={`invitation-accept-${inv.id}`}
              />
              <Button
                variant="secondary"
                title={t('invite.dismiss')}
                onPress={() => handleDismiss(inv.id)}
                disabled={isAccepting}
                style={styles.actionButton}
                testID={`invitation-dismiss-${inv.id}`}
              />
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
});
