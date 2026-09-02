/**
 * Centralized API Adapter & Mock Bridge
 * Enables Person 1 to develop UI seamlessly before Person 2 completes Firebase listeners,
 * and automatically switches to live Firebase listeners once merged.
 */

// Simulated in-memory store for standalone frontend demo
let mockRequests = [
  {
    id: 'req_101',
    type: 'medical',
    peopleCount: 3,
    description: 'Elderly patient needs oxygen cylinder and medical transport.',
    location: { lat: 11.2588, lng: 75.7804 },
    urgency: 'high',
    status: 'pending',
    isRedZone: false,
    reporterId: 'usr_citizen'
  }
];

let mockCamps = [
  { id: 'camp_1', name: 'West Hill Relief Center', address: 'West Hill Polytechnic, Kozhikode', facilities: 'Food, Medical, Clean Water, 200 Beds', status: 'open', location: { lat: 11.289, lng: 75.772 } },
  { id: 'camp_2', name: 'Chevayur Community Shelter', address: 'Chevayur High School', facilities: 'Clean Water, First Aid, Infant Care', status: 'open', location: { lat: 11.272, lng: 75.812 } }
];

let mockResourceCamps = [
  { id: 'rc_1', name: 'Central Logistics Depot', address: 'Medical College Junction', contact: '+91 9447000001', resources: { food: 150, water: 240, blankets: 80, medicalSupplies: 15, rescueEquipment: 12 } }
];

let mockUpdates = [
  { id: 'up_1', title: 'Heavy Rainfall Alert', message: 'Red alert issued for coastal Kozhikode. Low lying areas advised to move to relief camps.', priority: 'emergency' }
];

export const fallbackAdapter = {
  subscribeToActiveDisaster: (cb) => {
    cb({ id: 'dis_1', name: 'Kozhikode Flood Emergency Protocol', type: 'Flood', description: 'Monsoon flooding along river basins.' });
    return () => {};
  },
  subscribeToCitizenActiveRequest: (userId, cb) => {
    cb(mockRequests.find((r) => r.reporterId === userId && r.status !== 'resolved' && r.status !== 'cancelled') || null);
    return () => {};
  },
  subscribeToReliefCamps: (cb) => { cb(mockCamps); return () => {}; },
  subscribeToResourceCamps: (cb) => { cb(mockResourceCamps); return () => {}; },
  subscribeToUpdates: (cb) => { cb(mockUpdates); return () => {}; },
  createRequest: async (data) => {
    const newReq = { id: `req_${Date.now()}`, ...data, status: 'pending', createdAt: new Date().toISOString() };
    mockRequests.push(newReq);
    return newReq;
  },
  cancelRequest: async (id) => {
    mockRequests = mockRequests.filter((r) => r.id !== id);
  }
};