import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radii, typography, buttonHeight } from '@/constants/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'destructive' | 'brand';

interface ButtonProps {
  variant?: ButtonVariant;
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

const variantColors = {
  primary: { bg: colors.primary, pressed: colors.primaryPressed, text: colors.white },
  secondary: { bg: colors.backgroundSecondary, pressed: colors.border, text: colors.textPrimary },
  accent: { bg: colors.accent, pressed: colors.accentPressed, text: colors.textPrimary },
  destructive: { bg: colors.destructive, pressed: '#cc2f26', text: colors.white },
  brand: { bg: colors.brand, pressed: '#14463f', text: colors.white },
} as const;

export function Button({
  variant = 'primary',
  title,
  onPress,
  loading = false,
  disabled = false,
  testID,
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
      ]}
    >
      {loading ? (
        <ActivityIndicator color={scheme.text} testID={testID ? `${testID}-loader` : undefined} />
      ) : (
        <Text style={[styles.text, { color: scheme.text }]}>{title}</Text>
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
  },
  text: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    lineHeight: typography.button.lineHeight,
  },
});
