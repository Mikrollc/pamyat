import { useState } from 'react';
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Typography, Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { colors, spacing, radii, typography as typo } from '@/constants/tokens';

function stripPhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

export default function PhoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const digits = stripPhone(phone);
  const isValid = digits.length === 10;

  async function handleSendCode() {
    if (!isValid) {
      setError(t('auth.invalidPhone'));
      return;
    }

    setError('');
    setLoading(true);

    const fullPhone = `+1${digits}`;
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: fullPhone });

    setLoading(false);

    if (otpError) {
      setError(t('auth.networkError'));
      return;
    }

    router.push({ pathname: '/(auth)/otp', params: { phone: fullPhone } });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Typography variant="h2">{t('auth.enterPhone')}</Typography>

        <View style={styles.phoneRow}>
          <View style={styles.countryCode}>
            <Typography variant="body">+1</Typography>
          </View>
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setError('');
            }}
            placeholder="(555) 123-4567"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
            autoFocus
            testID="phone-input"
          />
        </View>

        {error ? (
          <Typography variant="caption" color={colors.destructive}>
            {error}
          </Typography>
        ) : null}
      </View>

      <View style={styles.bottom}>
        <Button
          title={t('auth.sendCode')}
          onPress={handleSendCode}
          loading={loading}
          disabled={!isValid}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: 120,
  },
  content: {
    flex: 1,
    gap: spacing.md,
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
  bottom: {
    paddingBottom: spacing.xxl,
  },
});
