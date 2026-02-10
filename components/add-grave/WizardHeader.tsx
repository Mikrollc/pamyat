import { View, Pressable, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from './ProgressBar';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/constants/tokens';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface WizardHeaderProps {
  step: number;
  totalSteps?: number;
  title: string;
  onClose: () => void;
  testID?: string;
}

export function WizardHeader({ step, totalSteps = 4, title, onClose, testID }: WizardHeaderProps) {
  const { t } = useTranslation();

  return (
    <View testID={testID}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.titleGroup}>
            <Typography variant="button">
              {title}
            </Typography>
            <Typography variant="caption" color={colors.textTertiary}>
              {t('addGrave.stepOf', { current: step, total: totalSteps })}
            </Typography>
          </View>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            testID={testID ? `${testID}-close` : undefined}
          >
            <FontAwesome name="times" size={15} color="#666" />
          </Pressable>
        </View>
      </View>
      <View style={styles.progressWrapper}>
        <ProgressBar step={step} totalSteps={totalSteps} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flex: 1,
  },
  progressWrapper: {
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
