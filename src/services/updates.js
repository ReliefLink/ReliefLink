let updates = [
  {
    id: 'up_1',
    disasterId: 'dis_1',
    title: 'Monsoon Heavy Discharge Red Alert',
    message: 'Reservoir gates opened. Coastal Kozhikode residents advised to proceed to designated relief camps.',
    priority: 'emergency',
    publishedBy: 'Disaster HQ',
    createdAt: new Date().toISOString()
  },
  {
    id: 'up_2',
    disasterId: 'dis_1',
    title: 'Medical Kits Available at Sector 4',
    message: 'Insulin and trauma kits restocked at Chevayur Relief Center.',
    priority: 'important',
    publishedBy: 'Disaster HQ',
    createdAt: new Date().toISOString()
  }
];

const updateListeners = new Set();
const notify = () => updateListeners.forEach((cb) => cb([...updates]));

export const subscribeToUpdates = (callback) => {
  callback([...updates]);
  updateListeners.add(callback);
  return () => updateListeners.delete(callback);
};

export const publishUpdate = async (data) => {
  const newUpdate = {
    id: `up_${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString()
  };
  updates.unshift(newUpdate);
  notify();
  return newUpdate;
};