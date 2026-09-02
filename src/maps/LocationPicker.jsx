// src/maps/LocationPicker.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { DEFAULT_MAP_CENTER, DEFAULT_ZOOM } from './mapData.js';

// Default pin icon
const pinIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({
        lat: Math.round(e.latlng.lat * 100000) / 100000,
        lng: Math.round(e.latlng.lng * 100000) / 100000,
      });
    },
  });
  return null;
}

export default function LocationPicker({
  value = null, // { lat, lng }
  onChange,     // callback (coords) => void
  height = '300px'
}) {
  const [selectedLocation, setSelectedLocation] = useState(value || DEFAULT_MAP_CENTER);
  const [loadingGps, setLoadingGps] = useState(false);

  const handleSelect = (coords) => {
    setSelectedLocation(coords);
    if (onChange) onChange(coords);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingGps(false);
        const coords = {
          lat: Math.round(pos.coords.latitude * 100000) / 100000,
          lng: Math.round(pos.coords.longitude * 100000) / 100000,
        };
        handleSelect(coords);
      },
      (err) => {
        setLoadingGps(false);
        alert('Could not retrieve your location: ' + err.message);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={loadingGps}
          style={{
            padding: '6px 12px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {loadingGps ? 'Fetching GPS...' : '📍 Use My Current Location'}
        </button>
        <span style={{ fontSize: '13px', color: '#6b7280' }}>
          Selected: {selectedLocation ? `${selectedLocation.lat}, ${selectedLocation.lng}` : 'None'}
        </span>
      </div>

      <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <MapContainer
          center={[selectedLocation?.lat || DEFAULT_MAP_CENTER.lat, selectedLocation?.lng || DEFAULT_MAP_CENTER.lng]}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleSelect} />
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={pinIcon} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}