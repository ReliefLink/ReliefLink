// src/maps/mapData.js

export const DEFAULT_MAP_CENTER = {
  lat: 11.2588,
  lng: 75.7804, // Kozhikode Center
};

export const DEFAULT_ZOOM = 13;

// Default bounding box / affected area polygon for Kozhikode demo
export const DEFAULT_AFFECTED_AREA = [
  { lat: 11.3100, lng: 75.7400 },
  { lat: 11.3100, lng: 75.8300 },
  { lat: 11.2100, lng: 75.8300 },
  { lat: 11.2100, lng: 75.7400 },
];

// Sample demo Red Zone polygon
export const DEMO_RED_ZONE_BOUNDARY = [
  { lat: 11.2750, lng: 75.7700 },
  { lat: 11.2750, lng: 75.8050 },
  { lat: 11.2450, lng: 75.8050 },
  { lat: 11.2450, lng: 75.7700 },
];