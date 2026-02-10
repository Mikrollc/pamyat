/**
 * Parse EWKB hex-encoded Point to [lng, lat].
 * EWKB Point: byte order (1) + type (4) + SRID (4) + X double (8) + Y double (8)
 */
export function parseEWKBPoint(hex: string): [number, number] | null {
  if (hex.length < 50) return null;
  const buf = new Uint8Array(hex.length / 2);
  for (let i = 0; i < buf.length; i++) {
    buf[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  const view = new DataView(buf.buffer);
  const le = buf[0] === 1;
  const lng = view.getFloat64(9, le);
  const lat = view.getFloat64(17, le);
  if (isFinite(lng) && isFinite(lat)) return [lng, lat];
  return null;
}

/**
 * Parse a location value that could be EWKB hex, GeoJSON object, WKT string, or JSON string.
 * Returns [lng, lat] or null.
 */
export function parseLocationCoords(
  location: unknown,
): [number, number] | null {
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
    if (/^[0-9a-f]+$/i.test(location) && location.length >= 50) {
      return parseEWKBPoint(location);
    }
    const wktMatch = location.match(/POINT\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (wktMatch) {
      return [parseFloat(wktMatch[1]), parseFloat(wktMatch[2])];
    }
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
