import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/tokens';
import { InviteBanner } from '@/components/invite/InviteBanner';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarLabelStyle: { fontSize: 12 },
        }}
      >
        <Tabs.Screen
          name="map/index"
          options={{
            title: t('tabs.map'),
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="map-marker" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="graves/index"
          options={{
            title: t('tabs.myGraves'),
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="heart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications/index"
          options={{
            title: t('tabs.notifications'),
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="bell" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="user" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <InviteBanner />
    </>
  );
}
