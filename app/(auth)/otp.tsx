import { useState, useRef, useEffect, useCallback } from 'react';
import { View, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Typography, Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/lib/api/profiles';
import { colors, spacing, radii } from '@/constants/tokens';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function OtpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Typography variant="h2">{t('auth.enterCode')}</Typography>
        <Typography variant="body" color={colors.textSecondary}>
          {phone}
        </Typography>

        <Pressable style={styles.codeRow} onPress={() => hiddenInput.current?.focus()}>
          {Array.from({ length: CODE_LENGTH }, (_, i) => (
            <View
              key={i}
              style={[
                styles.codeBox,
                error ? styles.codeBoxError : undefined,
                i === code.length && styles.codeBoxFocused,
              ]}
            >
              <Typography variant="h2">{digits[i] ?? ''}</Typography>
            </View>
          ))}
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

        {error ? (
          <Typography variant="caption" color={colors.destructive}>
            {error}
          </Typography>
        ) : null}

        {loading ? (
          <Typography variant="bodySmall" color={colors.textSecondary}>
            {t('common.loading')}
          </Typography>
        ) : null}
      </View>

      <View style={styles.bottom}>
        <Button
          title={countdown > 0 ? t('auth.resendIn', { seconds: countdown }) : t('auth.resend')}
          variant="secondary"
          icon="refresh"
          onPress={handleResend}
          disabled={countdown > 0}
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
  codeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxError: {
    borderColor: colors.destructive,
  },
  codeBoxFocused: {
    borderColor: colors.primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  bottom: {
    paddingBottom: spacing.xxl,
  },
});
