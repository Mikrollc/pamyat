import { View, StyleSheet, Pressable } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Typography, Button } from '@/components/ui';
import { colors, spacing } from '@/constants/tokens';

const PRIVACY_URL = 'https://raduna.app/privacy';
const TERMS_URL = 'https://raduna.app/terms';

export default function AuthScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Typography variant="h1" align="center">
          {t('auth.welcome')}
        </Typography>
        <Typography variant="body" color={colors.textSecondary} align="center">
          {t('auth.tagline')}
        </Typography>
      </View>

      <View style={styles.bottom}>
        <View style={styles.buttons}>
          <Button title={t('auth.continueWithPhone')} icon="phone" onPress={() => router.push('/(auth)/phone')} />
          <Button title={t('auth.signInGoogle')} icon="google" variant="secondary" disabled onPress={() => {}} />
          <Button title={t('auth.signInApple')} icon="apple" variant="secondary" disabled onPress={() => {}} />
        </View>
        <View style={styles.legal}>
          <Typography variant="caption" color={colors.textTertiary} align="center">
            {t('auth.legalNotice')}{' '}
          </Typography>
          <View style={styles.legalLinks}>
            <Pressable onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}>
              <Typography variant="caption" color={colors.brand}>
                {t('profile.privacyPolicy')}
              </Typography>
            </Pressable>
            <Typography variant="caption" color={colors.textTertiary}>
              {' '}{t('auth.and')}{' '}
            </Typography>
            <Pressable onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}>
              <Typography variant="caption" color={colors.brand}>
                {t('profile.termsOfService')}
              </Typography>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingTop: 120,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  bottom: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  buttons: {
    gap: spacing.sm + spacing.xs,
  },
  legal: {
    alignItems: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
