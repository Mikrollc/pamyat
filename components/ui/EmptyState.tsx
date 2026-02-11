import { View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Typography } from './Typography';
import { colors, spacing } from '@/constants/tokens';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  testID?: string;
}

export function EmptyState({ icon, title, subtitle, children, testID }: EmptyStateProps) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconCircle}>
        <FontAwesome name={icon as never} size={28} color={colors.brand} />
      </View>
      <Typography variant="body" color={colors.textSecondary}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" color={colors.textTertiary}>
          {subtitle}
        </Typography>
      ) : null}
      {children ? <View style={styles.action}>{children}</View> : null}
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
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  action: {
    width: '100%',
    marginTop: spacing.md,
  },
});
