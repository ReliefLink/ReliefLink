// src/components/RequestHelpForm.jsx
import React, { useState, useEffect } from 'react';
import { openNativeSMS } from '../utils/smsGateway.js';
import { classifyEmergencyAI } from '../utils/aiTriage.js';
import LocationPicker from '../maps/LocationPicker.jsx';

export default function RequestHelpForm({ onSubmitOnline }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiTriage, setAiTriage] = useState(null);

  const [formData, setFormData] = useState({
    type: 'medical',
    urgency: 'medium',
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

  // 🤖 Trigger AI Auto-Triage when description changes
  const handleDescriptionBlur = async () => {
    if (formData.description.trim().length > 5) {
      setIsAnalyzingAI(true);
      const triageResult = await classifyEmergencyAI(formData.description, formData.peopleCount);
      setIsAnalyzingAI(false);
      
      setAiTriage(triageResult);
      // Auto-update urgency and type based on AI recommendation!
      setFormData((prev) => ({
        ...prev,
        urgency: triageResult.urgency,
        type: triageResult.detectedType || prev.type,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isOnline) {
      alert('⚠️ No internet connection! Transmitting 2G emergency SMS...');
      openNativeSMS(formData);
    } else {
      if (onSubmitOnline) onSubmitOnline({ ...formData, aiTriage });
      alert(`✅ Request submitted! Urgency set by AI to: ${formData.urgency.toUpperCase()}`);
    }
  };

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>🆘 Emergency Assistance Request</h2>
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          backgroundColor: isOnline ? '#dcfce7' : '#fee2e2',
          color: isOnline ? '#15803d' : '#b91c1c'
        }}>
          {isOnline ? '🟢 Online' : '🔴 Offline 2G'}
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Description Field */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
            Describe the Emergency & Medical Needs:
          </label>
          <textarea
            rows="3"
            placeholder="e.g. Water is entering 2nd floor, elderly grandmother is unconscious and needs oxygen"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            onBlur={handleDescriptionBlur}
            style={{ width: '95%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
          <small style={{ color: '#64748b' }}>💡 Type your emergency and click outside the box to trigger instant AI Triage.</small>
        </div>

        {/* 🤖 LIVE AI TRIAGE BANNER */}
        {isAnalyzingAI && (
          <div style={{ padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: '6px', color: '#166534', fontSize: '13px' }}>
            ⚡ <i>AI is evaluating medical threat and urgency level...</i>
          </div>
        )}

        {aiTriage && !isAnalyzingAI && (
          <div style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>✨ AI Triage Assessment:</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: aiTriage.urgency === 'critical' ? '#dc2626' : aiTriage.urgency === 'high' ? '#ea580c' : '#2563eb'
              }}>
                {aiTriage.urgency.toUpperCase()}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>({aiTriage.source})</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>{aiTriage.reasoning}</p>
          </div>
        )}

        {/* People Count & Manual Urgency Override */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Assigned Urgency:</label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="critical">🚨 Critical (Immediate Danger)</option>
              <option value="high">⚠️ High Priority</option>
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

        {/* Location Picker */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>GPS Location:</label>
          <LocationPicker
            value={formData.location}
            onChange={(coords) => setFormData({ ...formData, location: coords })}
            height="200px"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            marginTop: '10px',
            padding: '12px',
            backgroundColor: formData.urgency === 'critical' ? '#dc2626' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {isOnline ? '🚨 Submit Emergency Request' : '📱 Send 2G Emergency SMS'}
        </button>
      </form>
    </div>
  );
}
