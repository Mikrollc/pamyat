import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { Button } from './Button';
import { colors, spacing, radii } from '@/constants/tokens';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  confirmVariant?: 'destructive' | 'brand' | 'primary';
  confirmIcon?: React.ComponentProps<typeof Button>['icon'];
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  cancelLabel,
  confirmLabel,
  confirmVariant = 'destructive',
  confirmIcon,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Typography variant="h2">{title}</Typography>
          <Typography variant="body" color={colors.textSecondary}>
            {message}
          </Typography>
          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <Button variant="secondary" title={cancelLabel} onPress={onCancel} />
            </View>
            <View style={styles.actionButton}>
              <Button
                variant={confirmVariant}
                title={confirmLabel}
                icon={confirmIcon}
                loading={loading}
                onPress={onConfirm}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
