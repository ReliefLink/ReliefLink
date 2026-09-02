// src/maps/DisasterMap.jsx
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { DEFAULT_MAP_CENTER, DEFAULT_ZOOM } from './mapData.js';
import { AffectedAreaOverlay, RedZoneOverlay } from './ZoneOverlay.jsx';
import { RequestMarker, CampMarker, VolunteerMarker } from './MapMarkers.jsx';

export default function DisasterMap({
  role = 'citizen', // 'admin' | 'citizen' | 'volunteer' | 'ndrf'
  affectedArea = null, // Array<{ lat, lng }>
  redZones = [],       // Array<RedZone>
  requests = [],       // Array<Request>
  volunteers = [],     // Array<Volunteer> (Admin only)
  reliefCamps = [],    // Array<Camp>
  resourceCamps = [],  // Array<Camp>
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_ZOOM,
  height = '500px',
}) {
  const mapCenter = center?.lat ? [center.lat, center.lng] : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Affected Disaster Area */}
        {affectedArea && <AffectedAreaOverlay boundary={affectedArea} />}

        {/* 2. Red Zones */}
        {redZones.map((zone) => (
          <RedZoneOverlay key={zone.id || Math.random()} zone={zone} />
        ))}

        {/* 3. Relief & Resource Camps */}
        {reliefCamps.map((camp) => (
          <CampMarker key={camp.id || Math.random()} camp={camp} isResource={false} />
        ))}
        {resourceCamps.map((camp) => (
          <CampMarker key={camp.id || Math.random()} camp={camp} isResource={true} />
        ))}

        {/* 4. Requests Layer - Admin sees all, Volunteer/NDRF sees what's passed in their props */}
        {requests.map((req) => (
          req.location?.lat ? <RequestMarker key={req.id || Math.random()} request={req} /> : null
        ))}

        {/* 5. Volunteer Markers - ADMIN ONLY */}
        {role === 'admin' &&
          volunteers.map((vol) => (
            vol.location?.lat ? <VolunteerMarker key={vol.id || Math.random()} volunteer={vol} /> : null
          ))}
      </MapContainer>
    </div>
  );
}