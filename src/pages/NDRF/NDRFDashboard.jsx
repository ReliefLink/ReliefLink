import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as ndrfService from '../../services/ndrf';
import * as requestService from '../../services/requests';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { LoadingState, EmptyState } from '../../components/StateFeedback';
import { Shield, AlertTriangle, FileText, CheckCircle2, PackagePlus, Radio, Users } from 'lucide-react';
// Person 1 imports DisasterMap:
import DisasterMap from '../../maps/DisasterMap.jsx';

// Inside NDRF Dashboard JSX:
<div className="my-6 rounded-lg overflow-hidden border">
  <DisasterMap
    role="ndrf"
    redZones={assignedRedZones || []}
    requests={ndrfRequests || []}
    reliefCamps={resourceCamps || []}
    height="450px"
  />
</div>
export default function NDRFDashboard() {
  const { currentUser } = useAuth();
  const [redZones, setRedZones] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [sitRepOpen, setSitRepOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [rescuedCount, setRescuedCount] = useState(0);
  const [roadsCleared, setRoadsCleared] = useState('');
  const [hazardNotes, setHazardNotes] = useState('');
  const [reqSupplies, setReqSupplies] = useState('');

  useEffect(() => {
    // 1. Subscribe to NDRF Red Zone requests directly (Person 2's secured service)
    const unsubReqs = ndrfService.subscribeToNdrfRequests?.(currentUser.id, (reqs) => {
      setRequests(reqs);
      setLoading(false);
    }) || (() => setLoading(false));

    // 2. Subscribe to assigned Red Zones
    const unsubZones = ndrfService.subscribeToAssignedZones?.(currentUser.id, (z) => {
      setRedZones(z);
    }) || (() => {});

    return () => {
      unsubReqs();
      unsubZones();
    };
  }, [currentUser.id]);

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await requestService.updateRequestStatus(requestId, status, { ndrfTeamId: currentUser.id });
    } catch (err) {
      alert('Status update failed');
    }
  };

  const handleSendSitRep = async (e) => {
    e.preventDefault();
    try {
      await ndrfService.submitSituationReport({
        teamId: currentUser.id,
        peopleRescued: Number(rescuedCount),
        roadsCleared,
        hazardNotes,
        timestamp: new Date().toISOString()
      });
      setSitRepOpen(false);
      alert('Situation Report broadcasted to Command HQ.');
    } catch (err) {
      alert('Failed to send report.');
    }
  };

  const handleRequestResources = async (e) => {
    e.preventDefault();
    try {
      await ndrfService.requestNdrfResources({
        teamId: currentUser.id,
        requestedSupplies: reqSupplies,
        urgency: 'critical',
        timestamp: new Date().toISOString()
      });
      setResourceOpen(false);
      alert('Resource request logged at central supply depot.');
    } catch (err) {
      alert('Failed to log request.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-amber-950/20 border border-amber-800/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">NDRF Tactical Command Unit</h2>
            <p className="text-xs text-amber-400/80">Designated Sector Red Zone Controller</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSitRepOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <FileText className="h-4 w-4" /> Submit SitRep
          </button>
          <button
            onClick={() => setResourceOpen(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-600/30"
          >
            <PackagePlus className="h-4 w-4" /> Request Supplies
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Red Zone Requests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Red Zone Evacuation Tasks ({requests.length})</h3>
            <span className="text-xs text-rose-400 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> High Hazard Priority</span>
          </div>

          {requests.length === 0 ? (
            <EmptyState title="No active Red Zone tasks" message="All sector requests resolved or none reported." />
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">Red Zone Distress</span>
                      <h4 className="text-base font-bold text-white capitalize">{req.type} Extraction</h4>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-800/50 p-3 rounded-lg">
                    <p className="font-semibold text-slate-200">{req.description}</p>
                    <div className="flex items-center justify-between text-slate-400 pt-1">
                      <span>People stranded: {req.peopleCount}</span>
                      <span>Location: {req.location?.lat.toFixed(4)}, {req.location?.lng.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {req.status !== 'in_progress' && req.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'in_progress')}
                        className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition"
                      >
                        Deploy Unit
                      </button>
                    )}
                    {req.status === 'in_progress' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'resolved')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Extraction Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Sectors Overview */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Sector Boundary Status</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            {redZones.length === 0 ? (
              <p className="text-xs text-slate-400">Sector Alpha (Active Red Zone)</p>
            ) : (
              redZones.map((z) => (
                <div key={z.id} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400">{z.name}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] uppercase font-bold">{z.severity || 'CRITICAL'}</span>
                  </div>
                  <p className="text-slate-300">{z.description || 'High flood risk basin area.'}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SitRep Modal */}
      <Modal isOpen={sitRepOpen} onClose={() => setSitRepOpen(false)} title="Submit Tactical Situation Report">
        <form onSubmit={handleSendSitRep} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Total People Rescued</label>
            <input
              type="number"
              value={rescuedCount}
              onChange={(e) => setRescuedCount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Roads & Access Cleared</label>
            <input
              type="text"
              placeholder="E.g., Highway 66 cleared up to bridge"
              value={roadsCleared}
              onChange={(e) => setRoadsCleared(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Water Levels & Hazard Info</label>
            <textarea
              rows="3"
              value={hazardNotes}
              onChange={(e) => setHazardNotes(e.target.value)}
              placeholder="E.g., Water rising 10cm/hr near canal, power lines down..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl">
            Transmit Report to HQ
          </button>
        </form>
      </Modal>

      {/* Resource Request Modal */}
      <Modal isOpen={resourceOpen} onClose={() => setResourceOpen(false)} title="Request Additional Supplies">
        <form onSubmit={handleRequestResources} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Needed Assets / Supplies</label>
            <textarea
              rows="3"
              value={reqSupplies}
              onChange={(e) => setReqSupplies(e.target.value)}
              placeholder="E.g., 2 Zodiac inflatable boats, 50 life jackets, trauma kits..."
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl">
            Submit Emergency Logistics Requisition
          </button>
        </form>
      </Modal>
    </div>
  );
}
