// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Users, HeartHandshake, Shield, User, Phone, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [role, setRole] = useState('citizen');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your full name.');
      return;
    }
    setLoading(true);
    try {
      await login(name.trim(), phone.trim(), password, role);
    } catch (err) {
      alert(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'citizen', label: 'Citizen', icon: Users, desc: 'Request help & view relief camps' },
    { id: 'volunteer', label: 'Volunteer', icon: HeartHandshake, desc: 'Accept assigned rescue/medical tasks' },
    { id: 'ndrf', label: 'NDRF Unit', icon: Shield, desc: 'Manage high-danger Red Zone operations' },
    { id: 'admin', label: 'Disaster HQ', icon: ShieldAlert, desc: 'Declare disasters & command center' }
  ];

  return (
    <div className="max-w-md mx-auto my-6 p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-rose-600 shadow-lg shadow-rose-600/30 mb-3">
          <ShieldAlert className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">DisasterNet Access</h2>
        <p className="text-xs text-slate-400 mt-1">Identify yourself to join the emergency coordination grid</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector Grid */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Select Your Role</label>
          <div className="grid grid-cols-2 gap-2.5">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                    isSelected 
                      ? 'border-rose-500 bg-rose-500/10 text-white ring-1 ring-rose-500/50' 
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-semibold block">{r.label}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{r.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-3 pt-2">
          {/* Full Name */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" /> Full Name
            </label>
            <input
              type="text"
              placeholder="E.g., Gopika Prakash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone Number
            </label>
            <input
              type="tel"
              placeholder="E.g., 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Passcode */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-400" /> Passcode
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
        >
          {loading ? 'Authenticating...' : `Enter System as ${role.toUpperCase()}`}
        </button>
      </form>
    </div>
  );
}