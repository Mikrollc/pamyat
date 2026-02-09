import { cemeteriesToGeoJSON } from '../geojson';
import type { MapCemetery } from '../api/cemeteries';

describe('cemeteriesToGeoJSON', () => {
  it('converts cemeteries to GeoJSON FeatureCollection', () => {
    const cemeteries: MapCemetery[] = [
      { id: '1', name: 'Test Cemetery', name_ru: 'Тестовое', city: 'Brooklyn', state: 'NY', lat: 40.63, lng: -73.97 },
    ];

    const result = cemeteriesToGeoJSON(cemeteries);

    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry).toEqual({
      type: 'Point',
      coordinates: [-73.97, 40.63],
    });
    expect(result.features[0].properties).toEqual({
      id: '1',
      name: 'Test Cemetery',
      name_ru: 'Тестовое',
      city: 'Brooklyn',
      state: 'NY',
    });
  });

  it('returns empty FeatureCollection for empty array', () => {
    const result = cemeteriesToGeoJSON([]);

    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(0);
  });

  it('preserves null values in properties', () => {
    const cemeteries: MapCemetery[] = [
      { id: '2', name: 'No Russian', name_ru: null, city: null, state: null, lat: 40.7, lng: -74.0 },
    ];

    const result = cemeteriesToGeoJSON(cemeteries);

    expect(result.features[0].properties).toEqual({
      id: '2',
      name: 'No Russian',
      name_ru: null,
      city: null,
      state: null,
    });
  });

  it('handles multiple cemeteries', () => {
    const cemeteries: MapCemetery[] = [
      { id: '1', name: 'A', name_ru: null, city: null, state: null, lat: 40, lng: -74 },
      { id: '2', name: 'B', name_ru: null, city: null, state: null, lat: 41, lng: -73 },
      { id: '3', name: 'C', name_ru: null, city: null, state: null, lat: 42, lng: -72 },
    ];

    const result = cemeteriesToGeoJSON(cemeteries);

    expect(result.features).toHaveLength(3);
    expect(result.features.map((f) => f.properties?.name)).toEqual(['A', 'B', 'C']);
  });
});
