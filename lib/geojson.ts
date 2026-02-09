import type { MapCemetery } from '@/lib/api/cemeteries';

export function cemeteriesToGeoJSON(
  cemeteries: MapCemetery[],
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: cemeteries.map((c) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [c.lng, c.lat],
      },
      properties: {
        id: c.id,
        name: c.name,
        name_ru: c.name_ru,
        city: c.city,
        state: c.state,
      },
    })),
  };
}
