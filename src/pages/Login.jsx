// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  Users, 
  HeartHandshake, 
  Shield, 
  User, 
  Phone, 
  Lock, 
  Building, 
  Key, 
  BadgeCheck, 
  LogIn, 
  UserPlus 
} from 'lucide-react';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [role, setRole] = useState('citizen');

  // Common Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Role-Specific Fields for Sign Up
  const [volunteerType, setVolunteerType] = useState('medical');
  const [organization, setOrganization] = useState('');
  const [ndrfUnit, setNdrfUnit] = useState('');
  const [designation, setDesignation] = useState('');
  const [adminKey, setAdminKey] = useState('');

  const roles = [
    { id: 'citizen', label: 'Citizen', icon: Users, desc: 'Request help & view relief camps' },
    { id: 'volunteer', label: 'Volunteer', icon: HeartHandshake, desc: 'Provide medical, rescue, or supplies' },
    { id: 'ndrf', label: 'NDRF Unit', icon: Shield, desc: 'Tactical Red Zone operations' },
    { id: 'admin', label: 'Disaster HQ', icon: ShieldAlert, desc: 'Command center & disaster controls' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(phone.trim(), password, role);
      } else {
        // Sign Up Validation
        if (!name.trim()) throw new Error('Full Name is required.');
        if (role === 'admin' && adminKey.trim() !== 'ADMIN2026' && adminKey.trim() !== 'hq123') {
          throw new Error('Invalid Admin Clearance Key. Use ADMIN2026 for demo.');
        }

        await signUp({
          name: name.trim(),
          phone: phone.trim(),
          password,
          role,
          volunteerType: role === 'volunteer' ? volunteerType : undefined,
          organization: role === 'volunteer' ? organization.trim() : undefined,
          ndrfUnit: role === 'ndrf' ? (ndrfUnit.trim() || '04 NDRF Battalion') : undefined,
          designation: role === 'ndrf' ? (designation.trim() || 'Commanding Officer') : undefined
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-6 p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-rose-600 shadow-lg shadow-rose-600/30 mb-3">
          <ShieldAlert className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">ReliefLink</h2>
        <p className="text-xs text-slate-400 mt-1">Multi-Role Emergency Response & Coordination Portal</p>
      </div>

      {/* Sign In vs Sign Up Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl mb-6 border border-slate-700/60">
        <button
          type="button"
          onClick={() => { setMode('signin'); setError(''); }}
          className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
            mode === 'signin'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LogIn className="h-3.5 w-3.5" /> Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(''); }}
          className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
            mode === 'signup'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" /> Sign Up
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector Grid */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Select Role: <span className="text-rose-400 font-semibold uppercase">{role}</span>
          </label>
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
          {/* Full Name (Sign Up Only) */}
          {mode === 'signup' && (
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
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition"
              />
            </div>
          )}

          {/* Phone Number (Both Sign In & Sign Up) */}
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
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Passcode (Both Sign In & Sign Up) */}
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
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* ROLE SPECIFIC FIELDS FOR SIGN UP */}
          {mode === 'signup' && role === 'volunteer' && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-3">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Volunteer Specialization
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Service Type</label>
                <select
                  value={volunteerType}
                  onChange={(e) => setVolunteerType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="medical">Medical Assistance (Doctor / Nurse / EMT)</option>
                  <option value="rescue">Rescue & Evacuation (Boats / Physical)</option>
                  <option value="resource">Resource & Food Distribution</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Affiliated Organization (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g., Red Cross, Community Aid"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && role === 'ndrf' && (
            <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-3">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                NDRF Tactical Credentials
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Battalion / Unit Code</label>
                <input
                  type="text"
                  placeholder="E.g., 04 NDRF Arakkonam / Team Alpha"
                  value={ndrfUnit}
                  onChange={(e) => setNdrfUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Rank / Designation</label>
                <input
                  type="text"
                  placeholder="E.g., Inspector / Team Commander"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && role === 'admin' && (
            <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" /> Disaster HQ Clearance Key
              </span>
              <input
                type="password"
                placeholder="Enter ADMIN2026"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500"
              />
              <p className="text-[10px] text-slate-400">Authorized personnel only (Passkey: <code className="text-rose-300">ADMIN2026</code>)</p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
        >
          {loading ? 'Processing...' : mode === 'signin' ? `Sign In as ${role.toUpperCase()}` : `Create ${role.toUpperCase()} Account`}
        </button>
      </form>
    </div>
  );
}