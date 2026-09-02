// src/utils/distance.js

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 * @param {{lat: number, lng: number}} pointA 
 * @param {{lat: number, lng: number}} pointB 
 * @returns {number} Distance in kilometers (rounded to 2 decimal places)
 */
export function calculateDistance(pointA, pointB) {
  if (!pointA || !pointB || pointA.lat == null || pointA.lng == null || pointB.lat == null || pointB.lng == null) {
    return Infinity;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(pointB.lat - pointA.lat);
  const dLng = toRad(pointB.lng - pointA.lng);

  const lat1 = toRad(pointA.lat);
  const lat2 = toRad(pointB.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats a distance value for UI display
 * @param {number} distanceInKm 
 * @returns {string} e.g. "1.4 km" or "450 m"
 */
export function formatDistance(distanceInKm) {
  if (distanceInKm == null || distanceInKm === Infinity) return 'N/A';
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
}