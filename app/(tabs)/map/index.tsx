import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/tokens';

export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Typography variant="body" color={colors.textTertiary}>
        {t('tabs.map')}
      </Typography>
      <View style={styles.button}>
        <Button
          variant="brand"
          title={t('map.addGrave')}
          onPress={() => router.push('/add-grave')}
          testID="add-grave-button"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  button: { paddingHorizontal: spacing.xxl, width: '100%' },
});
