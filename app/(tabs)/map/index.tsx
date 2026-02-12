import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMapGraves, useCemeterySearch, useAllCemeteries } from '@/hooks';
import { useAddGraveStore } from '@/stores/add-grave-store';
import { CemeteryFloatingCard } from '@/components/map/CemeteryFloatingCard';
import { cemeteriesToGeoJSON } from '@/lib/geojson';
import { parseLocationCoords } from '@/lib/geo';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, radii, typography as typo } from '@/constants/tokens';
import type { MapGrave } from '@/lib/api/graves';
import type { CemeterySearchResult } from '@/lib/api/cemeteries';

const NYC_CENTER: [number, number] = [-74.006, 40.7128];
const DEFAULT_ZOOM = 11;
const SEARCH_DEBOUNCE_MS = 300;

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

/** Matches @rnmapbox/maps OnPressEvent (not exported from package index) */
interface OnPressEvent {
  features: GeoJSON.Feature[];
  coordinates: { latitude: number; longitude: number };
  point: { x: number; y: number };
}

interface SelectedCemetery {
  id: string;
  name: string;
  name_ru: string | null;
  city: string | null;
  state: string | null;
  lat: number;
  lng: number;
}

export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: graves } = useMapGraves();
  const { data: cemeteries } = useAllCemeteries();
  const store = useAddGraveStore();

  const [searchText, setSearchText] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<[number, number]>(NYC_CENTER);
  const [cameraZoom, setCameraZoom] = useState(DEFAULT_ZOOM);
  const [selectedCemetery, setSelectedCemetery] = useState<SelectedCemetery | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentZoomRef = useRef(DEFAULT_ZOOM);
  const centerRef = useRef<[number, number]>(NYC_CENTER);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getLastKnownPositionAsync();
        if (loc) {
          const coords: [number, number] = [loc.coords.longitude, loc.coords.latitude];
          setCameraTarget(coords);
          centerRef.current = coords;
          return;
        }
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords: [number, number] = [current.coords.longitude, current.coords.latitude];
        setCameraTarget(coords);
        centerRef.current = coords;
      } catch {
        // Location unavailable (e.g. simulator) — keep NYC default
      }
    })();
  }, []);

  const cemeteryGeoJSON = useMemo(
    () => cemeteriesToGeoJSON(cemeteries ?? []),
    [cemeteries],
  );

  const { data: searchResults, isLoading: searching } =
    useCemeterySearch(debouncedQuery);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(text);
      setShowResults(text.trim().length >= 2);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  function handleClearSearch() {
    setSearchText('');
    setDebouncedQuery('');
    setShowResults(false);
    Keyboard.dismiss();
  }

  function handleSelectCemetery(cemetery: CemeterySearchResult) {
    const coords = parseLocationCoords(cemetery.location);
    if (coords) {
      setCameraTarget(coords);
      setCameraZoom(14);
    }
    setSearchText('');
    setDebouncedQuery('');
    setShowResults(false);
    Keyboard.dismiss();
  }

  function handlePinPress(grave: MapGrave) {
    router.push(`/memorial/${grave.slug}`);
  }

  function handleCemeteryPress(e: OnPressEvent) {
    const feature = e.features?.[0];
    if (!feature || feature.properties?.cluster) return;
    const props = feature.properties;
    const coords = (feature.geometry as GeoJSON.Point | undefined)?.coordinates;
    if (!props || !coords || coords[0] == null || coords[1] == null) return;
    setSelectedCemetery({
      id: props.id,
      name: props.name,
      name_ru: props.name_ru ?? null,
      city: props.city ?? null,
      state: props.state ?? null,
      lng: coords[0],
      lat: coords[1],
    });
  }

  function handleAddMemorialHere() {
    if (!selectedCemetery) return;
    store.reset();
    store.setLocation(selectedCemetery.lat, selectedCemetery.lng, true);
    store.setCemeteryName(selectedCemetery.name);
    store.setCemeteryId(selectedCemetery.id);
    setSelectedCemetery(null);
    router.push('/add-grave');
  }

  function handleMapPress() {
    setSelectedCemetery(null);
  }

  function handleRegionChange(state: { properties: { zoom: number; center: GeoJSON.Position } }) {
    currentZoomRef.current = state.properties.zoom;
    const [lng, lat] = state.properties.center;
    if (lng != null && lat != null) {
      centerRef.current = [lng, lat];
    }
  }

  function handleZoomIn() {
    const newZoom = Math.min(currentZoomRef.current + 1, 18);
    setCameraTarget(centerRef.current);
    setCameraZoom(newZoom);
    currentZoomRef.current = newZoom;
  }

  function handleZoomOut() {
    const newZoom = Math.max(currentZoomRef.current - 1, 5);
    setCameraTarget(centerRef.current);
    setCameraZoom(newZoom);
    currentZoomRef.current = newZoom;
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        attributionEnabled={false}
        logoEnabled={false}
        onPress={handleMapPress}
        onMapIdle={handleRegionChange}
      >
        <MapboxGL.Camera
          defaultSettings={{
            centerCoordinate: NYC_CENTER,
            zoomLevel: DEFAULT_ZOOM,
          }}
          centerCoordinate={cameraTarget}
          zoomLevel={cameraZoom}
          animationDuration={1000}
          animationMode="flyTo"
        />

        <MapboxGL.ShapeSource
          id="cemetery-source"
          shape={cemeteryGeoJSON}
          cluster
          clusterRadius={40}
          clusterMaxZoomLevel={14}
          onPress={handleCemeteryPress}
          hitbox={{ width: 24, height: 24 }}
        >
          <MapboxGL.CircleLayer
            id="cemetery-circles"
            filter={['!', ['has', 'point_count']]}
            style={{
              circleRadius: selectedCemetery
                ? ['case', ['==', ['get', 'id'], selectedCemetery.id], 11, 8]
                : 8,
              circleColor: selectedCemetery
                ? ['case', ['==', ['get', 'id'], selectedCemetery.id], colors.brand, colors.textTertiary]
                : colors.textTertiary,
              circleOpacity: 1,
              circleStrokeColor: colors.white,
              circleStrokeWidth: 2.5,
            }}
          />
          <MapboxGL.SymbolLayer
            id="cemetery-labels"
            filter={['!', ['has', 'point_count']]}
            minZoomLevel={12}
            style={{
              textField: ['get', 'name'],
              textSize: 11,
              textColor: colors.textSecondary,
              textOffset: [0, 1.5],
              textAnchor: 'top',
              textMaxWidth: 8,
            }}
          />
          <MapboxGL.CircleLayer
            id="cemetery-cluster-circles"
            filter={['has', 'point_count']}
            style={{
              circleRadius: ['step', ['get', 'point_count'], 15, 10, 20, 30, 25],
              circleColor: colors.border,
              circleOpacity: 0.7,
            }}
          />
          <MapboxGL.SymbolLayer
            id="cemetery-cluster-count"
            filter={['has', 'point_count']}
            style={{
              textField: ['get', 'point_count_abbreviated'],
              textSize: 12,
              textColor: colors.white,
            }}
          />
        </MapboxGL.ShapeSource>

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

      {/* Search bar */}
      <View style={[styles.searchContainer, { top: insets.top + spacing.sm }]}>
        <View style={styles.searchBar}>
          <FontAwesome
            name="search"
            size={16}
            color={colors.textTertiary}
            style={styles.searchIcon}
          />
          <TextInput
            value={searchText}
            onChangeText={handleSearchChange}
            placeholder={t('map.search')}
            placeholderTextColor={colors.textTertiary}
            autoCorrect={false}
            returnKeyType="search"
            style={styles.searchInput}
            testID="cemetery-search-input"
          />
          {searchText.length > 0 && (
            <Pressable onPress={handleClearSearch} hitSlop={8}>
              <FontAwesome name="times-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {/* Results dropdown */}
        {showResults && (
          <View style={styles.results}>
            {searching ? (
              <View style={styles.resultsCenter}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : searchResults && searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                style={styles.resultsList}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleSelectCemetery(item)}
                    style={({ pressed }) => [
                      styles.resultRow,
                      pressed && styles.resultRowPressed,
                    ]}
                  >
                    <Typography variant="body" numberOfLines={1}>
                      {item.name}
                    </Typography>
                    {(item.city || item.state) && (
                      <Typography
                        variant="caption"
                        color={colors.textSecondary}
                        numberOfLines={1}
                      >
                        {[item.city, item.state].filter(Boolean).join(', ')}
                      </Typography>
                    )}
                  </Pressable>
                )}
              />
            ) : (
              <View style={styles.resultsCenter}>
                <Typography variant="bodySmall" color={colors.textSecondary}>
                  {t('map.noResults')}
                </Typography>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Zoom controls */}
      <View style={[styles.zoomControls, { top: insets.top + spacing.sm + 44 + spacing.md }]}>
        <Pressable
          onPress={handleZoomIn}
          style={({ pressed }) => [styles.zoomButton, pressed && styles.zoomButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Zoom in"
        >
          <FontAwesome name="plus" size={14} color={colors.textSecondary} />
        </Pressable>
        <View style={styles.zoomDivider} />
        <Pressable
          onPress={handleZoomOut}
          style={({ pressed }) => [styles.zoomButton, pressed && styles.zoomButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Zoom out"
        >
          <FontAwesome name="minus" size={14} color={colors.textSecondary} />
        </Pressable>
      </View>

      {selectedCemetery && (
        <CemeteryFloatingCard
          name={selectedCemetery.name}
          nameRu={selectedCemetery.name_ru}
          city={selectedCemetery.city}
          state={selectedCemetery.state}
          onAddMemorial={handleAddMemorialHere}
          onClose={() => setSelectedCemetery(null)}
        />
      )}

      {/* Add Grave FAB — hidden when floating card is shown */}
      {!selectedCemetery && (
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
      )}
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
  searchContainer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 44,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typo.body.fontSize,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  results: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    marginTop: spacing.xs,
    maxHeight: 240,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  resultsList: {
    maxHeight: 240,
  },
  resultRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultRowPressed: {
    backgroundColor: colors.backgroundSecondary,
  },
  resultsCenter: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  zoomControls: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 30,
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonPressed: {
    backgroundColor: colors.backgroundSecondary,
  },
  zoomDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
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
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
});
