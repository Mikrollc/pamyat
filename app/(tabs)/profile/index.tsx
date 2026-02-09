import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { spacing } from '@/constants/tokens';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Typography variant="h2">{t('tabs.profile')}</Typography>
      <View style={styles.signOut}>
        <Button
          variant="destructive"
          title={t('profile.signOut')}
          icon="sign-out"
          onPress={() => supabase.auth.signOut()}
          testID="sign-out-button"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  signOut: { marginTop: spacing.xxl, width: '100%' },
});
