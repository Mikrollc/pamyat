import { ScrollView, View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, radii } from '@/constants/tokens';

const MIT_LICENSE = `MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

const LIBRARIES = [
  { name: 'libphonenumber-js', license: 'MIT', author: 'catamphetamine' },
  { name: 'expo', license: 'MIT', author: 'Expo' },
  { name: 'expo-router', license: 'MIT', author: 'Expo' },
  { name: 'react', license: 'MIT', author: 'Meta Platforms, Inc.' },
  { name: 'react-native', license: 'MIT', author: 'Meta Platforms, Inc.' },
  { name: 'i18next', license: 'MIT', author: 'i18next contributors' },
  { name: 'react-i18next', license: 'MIT', author: 'i18next contributors' },
  { name: '@tanstack/react-query', license: 'MIT', author: 'Tanner Linsley' },
  { name: '@supabase/supabase-js', license: 'MIT', author: 'Supabase' },
  { name: 'zustand', license: 'MIT', author: 'Daishi Kato' },
  { name: '@rnmapbox/maps', license: 'MIT', author: 'RNMapbox contributors' },
  { name: 'react-native-reanimated', license: 'MIT', author: 'Software Mansion' },
  { name: 'react-native-mmkv', license: 'MIT', author: 'Marc Rousavy' },
  { name: 'react-native-svg', license: 'MIT', author: 'react-native-svg contributors' },
  { name: 'react-native-screens', license: 'MIT', author: 'Software Mansion' },
  { name: 'react-native-safe-area-context', license: 'MIT', author: 'Th3rd Wave' },
  { name: '@react-navigation/native', license: 'MIT', author: 'React Navigation contributors' },
  { name: '@react-native-async-storage/async-storage', license: 'MIT', author: 'React Native Community' },
  { name: '@expo/vector-icons', license: 'MIT', author: 'Expo' },
];

export default function LicensesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {LIBRARIES.map((lib) => (
        <View key={lib.name} style={styles.card}>
          <Typography variant="body">{lib.name}</Typography>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            {lib.license} — {lib.author}
          </Typography>
        </View>
      ))}
      <View style={styles.licenseTextCard}>
        <Typography variant="body">MIT License</Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          {MIT_LICENSE}
        </Typography>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  licenseTextCard: {
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
