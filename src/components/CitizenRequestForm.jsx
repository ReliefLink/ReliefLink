// src/components/CitizenRequestForm.jsx
import React, { useState } from 'react';
import { 
  HeartPulse, 
  LifeBuoy, 
  Utensils, 
  Droplet, 
  Tent, 
  Truck, 
  AlertOctagon, 
  MapPin, 
  Users, 
  Send, 
  Compass, 
  Crosshair 
} from 'lucide-react';

const requestTypes = [
  { id: 'medical', label: 'Medical Aid', icon: HeartPulse, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  { id: 'rescue', label: 'Evacuation', icon: LifeBuoy, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'food', label: 'Food & Rations', icon: Utensils, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { id: 'water', label: 'Drinking Water', icon: Droplet, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
  { id: 'shelter', label: 'Emergency Shelter', icon: Tent, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { id: 'transportation', label: 'Transport', icon: Truck, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
];

const urgencyLevels = [
  { id: 'low', label: 'Low', desc: 'Can wait 12-24 hrs', border: 'border-slate-700', active: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
  { id: 'medium', label: 'Medium', desc: 'Needs attention today', border: 'border-slate-700', active: 'border-amber-500 bg-amber-500/10 text-amber-400' },
  { id: 'high', label: 'High', desc: 'Urgent assistance required', border: 'border-slate-700', active: 'border-orange-500 bg-orange-500/10 text-orange-400' },
  { id: 'critical', label: 'Critical', desc: 'Life-threatening danger', border: 'border-slate-700', active: 'border-rose-600 bg-rose-600/20 text-rose-400 font-bold' }
];

export default function CitizenRequestForm({ onSubmit, isSubmitting, defaultDisasterId }) {
  const [type, setType] = useState('medical');
  const [urgency, setUrgency] = useState('high');
  const [peopleCount, setPeopleCount] = useState(1);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ lat: 11.2588, lng: 75.7804 });
  const [locationAddress, setLocationAddress] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  // Fetch live device GPS
  const handleFetchGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: parseFloat(pos.coords.latitude.toFixed(5)),
          lng: parseFloat(pos.coords.longitude.toFixed(5))
        });
        setLocationAddress('Current Device GPS Position');
        setGpsLoading(false);
      },
      (err) => {
        alert('Could not fetch GPS. Please verify location permissions.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleQuickPreset = (presetName, lat, lng) => {
    setLocation({ lat, lng });
    setLocationAddress(presetName);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please describe your situation.');
      return;
    }
    onSubmit({
      type,
      urgency,
      peopleCount: Number(peopleCount),
      description: description.trim(),
      location,
      locationAddress: locationAddress || `${location.lat}, ${location.lng}`,
      disasterId: defaultDisasterId || 'dis_1'
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
        <div className="p-3 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-600/30 shadow-lg shadow-rose-600/20">
          <AlertOctagon className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Request Emergency Assistance</h3>
          <p className="text-xs text-slate-400">
            Submit your location and needs. The system routes automatically to nearby volunteers or NDRF teams.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Request Type Visual Grid */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
            1. Select Primary Need
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {requestTypes.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                    isSelected
                      ? `${t.bg} ${t.border} ring-2 ring-rose-500/50`
                      : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-900' : t.bg} ${t.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className={`text-xs font-semibold block ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {t.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Urgency Level */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
            2. Urgency Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {urgencyLevels.map((u) => {
              const isSelected = urgency === u.id;
              return (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => setUrgency(u.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    isSelected ? u.active : 'border-slate-800 bg-slate-800/30 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold block">{u.label}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{u.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. People Count & Situation Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              People Needing Help
            </label>
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setPeopleCount((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center transition"
              >
                -
              </button>
              <div className="flex-1 text-center font-bold text-sm text-white flex items-center justify-center gap-1">
                <Users className="h-4 w-4 text-slate-400" />
                <span>{peopleCount}</span>
              </div>
              <button
                type="button"
                onClick={() => setPeopleCount((p) => p + 1)}
                className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center transition"
              >
                +
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Situation & Special Medical Needs
            </label>
            <input
              type="text"
              required
              placeholder="E.g., Water at 3ft, elderly patient needs insulin & stretcher transport..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>
        </div>

        {/* 4. Location Section */}
        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-400" /> Incident Location
            </span>
            <button
              type="button"
              onClick={handleFetchGPS}
              disabled={gpsLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-semibold border border-sky-500/30 transition"
            >
              <Crosshair className={`h-3.5 w-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
              {gpsLoading ? 'Detecting GPS...' : 'Use Current Device GPS'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Latitude</span>
              <input
                type="number"
                step="any"
                value={location.lat}
                onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Longitude</span>
              <input
                type="number"
                step="any"
                value={location.lng}
                onChange={(e) => setLocation({ ...location, lng: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Quick Demo Sector Presets */}
          <div className="pt-2 border-t border-slate-700/40 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Compass className="h-3 w-3" /> Quick Kozhikode Sectors:
            </span>
            <button
              type="button"
              onClick={() => handleQuickPreset('Sector 1 (West Hill)', 11.289, 75.772)}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              West Hill
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('Sector 2 (Chevayur)', 11.272, 75.812)}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Chevayur
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('Sector Alpha Red Zone', 11.2512, 75.7723)}
              className="text-[10px] px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800"
            >
              Canal Basin (Red Zone)
            </button>
          </div>
        </div>

        {/* 5. Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm uppercase tracking-wider transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Transmitting Assistance Request...' : 'Transmit Request For Help'}
        </button>
      </form>
    </div>
  );
}