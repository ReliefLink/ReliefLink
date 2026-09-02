// src/services/requests.js

let requests = [
  {
    id: 'req_101',
    disasterId: 'dis_1',
    reporterId: 'usr_citizen',
    reporterPhone: '9876543210',
    type: 'medical',
    peopleCount: 3,
    description: 'Elderly patient with oxygen shortage, stranded on second floor.',
    location: { lat: 11.2588, lng: 75.7804 },
    urgency: 'high',
    status: 'assigned',
    isRedZone: false,
    assignedVolunteerId: 'vol_1',
    declinedBy: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'req_102',
    disasterId: 'dis_1',
    reporterId: 'usr_citizen_2',
    reporterPhone: '9876543212',
    type: 'rescue',
    peopleCount: 5,
    description: 'Rapid water level rise near riverbank.',
    location: { lat: 11.2512, lng: 75.7723 },
    urgency: 'critical',
    status: 'assigned',
    isRedZone: true,
    assignedNdrfTeamId: 'ndrf_1',
    declinedBy: [],
    createdAt: new Date().toISOString()
  }
];

const requestListeners = new Set();
const notify = () => requestListeners.forEach((cb) => cb([...requests]));

export const subscribeToAllRequests = (callback) => {
  callback([...requests]);
  requestListeners.add(callback);
  return () => requestListeners.delete(callback);
};

export const subscribeToCitizenActiveRequest = (userId, callback) => {
  const handler = (allReqs) => {
    const active = allReqs.find(
      (r) => (r.reporterId === userId || userId === 'demo_user' || r.reporterId === 'usr_citizen') &&
             r.status !== 'resolved' && r.status !== 'cancelled'
    );
    callback(active || null);
  };
  handler(requests);
  requestListeners.add(handler);
  return () => requestListeners.delete(handler);
};

// Volunteer sees their assigned task
export const subscribeToVolunteerAssignedTask = (volunteerId, callback) => {
  const handler = (allReqs) => {
    // Matches if specifically assigned OR pending non-redzone for demo
    const task = allReqs.find(
      (r) => !r.isRedZone &&
             r.status !== 'resolved' &&
             r.status !== 'cancelled' &&
             (!r.declinedBy || !r.declinedBy.includes(volunteerId))
    );
    callback(task || null);
  };
  handler(requests);
  requestListeners.add(handler);
  return () => requestListeners.delete(handler);
};

export const createRequest = async (data) => {
  const newReq = {
    id: `req_${Date.now()}`,
    ...data,
    status: 'pending',
    isRedZone: data.isRedZone || false,
    declinedBy: [],
    createdAt: new Date().toISOString()
  };
  requests.unshift(newReq);
  notify();
  return newReq;
};

export const cancelRequest = async (requestId) => {
  const req = requests.find((r) => r.id === requestId);
  if (req) {
    req.status = 'cancelled';
    notify();
  }
};

// Update task status (Accept, Decline, Start, Complete, Cannot Complete)
export const updateRequestStatus = async (requestId, status, extra = {}) => {
  const req = requests.find((r) => r.id === requestId);
  if (!req) return;

  if (status === 'declined' || status === 'cannot_complete') {
    // Record volunteer who declined so it's not reassigned to them
    if (!req.declinedBy) req.declinedBy = [];
    if (extra.volunteerId) req.declinedBy.push(extra.volunteerId);

    // Reset status to pending and remove assigned volunteer for reassignment
    req.status = 'pending';
    req.assignedVolunteerId = null;
    req.declineReason = extra.reason || 'Volunteer unavailable / declined';
  } else {
    req.status = status;
    if (status === 'accepted' && extra.volunteerId) {
      req.assignedVolunteerId = extra.volunteerId;
    }
    if (status === 'resolved') {
      req.resolvedAt = new Date().toISOString();
    }
  }

  notify();
  return req;
};