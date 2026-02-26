import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Svg, { Rect, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Typography, Button } from '@/components/ui';
import { colors, spacing } from '@/constants/tokens';

const PRIVACY_URL = 'https://raduna.app/privacy';
const TERMS_URL = 'https://raduna.app/terms';

function BrandLogo() {
  return (
    <Svg width={72} height={72} viewBox="0 0 200 200" fill="none">
      <Defs>
        <LinearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.splash.gradientStart} />
          <Stop offset="1" stopColor={colors.splash.gradientEnd} />
        </LinearGradient>
      </Defs>
      <Rect width={200} height={200} rx={44} fill="url(#brandGrad)" />
      <Path
        d="M100 30 C68 30 44 56 44 88 C44 124 100 172 100 172 C100 172 156 124 156 88 C156 56 132 30 100 30Z"
        fill={colors.white}
        opacity={0.95}
      />
      <Path
        d="M100 76 C100 76 82 62 74 72 C66 82 74 96 100 116 C126 96 134 82 126 72 C118 62 100 76 100 76Z"
        fill={colors.brand}
      />
    </Svg>
  );
}

export default function AuthScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <BrandLogo />
        <Text style={styles.appName}>{t('auth.welcome')}</Text>
        <View style={styles.taglines}>
          <Text style={styles.taglineEn}>{t('auth.taglineEn')}</Text>
          <Text style={styles.taglineRu}>{t('auth.taglineRu')}</Text>
        </View>
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
  appName: {
    fontFamily: 'CormorantGaramond-SemiBold',
    fontSize: 42,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 1,
    marginTop: spacing.md,
  },
  taglines: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  taglineEn: {
    fontFamily: 'DMSans-Medium',
    fontSize: 17,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 22,
  },
  taglineRu: {
    fontFamily: 'DMSans-Medium',
    fontSize: 17,
    fontWeight: '500',
    color: colors.textTertiary,
    lineHeight: 22,
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
