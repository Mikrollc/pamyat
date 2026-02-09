import { Link, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/tokens';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Typography variant="h2">Page not found</Typography>
        <Link href="/(tabs)/map" style={styles.link}>
          <Typography variant="body" color={colors.brand}>Go to map</Typography>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  link: { marginTop: spacing.md, paddingVertical: spacing.md },
});
