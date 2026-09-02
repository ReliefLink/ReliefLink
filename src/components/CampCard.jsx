import React from 'react';
import { MapPin, Phone, Tent, Navigation } from 'lucide-react';

export default function CampCard({ camp }) {
  const handleDirections = () => {
    if (camp.location?.lat && camp.location?.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${camp.location.lat},${camp.location.lng}`, '_blank');
    }
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 hover:border-slate-600 transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Tent className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-slate-100 text-base">{camp.name}</h4>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${camp.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
            {camp.status?.toUpperCase() || 'OPEN'}
          </span>
        </div>

        <div className="space-y-2 my-3 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{camp.address || 'Kozhikode Sector 4'}</span>
          </div>
          {camp.contact && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{camp.contact}</span>
            </div>
          )}
          {camp.facilities && (
            <div className="pt-2 border-t border-slate-700/40">
              <span className="text-slate-400 block mb-1">Available Facilities:</span>
              <p className="text-slate-200">{camp.facilities}</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleDirections}
        className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition shadow-md shadow-sky-600/20"
      >
        <Navigation className="h-4 w-4" />
        Get Directions
      </button>
    </div>
  );
}