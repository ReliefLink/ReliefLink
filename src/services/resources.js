let resourceCamps = [
  {
    id: 'rc_1',
    disasterId: 'dis_1',
    name: 'Central Logistics Depot',
    address: 'Medical College Rd, Kozhikode',
    contact: '+91 9447000001',
    status: 'operational',
    location: { lat: 11.274, lng: 75.795 },
    resources: {
      food: 150,
      water: 240,
      blankets: 80,
      medicalSupplies: 15,
      rescueEquipment: 12
    }
  }
];

const resListeners = new Set();
const notify = () => resListeners.forEach((cb) => cb([...resourceCamps]));

export const subscribeToResourceCamps = (callback) => {
  callback([...resourceCamps]);
  resListeners.add(callback);
  return () => resListeners.delete(callback);
};

export const updateResourceStock = async (campId, item, delta) => {
  const camp = resourceCamps.find((c) => c.id === campId);
  if (camp && camp.resources && camp.resources[item] !== undefined) {
    camp.resources[item] = Math.max(0, camp.resources[item] + delta);
    notify();
  }
};