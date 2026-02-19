import { Pressable, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors, radii, spacing, typography, buttonHeight } from '@/constants/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'destructive' | 'brand';

interface ButtonProps {
  variant?: ButtonVariant;
  title: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

const variantColors = {
  primary: { bg: colors.primary, pressed: colors.primaryPressed, text: colors.white },
  secondary: { bg: colors.backgroundSecondary, pressed: colors.border, text: colors.textPrimary },
  accent: { bg: colors.accent, pressed: colors.accentPressed, text: colors.white },
  destructive: { bg: colors.destructive, pressed: colors.destructivePressed, text: colors.white },
  brand: { bg: colors.brand, pressed: colors.primaryPressed, text: colors.white },
} as const;

export function Button({
  variant = 'primary',
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  testID,
  style,
}: ButtonProps) {
  const scheme = variantColors[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? scheme.pressed : scheme.bg,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={scheme.text} testID={testID ? `${testID}-loader` : undefined} />
      ) : (
        <View style={styles.content}>
          {icon && <FontAwesome name={icon} size={16} color={scheme.text} />}
          <Text style={[styles.text, { color: scheme.text }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: buttonHeight.md,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    lineHeight: typography.button.lineHeight,
  },
});
