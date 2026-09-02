import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, Radio } from 'lucide-react';

export default function Navbar() {
  const { userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleColors = {
    admin: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    ndrf: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    volunteer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    citizen: 'bg-sky-500/20 text-sky-400 border-sky-500/30'
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg text-slate-100 flex items-center gap-2">
              RELIEFLINK <span className="text-xs bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-medium">LIVE</span>
            </span>
            <p className="text-xs text-slate-400">Emergency Coordination Protocol</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>Kozhikode Command Mesh</span>
          </div>

          <div className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase border ${roleColors[userRole] || 'bg-slate-800 text-slate-300'}`}>
            {userRole}
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}