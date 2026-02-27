import { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radii } from '@/constants/tokens';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const DEFAULT_CENTER: [number, number] = [-74.006, 40.7128]; // NYC
const DEFAULT_ZOOM = 17;

interface MapPinSelectorProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number, confirmed?: boolean) => void;
  testID?: string;
}

export function MapPinSelector({
  latitude,
  longitude,
  onLocationChange,
  testID,
}: MapPinSelectorProps) {
  const { t } = useTranslation();
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const [locating, setLocating] = useState(false);
  const zoomRef = useRef(DEFAULT_ZOOM);
  const initializedRef = useRef(false);

  const initialCenter: [number, number] =
    longitude != null && latitude != null
      ? [longitude, latitude]
      : DEFAULT_CENTER;

  const centerRef = useRef<[number, number]>(initialCenter);

  const handleZoom = (delta: number) => {
    zoomRef.current = Math.max(5, Math.min(20, zoomRef.current + delta));
    cameraRef.current?.setCamera({
      centerCoordinate: centerRef.current,
      zoomLevel: zoomRef.current,
      animationDuration: 300,
    });
  };

  useEffect(() => {
    // Set initial coords and mark as confirmed so the Next button is enabled
    if (latitude == null || longitude == null) {
      onLocationChange(DEFAULT_CENTER[1], DEFAULT_CENTER[0], true);
    }
  }, []);

  const handleRegionChange = (state: { properties: { center: GeoJSON.Position } }) => {
    const [lng, lat] = state.properties.center;
    if (lat == null || lng == null) return;

    // Skip the first idle event — it fires before the camera settles on the
    // initial position, which would overwrite a pre-set cemetery location
    // with the default map center.
    if (!initializedRef.current) {
      initializedRef.current = true;
      centerRef.current = [lng, lat];
      return;
    }

    centerRef.current = [lng, lat];
    onLocationChange(lat, lng, true);
  };

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('', t('addGrave.locationDenied'));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      onLocationChange(loc.coords.latitude, loc.coords.longitude, true);
      cameraRef.current?.setCamera({
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
        zoomLevel: DEFAULT_ZOOM,
        animationDuration: 800,
      });
    } catch {
      Alert.alert('', t('common.offline'));
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.mapWrapper}>
        <MapboxGL.MapView
          style={styles.map}
          styleURL={MapboxGL.StyleURL.Street}
          onMapIdle={handleRegionChange}
          attributionEnabled={false}
          logoEnabled={false}
        >
          <MapboxGL.Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: initialCenter,
              zoomLevel: DEFAULT_ZOOM,
            }}
          />
        </MapboxGL.MapView>
        {/* Centered pin overlay */}
        <View style={styles.pinOverlay} pointerEvents="none">
          <FontAwesome name="map-marker" size={40} color={colors.brand} style={styles.pinIcon} />
        </View>
        {/* Zoom controls */}
        <View style={styles.zoomControls}>
          <Pressable
            style={styles.zoomButton}
            onPress={() => handleZoom(1)}
            accessibilityRole="button"
            accessibilityLabel={t('common.zoomIn')}
          >
            <FontAwesome name="plus" size={14} color={colors.textSecondary} />
          </Pressable>
          <View style={styles.zoomDivider} />
          <Pressable
            style={styles.zoomButton}
            onPress={() => handleZoom(-1)}
            accessibilityRole="button"
            accessibilityLabel={t('common.zoomOut')}
          >
            <FontAwesome name="minus" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>
      <View style={styles.locationButton}>
        <Button
          variant="secondary"
          title={t('addGrave.useMyLocation')}
          icon="crosshairs"
          onPress={handleUseMyLocation}
          loading={locating}
          testID={testID ? `${testID}-locate` : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  mapWrapper: {
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  pinOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: {
    // offset so the pin tip is at center, not the icon middle
    marginBottom: 40,
  },
  zoomControls: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  locationButton: {},
});
