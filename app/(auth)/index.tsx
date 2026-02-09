import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Typography, Button } from '@/components/ui';
import { colors, spacing } from '@/constants/tokens';

export default function AuthScreen() {
  const { t } = useTranslation();

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
        <Button title={t('auth.continueWithPhone')} onPress={() => {}} />
        <Button title={t('auth.signInGoogle')} variant="secondary" onPress={() => {}} />
        <Button title={t('auth.signInApple')} variant="secondary" onPress={() => {}} />
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
