import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function GravesScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('graves.empty')}</Text>
      <Text style={styles.subtitle}>{t('graves.addFirst')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#999' },
});
