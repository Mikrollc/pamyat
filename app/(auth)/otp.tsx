import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Typography } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/lib/api/profiles';
import { formatPhoneDisplay } from '@/lib/format-phone';
import { colors, spacing, radii } from '@/constants/tokens';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function OtpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const hiddenInput = useRef<TextInput>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const verify = useCallback(
    async (token: string) => {
      setLoading(true);
      setError('');

      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: phone!,
        token,
        type: 'sms',
      });

      setLoading(false);

      if (verifyError) {
        const msg = verifyError.message.toLowerCase();
        if (msg.includes('expired')) {
          setError(t('auth.codeExpired'));
        } else if (msg.includes('network') || msg.includes('fetch')) {
          setError(t('auth.networkError'));
        } else {
          setError(t('auth.wrongCode'));
        }
        return;
      }

      // Navigate directly after successful verification
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const profile = await fetchProfile(session.user.id);
          if (!profile.display_name) {
            router.replace('/(auth)/name-setup');
          } else {
            router.replace('/(tabs)/map');
          }
        } catch {
          router.replace('/(tabs)/map');
        }
      }
    },
    [phone, t, router],
  );

  function handleChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError('');

    if (digits.length === CODE_LENGTH) {
      verify(digits);
    }
  }

  async function handleResend() {
    setError('');
    setCode('');
    setCountdown(RESEND_SECONDS);
    const { error: resendError } = await supabase.auth.signInWithOtp({ phone: phone! });
    if (resendError) {
      setError(t('auth.networkError'));
    }
  }

  const digits = code.split('');

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
        <Text style={styles.title}>{t('auth.enterCode')}</Text>
        <Typography variant="body" color={colors.textSecondary}>
          {formatPhoneDisplay(phone ?? '')}
        </Typography>

        <Pressable style={styles.codeRow} onPress={() => hiddenInput.current?.focus()}>
          {Array.from({ length: CODE_LENGTH }, (_, i) => {
            const isFilled = i < code.length;
            const isCursor = i === code.length;
            return (
              <View
                key={i}
                style={[
                  styles.codeBox,
                  error ? styles.codeBoxError : undefined,
                  isFilled && !error ? styles.codeBoxFilled : undefined,
                  isCursor && !error ? styles.codeBoxFocused : undefined,
                ]}
              >
                <Text style={[styles.codeDigit, isFilled && !error ? styles.codeDigitFilled : undefined]}>
                  {digits[i] ?? ''}
                </Text>
              </View>
            );
          })}
        </Pressable>

        <TextInput
          ref={hiddenInput}
          value={code}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          autoFocus
          caretHidden
          style={styles.hiddenInput}
          testID="otp-input"
        />

        <Typography variant="caption" color={colors.textTertiary} align="center">
          {t('auth.autoSubmitHint')}
        </Typography>

        {error ? (
          <Typography variant="caption" color={colors.destructive} align="center">
            {error}
          </Typography>
        ) : null}

        {loading ? (
          <Typography variant="bodySmall" color={colors.textSecondary} align="center">
            {t('common.loading')}
          </Typography>
        ) : null}
      </View>

      <View style={styles.bottom}>
        {countdown > 0 ? (
          <View style={styles.countdownRow}>
            <Typography variant="bodySmall" color={colors.textTertiary}>
              {t('auth.resendIn', { seconds: countdown })}
            </Typography>
          </View>
        ) : (
          <Pressable onPress={handleResend} style={styles.resendButton}>
            <FontAwesome name="refresh" size={14} color={colors.brand} />
            <Text style={styles.resendText}>{t('auth.resend')}</Text>
          </Pressable>
        )}
      </View>
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
  codeRow: {
    flexDirection: 'row',
    gap: spacing.sm + spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
  codeBoxFilled: {
    borderColor: colors.brand,
    backgroundColor: colors.brandLight,
  },
  codeBoxError: {
    borderColor: colors.destructive,
  },
  codeBoxFocused: {
    borderColor: colors.brand,
  },
  codeDigit: {
    fontFamily: 'DMSans-Medium',
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 29,
  },
  codeDigitFilled: {
    color: colors.brand,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  bottom: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  countdownRow: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  resendText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 17,
    fontWeight: '600',
    color: colors.brand,
  },
});
