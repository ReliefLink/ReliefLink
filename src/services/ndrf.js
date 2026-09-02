let redZones = [
  {
    id: 'rz_1',
    disasterId: 'dis_1',
    name: 'Sector Alpha - Canal Basin',
    severity: 'CRITICAL',
    description: 'Water level > 4.5ft. High current flood zone.',
    assignedNdrfTeamId: 'ndrf_1',
    status: 'active'
  }
];

export const subscribeToNdrfRequests = (teamId, callback) => {
  callback([
    {
      id: 'ndrf_req_102',
      disasterId: 'dis_1',
      reporterId: 'citizen_redzone_1',
      type: 'rescue',
      peopleCount: 5,
      description: 'Severe waterlogging in Sector Red Zone Alpha. 5 people stranded on rooftop.',
      location: { lat: 11.2512, lng: 75.7723 },
      urgency: 'critical',
      status: 'assigned',
      isRedZone: true
    }
  ]);
  return () => {};
};

export const subscribeToAssignedZones = (teamId, callback) => {
  callback(redZones);
  return () => {};
};

export const submitSituationReport = async (data) => {
  console.log('[NDRF SitRep Filed]:', data);
  return { success: true, ...data };
};

export const requestNdrfResources = async (data) => {
  console.log('[NDRF Logistics Request]:', data);
  return { success: true, ...data };
};