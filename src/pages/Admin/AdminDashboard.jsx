import React, { useState, useEffect } from 'react';
import * as disasterService from '../../services/disasters';
import * as requestService from '../../services/requests';
import * as volunteerService from '../../services/volunteers';
import * as campService from '../../services/camps';
import * as resourceService from '../../services/resources';
import * as updateService from '../../services/updates';
import StatusBadge from '../../components/StatusBadge';
import ResourceCard from '../../components/ResourceCard';
import Modal from '../../components/Modal';
import { ShieldAlert, Users, HeartHandshake, Tent, Package, Radio, Plus, Check, X, Megaphone, Flame } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [disaster, setDisaster] = useState(null);
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [camps, setCamps] = useState([]);
  const [resourceCamps, setResourceCamps] = useState([]);
  const [updates, setUpdates] = useState([]);

  // Admin Modals
  const [disasterModal, setDisasterModal] = useState(false);
  const [campModal, setCampModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);

  // Form states
  const [dName, setDName] = useState('Kozhikode Monsoon Flood');
  const [dType, setDType] = useState('Flood');
  const [dDesc, setDDesc] = useState('Major inundation across coastal zones');

  const [cName, setCName] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [cFacilities, setCFacilities] = useState('Food, Water, First Aid, Beds');

  const [uTitle, setUTitle] = useState('');
  const [uMessage, setUMessage] = useState('');
  const [uPriority, setUPriority] = useState('important');

  useEffect(() => {
    // Live Firebase Subscriptions
    const unsubD = disasterService.subscribeToActiveDisaster?.(setDisaster) || (() => {});
    const unsubR = requestService.subscribeToAllRequests?.(setRequests) || (() => {});
    const unsubV = volunteerService.subscribeToAllVolunteers?.(setVolunteers) || (() => {});
    const unsubC = campService.subscribeToReliefCamps?.(setCamps) || (() => {});
    const unsubRes = resourceService.subscribeToResourceCamps?.(setResourceCamps) || (() => {});
    const unsubU = updateService.subscribeToUpdates?.(setUpdates) || (() => {});

    return () => {
      unsubD(); unsubR(); unsubV(); unsubC(); unsubRes(); unsubU();
    };
  }, []);

  const handleDeclareDisaster = async (e) => {
    e.preventDefault();
    try {
      await disasterService.createDisaster({ name: dName, type: dType, description: dDesc, status: 'active' });
      setDisasterModal(false);
    } catch (err) {
      alert('Could not declare disaster.');
    }
  };

  const handleApproveVolunteer = async (id, approve) => {
    try {
      if (approve) await volunteerService.approveVolunteer(id);
      else await volunteerService.rejectVolunteer(id);
    } catch (err) {
      alert('Approval update failed.');
    }
  };

  const handleCreateCamp = async (e) => {
    e.preventDefault();
    try {
      await campService.createReliefCamp({
        name: cName,
        address: cAddress,
        facilities: cFacilities,
        location: { lat: 11.2588, lng: 75.7804 },
        status: 'open'
      });
      setCampModal(false);
      setCName('');
      setCAddress('');
    } catch (err) {
      alert('Failed to create relief camp.');
    }
  };

  const handlePublishUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateService.publishUpdate({
        title: uTitle,
        message: uMessage,
        priority: uPriority,
        publishedBy: 'Disaster HQ'
      });
      setUpdateModal(false);
      setUTitle('');
      setUMessage('');
    } catch (err) {
      alert('Failed to publish update.');
    }
  };

  const handleUpdateStock = async (campId, item, delta) => {
    try {
      await resourceService.updateResourceStock(campId, item, delta);
    } catch (err) {
      alert('Failed to update stock count.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Disaster Control HQ</span>
          <h2 className="text-xl font-black text-white">{disaster?.name || 'No Active Emergency Declared'}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDisasterModal(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
          >
            <Flame className="h-4 w-4" /> Declare Disaster
          </button>
          <button
            onClick={() => setCampModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Camp
          </button>
          <button
            onClick={() => setUpdateModal(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
          >
            <Megaphone className="h-4 w-4" /> Broadcast Update
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400">Total Active Requests</span>
          <p className="text-2xl font-black text-rose-400 mt-1">{requests.filter((r) => r.status !== 'resolved').length}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400">Available Volunteers</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{volunteers.filter((v) => v.approved && v.available).length}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400">Open Relief Camps</span>
          <p className="text-2xl font-black text-sky-400 mt-1">{camps.filter((c) => c.status === 'open').length}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400">Pending Approvals</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{volunteers.filter((v) => !v.approved).length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-bold uppercase tracking-wider gap-6">
        {['overview', 'requests', 'volunteers', 'resources'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 transition border-b-2 ${
              activeTab === tab ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Overview / Live Monitor */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Request Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase">Live Request Stream</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {requests.slice(0, 8).map((req) => (
                <div key={req.id} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 capitalize">{req.type}</span>
                      {req.isRedZone && <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">RED ZONE</span>}
                    </div>
                    <p className="text-slate-400 line-clamp-1 mt-0.5">{req.description}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Volunteer Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase">Volunteer Verifications</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {volunteers.filter((v) => !v.approved).map((vol) => (
                <div key={vol.id} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{vol.name}</h4>
                    <p className="text-slate-400 capitalize">{vol.type} • {vol.phone}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleApproveVolunteer(vol.id, true)}
                      className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleApproveVolunteer(vol.id, false)}
                      className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30"
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {volunteers.filter((v) => !v.approved).length === 0 && (
                <p className="text-xs text-slate-500 py-6 text-center">No pending volunteer applications.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Resources */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resourceCamps.map((camp) => (
            <ResourceCard key={camp.id} camp={camp} onUpdateStock={handleUpdateStock} canEdit={true} />
          ))}
        </div>
      )}

      {/* Tab: Requests Table */}
      {activeTab === 'requests' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/50 uppercase text-[11px] font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Zone</th>
                <th className="p-3">Details</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-semibold text-white capitalize">{r.type}</td>
                  <td className="p-3">{r.isRedZone ? <span className="text-rose-400 font-bold">Red Zone</span> : 'Standard'}</td>
                  <td className="p-3 max-w-xs truncate">{r.description}</td>
                  <td className="p-3"><StatusBadge status={r.status} /></td>
                  <td className="p-3 text-slate-400">{r.assignedNdrfTeamId ? 'NDRF Unit' : r.assignedVolunteerId || 'Auto Searching'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Declare Disaster Modal */}
      <Modal isOpen={disasterModal} onClose={() => setDisasterModal(false)} title="Declare Active Disaster Zone">
        <form onSubmit={handleDeclareDisaster} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Disaster Name</label>
            <input type="text" value={dName} onChange={(e) => setDName(e.target.value)} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Disaster Classification</label>
            <select value={dType} onChange={(e) => setDType(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white">
              <option value="Flood">Flood</option>
              <option value="Landslide">Landslide</option>
              <option value="Cyclone">Cyclone</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Situation Overview</label>
            <textarea rows="3" value={dDesc} onChange={(e) => setDDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl">
            Activate Emergency Protocol
          </button>
        </form>
      </Modal>

      {/* Relief Camp Modal */}
      <Modal isOpen={campModal} onClose={() => setCampModal(false)} title="Register Relief Camp">
        <form onSubmit={handleCreateCamp} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Camp Center Name</label>
            <input type="text" placeholder="E.g., St. Joseph School Shelter" value={cName} onChange={(e) => setCName(e.target.value)} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Address / Landmark</label>
            <input type="text" placeholder="E.g., East Hill Road" value={cAddress} onChange={(e) => setCAddress(e.target.value)} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Facilities</label>
            <input type="text" value={cFacilities} onChange={(e) => setCFacilities(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl">
            Open Relief Camp
          </button>
        </form>
      </Modal>

      {/* Broadcast Update Modal */}
      <Modal isOpen={updateModal} onClose={() => setUpdateModal(false)} title="Broadcast Official Advisory">
        <form onSubmit={handlePublishUpdate} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Advisory Title</label>
            <input type="text" placeholder="E.g., Dam Shutter Opening Warning" value={uTitle} onChange={(e) => setUTitle(e.target.value)} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Priority</label>
            <select value={uPriority} onChange={(e) => setUPriority(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white">
              <option value="emergency">Emergency / Evacuation</option>
              <option value="important">Important Advisory</option>
              <option value="normal">General Information</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Broadcast Message</label>
            <textarea rows="3" value={uMessage} onChange={(e) => setUMessage(e.target.value)} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl">
            Transmit Broadcast
          </button>
        </form>
      </Modal>
    </div>
  );
}