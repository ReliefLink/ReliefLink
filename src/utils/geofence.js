// src/utils/geofence.js

/**
 * Determines whether a coordinate point lies inside a polygon using ray-casting.
 * @param {{lat: number, lng: number}} point 
 * @param {Array<{lat: number, lng: number}>} polygon Array of vertices
 * @returns {boolean}
 */
export function isPointInsidePolygon(point, polygon) {
  if (!point || !polygon || polygon.length < 3) {
    return false;
  }

  const { lat: x, lng: y } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Checks if a request point falls inside any active Red Zone.
 * @param {{lat: number, lng: number}} location 
 * @param {Array<Object>} redZones List of Red Zone documents
 * @returns {Object|null} Matching Red Zone object or null if outside all zones
 */
export function findEnclosingRedZone(location, redZones = []) {
  if (!location || !redZones || redZones.length === 0) return null;

  for (const zone of redZones) {
    if (zone.status === 'active' || !zone.status) {
      const boundary = Array.isArray(zone.boundary) ? zone.boundary : [];
      if (isPointInsidePolygon(location, boundary)) {
        return zone;
      }
    }
  }

  return null;
}