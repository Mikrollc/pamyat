import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Typography, Button, CountryPickerSheet } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { stripPhone } from '@/lib/format-phone';
import { usePhoneInput } from '@/hooks/usePhoneInput';
import { COUNTRIES_BY_CODE } from '@/lib/country-data';
import { colors, spacing, radii, typography as typo } from '@/constants/tokens';

export default function PhoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const pi = usePhoneInput();

  const displayError = serverError || pi.error;
  const countryInfo = COUNTRIES_BY_CODE[pi.country];

  async function handleSendCode() {
    if (!pi.isValid || !pi.e164) {
      setServerError(t('auth.invalidPhone'));
      return;
    }

    setServerError('');
    setLoading(true);

    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: pi.e164 });

    setLoading(false);

    if (otpError) {
      if (__DEV__) console.error('OTP error:', otpError.message, otpError.status);
      if (otpError.message?.includes('fetch') || otpError.status === 0) {
        setServerError(t('auth.networkError'));
      } else {
        setServerError(t('auth.otpSendError'));
      }
      return;
    }

    router.push({ pathname: '/(auth)/otp', params: { phone: pi.e164 } });
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + spacing.md }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        style={styles.backButton}
      >
        <FontAwesome name="arrow-left" size={20} color={colors.brand} />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>{t('auth.enterPhone')}</Text>

        <View style={styles.phoneRow}>
          <Pressable
            style={styles.countryButton}
            onPress={() => pi.setPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('auth.selectCountry')}
          >
            <Typography variant="body">
              {countryInfo?.flag ?? ''} {countryInfo?.dialCode ?? ''}
            </Typography>
          </Pressable>
          <TextInput
            style={styles.phoneInput}
            value={pi.formatted}
            onChangeText={(text) => {
              pi.setNationalNumber(stripPhone(text));
              setServerError('');
            }}
            placeholder={t('auth.phonePlaceholder')}
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
            autoFocus
            testID="phone-input"
          />
        </View>

        {displayError ? (
          <Typography variant="caption" color={colors.destructive}>
            {displayError}
          </Typography>
        ) : null}
      </View>

      <View style={styles.bottom}>
        <Button
          title={t('auth.sendCode')}
          icon="paper-plane"
          onPress={handleSendCode}
          loading={loading}
          disabled={!pi.isValid}
        />
      </View>

      <CountryPickerSheet
        visible={pi.pickerOpen}
        onSelect={(c) => pi.setCountry(c.code)}
        onClose={() => pi.setPickerOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  backButton: {
    padding: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: 'CormorantGaramond-SemiBold',
    fontSize: 28,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 34,
  },
  content: {
    flex: 1,
    gap: spacing.md,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  countryButton: {
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
