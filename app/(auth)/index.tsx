import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Typography, Button } from '@/components/ui';
import { colors, spacing } from '@/constants/tokens';

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

      <View style={styles.buttons}>
        <Button title={t('auth.continueWithPhone')} icon="phone" onPress={() => router.push('/(auth)/phone')} />
        <Button title={t('auth.signInGoogle')} icon="google" variant="secondary" disabled onPress={() => {}} />
        <Button title={t('auth.signInApple')} icon="apple" variant="secondary" disabled onPress={() => {}} />
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
  buttons: {
    gap: spacing.sm + spacing.xs,
    paddingBottom: spacing.xxl,
  },
});
