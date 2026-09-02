let camps = [
  {
    id: 'camp_1',
    disasterId: 'dis_1',
    name: 'West Hill Relief Camp',
    address: 'West Hill Polytechnic, Kozhikode',
    facilities: 'Food, Medical Clinic, Clean Water, Beds',
    contact: '+91 9447000111',
    status: 'open',
    location: { lat: 11.289, lng: 75.772 }
  },
  {
    id: 'camp_2',
    disasterId: 'dis_1',
    name: 'Chevayur Community Center',
    address: 'Chevayur Higher Secondary School',
    facilities: 'Clean Water, First Aid, Infant Care, Blankets',
    contact: '+91 9447000222',
    status: 'open',
    location: { lat: 11.272, lng: 75.812 }
  }
];

const campListeners = new Set();
const notify = () => campListeners.forEach((cb) => cb([...camps]));

export const subscribeToReliefCamps = (callback) => {
  callback([...camps]);
  campListeners.add(callback);
  return () => campListeners.delete(callback);
};

export const createReliefCamp = async (data) => {
  const newCamp = {
    id: `camp_${Date.now()}`,
    ...data,
    status: 'open',
    createdAt: new Date().toISOString()
  };
  camps.push(newCamp);
  notify();
  return newCamp;
};