import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function AddGraveScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>{t('addGrave.stepPin')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { fontSize: 18, color: '#999' },
});
