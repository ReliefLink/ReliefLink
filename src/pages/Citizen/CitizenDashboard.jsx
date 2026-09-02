// src/pages/Citizen/CitizenDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as requestService from '../../services/requests';
import * as campService from '../../services/camps';
import * as updateService from '../../services/updates';
import * as disasterService from '../../services/disasters';
import CitizenRequestForm from '../../components/CitizenRequestForm';
import StatusBadge from '../../components/StatusBadge';
import CampCard from '../../components/CampCard';
import { LoadingState, EmptyState } from '../../components/StateFeedback';
import { AlertCircle, Ban, CheckCircle2, Radio, MapPin, Users, ShieldAlert } from 'lucide-react';

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const [activeRequest, setActiveRequest] = useState(null);
  const [camps, setCamps] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 1. Subscribe to Active Disaster
    const unsubDisaster = disasterService.subscribeToActiveDisaster?.(setDisaster) || (() => {});
    
    // 2. Subscribe to this Citizen's Active Request
    const unsubReq = requestService.subscribeToCitizenActiveRequest?.(currentUser?.id, (req) => {
      setActiveRequest(req);
      setLoading(false);
    }) || (() => setLoading(false));

    // 3. Subscribe to Relief Camps
    const unsubCamps = campService.subscribeToReliefCamps?.(setCamps) || (() => {});

    // 4. Subscribe to Emergency Advisories
    const unsubUpdates = updateService.subscribeToUpdates?.(setUpdates) || (() => {});

    return () => {
      unsubDisaster();
      unsubReq();
      unsubCamps();
      unsubUpdates();
    };
  }, [currentUser?.id]);

  const handleCreateRequest = async (formData) => {
    setSubmitting(true);
    try {
      await requestService.createRequest({
        ...formData,
        reporterId: currentUser.id,
        reporterPhone: currentUser.phone || '9876543210'
      });
    } catch (err) {
      alert(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm('Are you sure you want to cancel this assistance request?')) return;
    try {
      await requestService.cancelRequest(activeRequest.id);
    } catch (err) {
      alert('Failed to cancel request.');
    }
  };

  const requestSteps = ['pending', 'assigned', 'in_progress', 'resolved'];
  const currentStepIndex = activeRequest ? requestSteps.indexOf(activeRequest.status) : 0;

  if (loading) return <LoadingState message="Connecting to emergency response mesh..." />;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Active Disaster Alert Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-600/30">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{disaster?.name || 'Kozhikode Flood Emergency Protocol'}</h2>
            <p className="text-xs text-slate-400">{disaster?.description || 'Active Red Zones in effect. Standby for rescue dispatches.'}</p>
          </div>
        </div>
        <div>
          <span className="text-xs px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full font-semibold uppercase">
            {disaster?.type || 'Flood Emergency'}
          </span>
        </div>
      </div>

      {/* 2. Official Emergency Broadcast Feed */}
      {updates.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Radio className="h-4 w-4 animate-pulse" /> Official Control Center Broadcasts
          </div>
          <div className="space-y-2">
            {updates.slice(0, 2).map((u) => (
              <div key={u.id} className="text-xs text-slate-300 flex items-start gap-2">
                <StatusBadge status={u.priority || 'important'} />
                <span className="font-semibold text-slate-200">{u.title}:</span>
                <span className="text-slate-400">{u.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Content: Either Active Request Tracker OR New Request Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeRequest ? (
            /* ACTIVE REQUEST TRACKER */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Assistance Request Reference #{activeRequest.id.slice(-6)}</span>
                  <h3 className="text-xl font-bold text-white uppercase mt-0.5">{activeRequest.type} Assistance</h3>
                </div>
                <StatusBadge status={activeRequest.status} />
              </div>

              {/* Status Stepper */}
              <div className="grid grid-cols-4 gap-2 text-center py-2">
                {requestSteps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        isDone ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'
                      } ${isCurrent ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 animate-pulse' : ''}`}>
                        {isDone ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-semibold mt-2 capitalize ${isDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {step.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {activeRequest.isRedZone && (
                <div className="p-3.5 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
                  <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
                  Your coordinates fall inside a designated high-hazard Red Zone. Handled exclusively by NDRF Tactical Command.
                </div>
              )}

              <div className="bg-slate-800/40 rounded-xl p-4 space-y-2.5 text-xs text-slate-300 border border-slate-700/40">
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Persons:</span>
                  <span className="font-semibold text-white">{activeRequest.peopleCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Coordinates:</span>
                  <span className="font-mono text-slate-200">{activeRequest.location.lat.toFixed(4)}, {activeRequest.location.lng.toFixed(4)}</span>
                </div>
                <div className="pt-2 border-t border-slate-700/50">
                  <span className="text-slate-400 block mb-1">Details:</span>
                  <p className="text-slate-200">{activeRequest.description}</p>
                </div>
              </div>

              <button
                onClick={handleCancelRequest}
                className="w-full py-2.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <Ban className="h-4 w-4" /> Cancel This Request
              </button>
            </div>
          ) : (
            /* NEW REQUEST FORM */
            <CitizenRequestForm 
              onSubmit={handleCreateRequest} 
              isSubmitting={submitting} 
              defaultDisasterId={disaster?.id} 
            />
          )}
        </div>

        {/* 4. Nearby Relief Camps */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Nearby Relief Centers</h3>
          {camps.length === 0 ? (
            <EmptyState title="No active camps" message="Relief centers will appear here as soon as they open." />
          ) : (
            camps.map((camp) => <CampCard key={camp.id} camp={camp} />)
          )}
        </div>
      </div>
    </div>
  );
}