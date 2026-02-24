import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/constants/tokens';

export default function ProfileLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="licenses"
        options={{
          headerShown: true,
          title: t('profile.licenses'),
          headerTintColor: colors.brand,
        }}
      />
    </Stack>
  );
}
