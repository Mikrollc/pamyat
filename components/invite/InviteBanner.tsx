import { useState } from 'react';
import { View, Modal, Pressable, Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useSession, useProfile, useReceivedInvitations, useAcceptInvitation } from '@/hooks';
import { colors, spacing, radii } from '@/constants/tokens';

export function InviteBanner() {
  const { t } = useTranslation();
  const session = useSession();
  const { data: profile } = useProfile(session?.user?.id);
  const { data: invitations } = useReceivedInvitations(profile?.phone);
  const acceptInvite = useAcceptInvitation();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const activeInvite = invitations?.find((inv) => !dismissedIds.has(inv.id));

  if (!activeInvite) return null;

  const personName = activeInvite.grave?.person_name ?? '';

  function handleAccept() {
    acceptInvite.mutate(activeInvite!.token, {
      onSuccess: () => {
        setDismissedIds((prev) => new Set(prev).add(activeInvite!.id));
      },
      onError: () => {
        Alert.alert('', t('invite.acceptError'));
      },
    });
  }

  function handleDismiss() {
    setDismissedIds((prev) => new Set(prev).add(activeInvite!.id));
  }

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <FontAwesome name="envelope-open" size={24} color={colors.brand} />
            </View>
          </View>

          <Typography variant="h2">{t('invite.bannerTitle')}</Typography>
          <Typography variant="body" color={colors.textSecondary}>
            {t('invite.bannerMessage', { name: '', person: personName })}
          </Typography>

          <View style={styles.actions}>
            <Button
              variant="brand"
              title={t('invite.accept')}
              icon="check"
              onPress={handleAccept}
              loading={acceptInvite.isPending}
              testID="invite-accept"
            />
            <Button
              variant="secondary"
              title={t('invite.dismiss')}
              onPress={handleDismiss}
              testID="invite-dismiss"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: radii.lg,
    padding: spacing.xl,
    width: '100%',
    gap: spacing.sm,
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
