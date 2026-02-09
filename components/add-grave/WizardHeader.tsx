import { View, Pressable, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from './ProgressBar';
import { colors, spacing } from '@/constants/tokens';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface WizardHeaderProps {
  step: 1 | 2 | 3;
  title: string;
  onClose: () => void;
  testID?: string;
}

export function WizardHeader({ step, title, onClose, testID }: WizardHeaderProps) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.topRow}>
        <Pressable
          onPress={onClose}
          hitSlop={12}
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
