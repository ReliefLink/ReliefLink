// src/pages/Volunteer/VolunteerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as volunteerService from '../../services/volunteers';
import * as requestService from '../../services/requests';
import * as updateService from '../../services/updates';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { LoadingState, EmptyState } from '../../components/StateFeedback';
import { 
  HeartHandshake, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Check, 
  AlertOctagon, 
  Power, 
  Radio, 
  MapPin, 
  Users, 
  Navigation, 
  Phone, 
  AlertTriangle 
} from 'lucide-react';

export default function VolunteerDashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [assignedTask, setAssignedTask] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [regType, setRegType] = useState('medical');
  const [org, setOrg] = useState('');
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonAction, setReasonAction] = useState('declined'); // 'declined' or 'cannot_complete'
  const [reasonText, setReasonText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // 1. Volunteer profile
    const unsubVol = volunteerService.subscribeToVolunteerProfile?.(currentUser?.id, (vol) => {
      setProfile(vol);
      setLoading(false);
    }) || (() => setLoading(false));

    // 2. Assigned task
    const unsubTask = requestService.subscribeToVolunteerAssignedTask?.(currentUser?.id || 'vol_1', (task) => {
      setAssignedTask(task);
    }) || (() => {});

    // 3. Official advisories
    const unsubUpdates = updateService.subscribeToUpdates?.((u) => setUpdates(u)) || (() => {});

    return () => {
      unsubVol();
      unsubTask();
      unsubUpdates();
    };
  }, [currentUser?.id]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await volunteerService.registerVolunteer({
        userId: currentUser.id,
        name: currentUser.name || 'Volunteer Hero',
        phone: currentUser.phone || '9876543210',
        type: regType,
        organization: org,
        location: { lat: 11.2588, lng: 75.7804 }
      });
    } catch (err) {
      alert('Registration failed.');
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;
    try {
      await volunteerService.setVolunteerAvailability(profile.id, !profile.available);
    } catch (err) {
      alert('Could not update status');
    }
  };

  // Main task state transitions
  const handleTaskAction = async (newStatus, reason = '') => {
    if (!assignedTask) return;
    setActionLoading(true);
    try {
      await requestService.updateRequestStatus(assignedTask.id, newStatus, {
        volunteerId: profile?.id || currentUser?.id || 'vol_1',
        reason
      });
      setReasonModalOpen(false);
      setReasonText('');
    } catch (err) {
      alert('Task update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const openDeclineModal = () => {
    setReasonAction('declined');
    setReasonModalOpen(true);
  };

  const openCannotCompleteModal = () => {
    setReasonAction('cannot_complete');
    setReasonModalOpen(true);
  };

  const openDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  if (loading) return <LoadingState message="Connecting to volunteer grid..." />;

  // Case 1: Registration Required
  if (!profile) {
    return (
      <div className="max-w-lg mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
            <HeartHandshake className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Volunteer Enlistment</h3>
            <p className="text-xs text-slate-400">Join the active emergency relief force</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Service Specialization</label>
            <select
              value={regType}
              onChange={(e) => setRegType(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            >
              <option value="medical">Medical Assistance (Doctor / Nurse / EMT)</option>
              <option value="rescue">Rescue Operations (Boats / Swimming / Physical)</option>
              <option value="resource">Resource Logistics (Food / Water / Supplies)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Affiliated Organization (Optional)</label>
            <input
              type="text"
              placeholder="E.g., Red Cross, Kerala Flood Volunteers"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-xl transition shadow-lg shadow-emerald-600/30"
          >
            Submit Application
          </button>
        </form>
      </div>
    );
  }

  // Case 2: Pending Approval
  if (!profile.approved) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4 shadow-xl">
        <div className="h-14 w-14 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
          <AlertOctagon className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Application Pending Verification</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Disaster Control HQ is verifying your <span className="text-amber-400 font-semibold uppercase">{profile.type}</span> credentials. 
          Your dashboard will activate once approved by Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Volunteer Profile Header & Availability Toggle */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{profile.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                Approved
              </span>
            </div>
            <p className="text-xs text-slate-400 capitalize">{profile.type} Specialist • {profile.organization || 'Independent Relief Worker'}</p>
          </div>
        </div>

        <button
          onClick={handleToggleAvailability}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            profile.available
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Power className={`h-4 w-4 ${profile.available ? 'text-emerald-400' : 'text-slate-500'}`} />
          Status: {profile.available ? 'Ready for Dispatch (ON)' : 'Off Duty (OFF)'}
        </button>
      </div>

      {/* Main Task Dispatch & Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Active Task Dispatch</h3>
            {assignedTask && <StatusBadge status={assignedTask.status} />}
          </div>

          {assignedTask && profile.available ? (
            /* ACTIVE TASK DISPATCH CARD */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    {assignedTask.urgency || 'HIGH'} PRIORITY DISPATCH
                  </span>
                  <h4 className="text-2xl font-black text-white capitalize mt-1">
                    {assignedTask.type} Assistance Request
                  </h4>
                </div>
                <button
                  onClick={() => openDirections(assignedTask.location.lat, assignedTask.location.lng)}
                  className="px-3 py-1.5 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-600/30 flex items-center gap-1.5 transition"
                >
                  <Navigation className="h-3.5 w-3.5" /> Map
                </button>
              </div>

              {/* Task Details */}
              <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl text-xs text-slate-300 border border-slate-700/40">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400"><Users className="h-4 w-4 text-slate-400" /> People in need:</span>
                  <span className="text-white font-bold text-sm">{assignedTask.peopleCount} Persons</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400"><MapPin className="h-4 w-4 text-rose-400" /> Coordinates:</span>
                  <span className="font-mono text-slate-200">{assignedTask.location?.lat.toFixed(4)}, {assignedTask.location?.lng.toFixed(4)}</span>
                </div>

                {assignedTask.reporterPhone && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400"><Phone className="h-4 w-4 text-emerald-400" /> Contact Phone:</span>
                    <a href={`tel:${assignedTask.reporterPhone}`} className="text-sky-400 font-semibold hover:underline">
                      {assignedTask.reporterPhone}
                    </a>
                  </div>
                )}

                <div className="pt-2.5 border-t border-slate-700/50">
                  <span className="text-slate-400 block mb-1">Citizen Situation Report:</span>
                  <p className="text-slate-100 text-sm leading-relaxed">{assignedTask.description}</p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2">
                {/* 1. STATE: PENDING OR ASSIGNED -> ACCEPT OR DECLINE */}
                {(assignedTask.status === 'pending' || assignedTask.status === 'assigned') && (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => handleTaskAction('accepted')}
                      disabled={actionLoading}
                      className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                    >
                      <Check className="h-4 w-4" /> Accept Task
                    </button>
                    <button
                      onClick={openDeclineModal}
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold uppercase rounded-xl border border-slate-700 transition"
                    >
                      <XCircle className="h-4 w-4 inline mr-1" /> Decline
                    </button>
                  </div>
                )}

                {/* 2. STATE: ACCEPTED -> START OPERATIONS */}
                {assignedTask.status === 'accepted' && (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => handleTaskAction('in_progress')}
                      disabled={actionLoading}
                      className="w-full sm:flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition"
                    >
                      <Play className="h-4 w-4" /> Begin Operation & Travel to Site
                    </button>
                    <button
                      onClick={openCannotCompleteModal}
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-4 py-3 bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 text-xs font-bold uppercase rounded-xl border border-rose-800/40 transition"
                    >
                      Cannot Complete
                    </button>
                  </div>
                )}

                {/* 3. STATE: IN PROGRESS -> COMPLETE OR CANNOT COMPLETE */}
                {assignedTask.status === 'in_progress' && (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => handleTaskAction('resolved')}
                      disabled={actionLoading}
                      className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Mark Task Successfully Resolved
                    </button>
                    <button
                      onClick={openCannotCompleteModal}
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-4 py-3 bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 text-xs font-bold uppercase rounded-xl border border-rose-800/40 transition"
                    >
                      Cannot Complete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              title={profile.available ? "Standing by for dispatches" : "Availability is OFF"}
              message={
                profile.available
                  ? `You are on active standby as a ${profile.type} specialist. When requests in your sector arrive, they will appear here automatically.`
                  : "Turn your availability toggle ON in the top header to receive emergency task dispatches."
              }
            />
          )}
        </div>

        {/* Emergency Field Advisories */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Control HQ Advisories</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            {updates.length === 0 ? (
              <p className="text-xs text-slate-500">No active advisories.</p>
            ) : (
              updates.map((u) => (
                <div key={u.id} className="text-xs border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{u.title}</span>
                    <StatusBadge status={u.priority} />
                  </div>
                  <p className="text-slate-400 leading-relaxed">{u.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Decline / Cannot Complete Reason Modal */}
      <Modal 
        isOpen={reasonModalOpen} 
        onClose={() => setReasonModalOpen(false)} 
        title={reasonAction === 'declined' ? 'Decline Task Dispatch' : 'Report Inability to Complete'}
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              {reasonAction === 'declined' 
                ? 'Declining will release this task immediately so the system can reassign another nearby volunteer.' 
                : 'Reporting inability to complete will return this request to the matching queue.'}
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Reason / Notes (Optional)</label>
            <textarea
              rows="3"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="E.g., Road blocked by tree, already occupied with emergency patient, specialized gear needed..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            onClick={() => handleTaskAction(reasonAction, reasonText)}
            disabled={actionLoading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-xl transition shadow-lg shadow-rose-600/30"
          >
            {reasonAction === 'declined' ? 'Confirm Decline & Reassign' : 'Submit & Release Task'}
          </button>
        </div>
      </Modal>
    </div>
  );
}