import { View, Pressable, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from './ProgressBar';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/constants/tokens';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface WizardHeaderProps {
  step: 1 | 2 | 3;
  title: string;
  onClose: () => void;
  testID?: string;
}

export function WizardHeader({ step, title, onClose, testID }: WizardHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.topRow}>
        <Pressable
          onPress={onClose}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel="Close"
          testID={testID ? `${testID}-close` : undefined}
        >
          <FontAwesome name="times" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.title}>
          <Typography variant="body" align="center">
            {title}
          </Typography>
          <Typography variant="caption" color={colors.textTertiary} align="center">
            {t('addGrave.stepOf', { current: step, total: 3 })}
          </Typography>
        </View>
        <View style={styles.placeholder} />
      </View>
      <ProgressBar step={step} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  placeholder: {
    width: 22,
  },
});
