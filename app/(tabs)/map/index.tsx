import { useState, useRef, useCallback } from 'react';
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
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMapGraves, useCemeterySearch } from '@/hooks';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, radii, typography as typo } from '@/constants/tokens';
import type { MapGrave } from '@/lib/api/graves';
import type { CemeterySearchResult } from '@/lib/api/cemeteries';

const NYC_CENTER: [number, number] = [-74.006, 40.7128];
const DEFAULT_ZOOM = 11;
const SEARCH_DEBOUNCE_MS = 300;

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

function parseEWKBPoint(hex: string): [number, number] | null {
  // EWKB Point: byte order (1) + type (4) + SRID (4) + X double (8) + Y double (8)
  // Little-endian (starts with "01"), type 0x20000001 = Point with SRID
  // X starts at byte 9 (hex offset 18), Y starts at byte 17 (hex offset 34)
  if (hex.length < 50) return null;
  const buf = new Uint8Array(hex.length / 2);
  for (let i = 0; i < buf.length; i++) {
    buf[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  const view = new DataView(buf.buffer);
  const le = buf[0] === 1; // little-endian flag
  const lng = view.getFloat64(9, le);
  const lat = view.getFloat64(17, le);
  if (isFinite(lng) && isFinite(lat)) return [lng, lat];
  return null;
}

function parseCemeteryCoords(
  location: unknown,
): [number, number] | null {
  // GeoJSON object: { type: "Point", coordinates: [lng, lat] }
  if (
    typeof location === 'object' &&
    location !== null &&
    'coordinates' in location
  ) {
    const coords = (location as { coordinates: number[] }).coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      return [coords[0], coords[1]];
    }
  }
  if (typeof location === 'string') {
    // EWKB hex (starts with "01" for little-endian point)
    if (/^[0-9a-f]+$/i.test(location) && location.length >= 50) {
      return parseEWKBPoint(location);
    }
    // WKT string: "POINT(lng lat)"
    const wktMatch = location.match(/POINT\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (wktMatch) {
      return [parseFloat(wktMatch[1]), parseFloat(wktMatch[2])];
    }
    // GeoJSON returned as JSON string
    try {
      const parsed = JSON.parse(location);
      if (parsed?.coordinates?.length >= 2) {
        return [parsed.coordinates[0], parsed.coordinates[1]];
      }
    } catch {
      // not JSON
    }
  }
  return null;
}

export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: graves } = useMapGraves();

  const [searchText, setSearchText] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<[number, number]>(NYC_CENTER);
  const [cameraZoom, setCameraZoom] = useState(DEFAULT_ZOOM);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const coords = parseCemeteryCoords(cemetery.location);
    if (coords) {
      setCameraTarget(coords);
      setCameraZoom(14);
    }
    setShowResults(false);
    Keyboard.dismiss();
  }

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
          centerCoordinate={cameraTarget}
          zoomLevel={cameraZoom}
          animationDuration={1000}
          animationMode="flyTo"
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
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    shadowColor: '#000',
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
    borderRadius: radii.sm,
    marginTop: spacing.xs,
    maxHeight: 240,
    shadowColor: '#000',
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
