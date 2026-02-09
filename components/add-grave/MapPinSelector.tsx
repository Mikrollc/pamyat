import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/constants/tokens';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const DEFAULT_CENTER: [number, number] = [-74.006, 40.7128]; // NYC
const DEFAULT_ZOOM = 15;

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

  const initialCenter: [number, number] =
    longitude != null && latitude != null
      ? [longitude, latitude]
      : DEFAULT_CENTER;

  useEffect(() => {
    // Set initial coords for camera display, but don't mark as confirmed
    if (latitude == null || longitude == null) {
      onLocationChange(DEFAULT_CENTER[1], DEFAULT_CENTER[0]);
    }
  }, []);

  const [userInteracted, setUserInteracted] = useState(false);

  const handleRegionChange = (feature: GeoJSON.Feature) => {
    if (feature.geometry.type !== 'Point') return;
    const coords = feature.geometry.coordinates;
    setUserInteracted(true);
    onLocationChange(coords[1], coords[0], true);
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
      setUserInteracted(true);
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
          onRegionDidChange={handleRegionChange}
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
      </View>
      <View style={styles.locationButton}>
        <Button
          variant="secondary"
          title={t('addGrave.useMyLocation')}
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
  locationButton: {
    paddingHorizontal: spacing.md,
  },
});
