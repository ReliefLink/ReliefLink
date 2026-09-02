let currentDisaster = {
  id: 'dis_1',
  name: 'Kozhikode Flood Emergency Protocol',
  type: 'Flood',
  description: 'Active Red Zones in effect across coastal and river basin areas.',
  status: 'active',
  startTime: new Date().toISOString()
};

const listeners = new Set();

export const subscribeToActiveDisaster = (callback) => {
  callback(currentDisaster);
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const createDisaster = async (data) => {
  currentDisaster = {
    id: `dis_${Date.now()}`,
    ...data,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  listeners.forEach((cb) => cb(currentDisaster));
  return currentDisaster;
};

export const endDisaster = async (disasterId) => {
  if (currentDisaster && currentDisaster.id === disasterId) {
    currentDisaster.status = 'ended';
    listeners.forEach((cb) => cb(currentDisaster));
  }
};