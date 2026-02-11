import { View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Typography } from './Typography';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/constants/tokens';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  testID?: string;
}

export function ErrorState({ message, onRetry, testID }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconCircle}>
        <FontAwesome name="exclamation-circle" size={28} color={colors.destructive} />
      </View>
      <Typography variant="body" color={colors.textSecondary}>
        {message ?? t('common.error')}
      </Typography>
      {onRetry ? (
        <View style={styles.action}>
          <Button
            variant="secondary"
            title={t('common.retry')}
            icon="refresh"
            onPress={onRetry}
            testID={testID ? `${testID}-retry` : undefined}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  action: {
    marginTop: spacing.md,
  },
});
