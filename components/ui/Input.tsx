import { View, TextInput, StyleSheet, type KeyboardTypeOptions } from 'react-native';
import { Typography } from './Typography';
import { colors, spacing, radii, typography as typo } from '@/constants/tokens';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  testID?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  testID,
}: InputProps) {
  return (
    <View style={styles.wrapper}>
      <Typography variant="bodySmall" color={colors.textSecondary}>
        {label}
      </Typography>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCorrect={false}
        testID={testID}
        style={[styles.input, error ? styles.inputError : undefined]}
      />
      {error ? (
        <Typography variant="caption" color={colors.destructive} testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  input: {
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
  inputError: {
    borderColor: colors.destructive,
  },
});
