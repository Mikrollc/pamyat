import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapboxGL from '@rnmapbox/maps';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMapGraves } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, radii } from '@/constants/tokens';
import type { MapGrave } from '@/lib/api/graves';

const NYC_CENTER: [number, number] = [-74.006, 40.7128];
const DEFAULT_ZOOM = 11;

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: graves } = useMapGraves();

  function handlePinPress(grave: MapGrave) {
    router.push(`/memorial/${grave.slug}`);
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        attributionEnabled={false}
        logoEnabled={false}
      >
        <MapboxGL.Camera
          defaultSettings={{
            centerCoordinate: NYC_CENTER,
            zoomLevel: DEFAULT_ZOOM,
          }}
        />

        {graves?.map((grave) => (
          <MapboxGL.PointAnnotation
            key={grave.id}
            id={grave.id}
            coordinate={[grave.lng, grave.lat]}
            onSelected={() => handlePinPress(grave)}
          >
            <View style={styles.pin}>
              <FontAwesome name="map-marker" size={32} color={colors.brand} />
            </View>
            <MapboxGL.Callout title={grave.person_name} />
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

      {/* Add Grave FAB */}
      <View style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}>
        <Pressable
          onPress={() => router.push('/add-grave')}
          style={({ pressed }) => [
            styles.fabButton,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('map.addGrave')}
          testID="add-grave-button"
        >
          <FontAwesome name="plus" size={20} color={colors.white} />
          <Typography variant="button" color={colors.white}>
            {t('map.addGrave')}
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
