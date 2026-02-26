import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Typography, Button, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useUpdateProfile } from '@/hooks/useProfile';
import { colors, spacing, radii } from '@/constants/tokens';

type Locale = 'ru' | 'en';

export default function NameSetupScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [locale, setLocale] = useState<Locale>(i18n.language === 'ru' ? 'ru' : 'en');
  const [error, setError] = useState('');
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session) setSessionUserId(data.session.user.id);
      })
      .catch(() => {
        // Session fetch failed — user will be redirected by auth guard
      });
  }, []);

  const updateProfile = useUpdateProfile(sessionUserId ?? '');

  async function handleGetStarted() {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError(t('auth.invalidPhone')); // reuse min-length concept
      return;
    }

    setError('');

    try {
      await updateProfile.mutateAsync({
        display_name: trimmed,
        locale,
      });
      i18n.changeLanguage(locale);
      router.replace('/(tabs)/map');
    } catch {
      setError(t('common.error'));
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + spacing.md }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Pressable
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)');
        }}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        style={styles.backButton}
      >
        <FontAwesome name="arrow-left" size={20} color={colors.brand} />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>{t('auth.yourName')}</Text>

        <Input
          label={t('auth.yourName')}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError('');
          }}
          maxLength={100}
          error={error}
          testID="name-input"
        />

        <View style={styles.localeSection}>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            {t('auth.chooseLanguage')}
          </Typography>
          <View style={styles.localeRow}>
            <Pressable
              style={[styles.localeChip, locale === 'ru' && styles.localeChipActive]}
              onPress={() => setLocale('ru')}
            >
              <Typography
                variant="body"
                color={locale === 'ru' ? colors.white : colors.textPrimary}
              >
                Русский
              </Typography>
            </Pressable>
            <Pressable
              style={[styles.localeChip, locale === 'en' && styles.localeChipActive]}
              onPress={() => setLocale('en')}
            >
              <Typography
                variant="body"
                color={locale === 'en' ? colors.white : colors.textPrimary}
              >
                English
              </Typography>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <Button
          title={t('auth.getStarted')}
          icon="arrow-right"
          onPress={handleGetStarted}
          loading={updateProfile.isPending}
          disabled={name.trim().length < 2}
        />
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
    gap: spacing.lg,
  },
  localeSection: {
    gap: spacing.sm,
  },
  localeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  localeChip: {
    flex: 1,
    paddingVertical: spacing.sm + spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  localeChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  bottom: {
    paddingBottom: spacing.xxl,
  },
});
