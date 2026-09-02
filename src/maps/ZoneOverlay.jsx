// src/maps/ZoneOverlay.jsx
import React from 'react';
import { Polygon, Popup } from 'react-leaflet';

export const AffectedAreaOverlay = ({ boundary }) => {
  if (!boundary || boundary.length < 3) return null;
  const positions = boundary.map((p) => [p.lat, p.lng]);

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: '#f59e0b', // Amber/orange border
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#fbbf24',
        fillOpacity: 0.15,
      }}
    />
  );
};

export const RedZoneOverlay = ({ zone }) => {
  if (!zone?.boundary || zone.boundary.length < 3) return null;
  const positions = zone.boundary.map((p) => [p.lat, p.lng]);

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: '#dc2626', // Red
        weight: 3,
        fillColor: '#ef4444',
        fillOpacity: 0.35,
      }}
    >
      <Popup>
        <div>
          <strong style={{ color: '#dc2626' }}>🚨 {zone.name || 'Red Zone'}</strong>
          <p style={{ margin: '4px 0' }}>{zone.description || 'Danger Zone'}</p>
          <small>Severity: <b>{zone.severity || 'High'}</b></small>
        </div>
      </Popup>
    </Polygon>
  );
};