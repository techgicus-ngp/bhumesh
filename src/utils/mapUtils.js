// utils/map_utils.dart (canvas marker bitmaps aren't needed — labels use Marker/OverlayView text)
export const calculateDistance = (p1, p2) => {
  const p = 0.017453292519943295;
  const a = 0.5 - Math.cos((p2.lat - p1.lat) * p) / 2 +
    (Math.cos(p1.lat * p) * Math.cos(p2.lat * p) * (1 - Math.cos((p2.lng - p1.lng) * p))) / 2;
  return 12742 * Math.asin(Math.sqrt(a)) * 1000;
};

export const calculatePolygonArea = (pts) => {
  if (pts.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].lng * pts[j].lat;
    area -= pts[j].lng * pts[i].lat;
  }
  return (Math.abs(area) / 2) * 111000 * 111000; // → m²
};

export const getPolygonCenter = (pts) => {
  if (!pts.length) return { lat: 0, lng: 0 };
  return {
    lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
    lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
  };
};

export const getBounds = (pts) => {
  if (!pts.length) return null;
  return {
    south: Math.min(...pts.map((p) => p.lat)),
    north: Math.max(...pts.map((p) => p.lat)),
    west: Math.min(...pts.map((p) => p.lng)),
    east: Math.max(...pts.map((p) => p.lng)),
  };
};

export const metersToFeet = (m) => m * 3.28084;
export const sqmToSqft = (m) => m * 10.7639;
export const formatArea = (area, inSqm = true) =>
  inSqm ? `${area.toFixed(2)} sq.m` : `${sqmToSqft(area).toFixed(2)} sq.ft`;
