// src/maps/MapMarkers.jsx
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Create SVG Icon helpers for clean marker rendering
const createCustomIcon = (color, label, emoji) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: white;
        cursor: pointer;
      ">
        ${emoji || ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

export const RequestMarker = ({ request }) => {
  const isRed = request.isRedZone;
  const color = isRed ? '#dc2626' : request.urgency === 'critical' ? '#ea580c' : '#2563eb';
  const emoji = request.type === 'medical' ? '🚑' : request.type === 'rescue' ? '🛟' : '📦';

  return (
    <Marker
      position={[request.location.lat, request.location.lng]}
      icon={createCustomIcon(color, request.type, emoji)}
    >
      <Popup>
        <div style={{ minWidth: 160 }}>
          <strong style={{ textTransform: 'capitalize' }}>{request.type} Request</strong>
          <p style={{ margin: '4px 0' }}>{request.description}</p>
          <small>People: {request.peopleCount} | Status: <b>{request.status}</b></small>
          {isRed && <div style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ In Red Zone</div>}
        </div>
      </Popup>
    </Marker>
  );
};

export const CampMarker = ({ camp, isResource = false }) => {
  const color = isResource ? '#059669' : '#0284c7';
  const emoji = isResource ? '📦' : '⛺';

  return (
    <Marker
      position={[camp.location.lat, camp.location.lng]}
      icon={createCustomIcon(color, camp.name, emoji)}
    >
      <Popup>
        <div>
          <strong>{camp.name}</strong>
          <p style={{ margin: '4px 0' }}>{isResource ? 'Resource Camp' : 'Relief Camp'}</p>
          <small>{camp.address}</small>
          {camp.contact && <div>Contact: {camp.contact}</div>}
        </div>
      </Popup>
    </Marker>
  );
};

export const VolunteerMarker = ({ volunteer }) => {
  return (
    <Marker
      position={[volunteer.location.lat, volunteer.location.lng]}
      icon={createCustomIcon('#7c3aed', volunteer.name, '🧑‍🚒')}
    >
      <Popup>
        <div>
          <strong>{volunteer.name}</strong>
          <div>Type: {volunteer.type}</div>
          <small>Status: {volunteer.available ? '🟢 Available' : '🔴 Busy'}</small>
        </div>
      </Popup>
    </Marker>
  );
};