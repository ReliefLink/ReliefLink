// src/components/RequestHelpForm.jsx
import React, { useState, useEffect } from 'react';
import { openNativeSMS } from '../utils/smsGateway.js';
import LocationPicker from '../maps/LocationPicker.jsx';

export default function RequestHelpForm({ onSubmitOnline }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [formData, setFormData] = useState({
    type: 'medical',
    urgency: 'critical',
    peopleCount: 1,
    description: '',
    location: { lat: 11.2580, lng: 75.7920 },
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isOnline) {
      alert('⚠️ No internet connection! Opening SMS application to transmit 2G emergency packet...');
      openNativeSMS(formData);
    } else {
      if (onSubmitOnline) onSubmitOnline(formData);
      alert('✅ Request submitted online successfully!');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>🆘 Request Emergency Help</h2>
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          backgroundColor: isOnline ? '#dcfce7' : '#fee2e2',
          color: isOnline ? '#15803d' : '#b91c1c'
        }}>
          {isOnline ? '🟢 Online (Broadband)' : '🔴 Offline (2G SMS Fallback)'}
        </span>
      </div>

      {!isOnline && (
        <div style={{ backgroundColor: '#fef3c7', padding: '10px 14px', color: '#92400e', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
          📡 <b>Offline Mode Active:</b> Your GPS location and emergency details will be automatically compressed into an encoded SMS to dispatch rescue teams without data.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Emergency Type:</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="medical">🚑 Medical Emergency</option>
            <option value="rescue">🛟 Rescue / Evacuation</option>
            <option value="food">🍞 Food & Supplies</option>
            <option value="water">💧 Clean Drinking Water</option>
            <option value="shelter">⛺ Emergency Shelter</option>
            <option value="transportation">🚙 Transportation</option>
            <option value="other">⚠️ Other</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Urgency:</label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="critical">🚨 Critical (Immediate Danger)</option>
              <option value="high">⚠️ High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>People Trapped:</label>
            <input
              type="number"
              min="1"
              value={formData.peopleCount}
              onChange={(e) => setFormData({ ...formData, peopleCount: parseInt(e.target.value, 10) || 1 })}
              style={{ width: '90%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Description / Medical Needs:</label>
          <textarea
            rows="2"
            placeholder="e.g., Water rising rapidly, elderly person needs insulin"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '95%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Your Location:</label>
          <LocationPicker
            value={formData.location}
            onChange={(coords) => setFormData({ ...formData, location: coords })}
            height="200px"
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: '10px',
            padding: '12px',
            backgroundColor: isOnline ? '#2563eb' : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {isOnline ? '🚨 Submit Emergency Request' : '📱 Send Encoded 2G Emergency SMS'}
        </button>
      </form>
    </div>
  );
}
