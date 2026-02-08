import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function AuthScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>{t('auth.welcome')}</Text>
        <Text style={styles.tagline}>{t('auth.tagline')}</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{t('auth.continueWithPhone')}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{t('auth.signInGoogle')}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{t('auth.signInApple')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24, paddingTop: 120 },
  hero: { alignItems: 'center' },
  title: { fontSize: 36, fontWeight: '700', marginBottom: 8 },
  tagline: { fontSize: 18, color: '#666' },
  buttons: { gap: 12, paddingBottom: 48 },
  primaryButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  secondaryButton: {
    backgroundColor: '#f2f2f7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  secondaryButtonText: { fontSize: 17, fontWeight: '500' },
});
