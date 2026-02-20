import { useState } from 'react';
import {
  View,
  Modal,
  Pressable,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useGraveInvitations, useCreateInvitation, useRevokeInvitation } from '@/hooks';
import { formatUSPhone, stripPhone } from '@/lib/format-phone';
import { colors, spacing, radii, typography as typo } from '@/constants/tokens';
import type { InviteStatus } from '@/types/database';

interface InviteFamilySheetProps {
  visible: boolean;
  graveId: string;
  userId: string;
  onClose: () => void;
}

const STATUS_COLORS: Record<InviteStatus, string> = {
  pending: colors.accent,
  accepted: colors.primary,
  expired: colors.textTertiary,
  revoked: colors.destructive,
};

export function InviteFamilySheet({ visible, graveId, userId, onClose }: InviteFamilySheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const { data: invitations } = useGraveInvitations(visible ? graveId : undefined);
  const createInvite = useCreateInvitation(graveId);
  const revokeInvite = useRevokeInvitation(graveId);

  const digits = stripPhone(phone);
  const isValid = digits.length === 10;

  function handleSend() {
    if (!isValid) {
      setError(t('invite.invalidPhone'));
      return;
    }

    setError('');
    const fullPhone = `+1${digits}`;

    createInvite.mutate(
      { invitedBy: userId, recipient: fullPhone, role: 'viewer' },
      {
        onSuccess: () => {
          setPhone('');
        },
        onError: () => {
          setError(t('invite.sendError'));
        },
      },
    );
  }

  function handleRevoke(invitationId: string) {
    Alert.alert('', t('invite.revokeConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('invite.revoke'),
        style: 'destructive',
        onPress: () => {
          revokeInvite.mutate(invitationId, {
            onError: () => Alert.alert('', t('invite.revokeError')),
          });
        },
      },
    ]);
  }

  function handleClose() {
    setPhone('');
    setError('');
    onClose();
  }

  const pendingInvites = invitations?.filter((inv) => inv.status === 'pending') ?? [];

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
          onPress={() => {}}
        >
          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h2">{t('invite.title')}</Typography>
            <Pressable onPress={handleClose} hitSlop={12} accessibilityRole="button">
              <FontAwesome name="times" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Phone input */}
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Typography variant="body">+1</Typography>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={formatUSPhone(phone)}
              onChangeText={(text) => {
                setPhone(stripPhone(text));
                setError('');
              }}
              placeholder={t('invite.phonePlaceholder')}
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              maxLength={14}
              testID="invite-phone-input"
            />
          </View>

          {error ? (
            <Typography variant="caption" color={colors.destructive}>
              {error}
            </Typography>
          ) : null}

          <Button
            title={createInvite.isPending ? t('invite.sending') : t('invite.send')}
            icon="paper-plane"
            onPress={handleSend}
            disabled={!isValid}
            loading={createInvite.isPending}
            testID="invite-send-button"
          />

          {/* Pending invites list */}
          {pendingInvites.length > 0 && (
            <View style={styles.listSection}>
              <Typography variant="bodySmall" color={colors.textSecondary}>
                {t('invite.pendingInvites')}
              </Typography>
              <FlatList
                data={pendingInvites}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.inviteRow}>
                    <View style={styles.inviteInfo}>
                      <Typography variant="body">{item.recipient}</Typography>
                      <Typography variant="caption" color={STATUS_COLORS[item.status]}>
                        {t(`invite.${item.status}`)}
                      </Typography>
                    </View>
                    {item.status === 'pending' && (
                      <Pressable
                        onPress={() => handleRevoke(item.id)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t('invite.revoke')}
                        testID={`invite-revoke-${item.id}`}
                      >
                        <FontAwesome name="times-circle" size={20} color={colors.destructive} />
                      </Pressable>
                    )}
                  </View>
                )}
              />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  countryCode: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    fontSize: typo.body.fontSize,
    fontWeight: typo.body.fontWeight,
    lineHeight: typo.body.lineHeight,
    color: colors.textPrimary,
  },
  listSection: {
    gap: spacing.sm,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inviteInfo: {
    flex: 1,
    gap: spacing.xs,
  },
});
