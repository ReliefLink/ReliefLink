let volunteers = [
  {
    id: 'vol_1',
    userId: 'usr_vol_1',
    name: 'Dr. Rahul Sharma',
    phone: '9876543210',
    type: 'medical',
    organization: 'Red Cross Medical Wing',
    approved: true,
    available: true,
    location: { lat: 11.2588, lng: 75.7804 }
  },
  {
    id: 'vol_2',
    userId: 'usr_vol_2',
    name: 'Ananya Nair',
    phone: '9876543211',
    type: 'rescue',
    organization: 'Kerala Kayak Rescue Team',
    approved: false,
    available: false,
    location: { lat: 11.2688, lng: 75.7904 }
  }
];

const volListeners = new Set();
const notify = () => volListeners.forEach((cb) => cb([...volunteers]));

export const subscribeToAllVolunteers = (callback) => {
  callback([...volunteers]);
  volListeners.add(callback);
  return () => volListeners.delete(callback);
};

export const subscribeToVolunteerProfile = (userId, callback) => {
  const handler = (allVols) => {
    const profile = allVols.find((v) => v.userId === userId) || allVols[0];
    callback(profile || null);
  };
  handler(volunteers);
  volListeners.add(handler);
  return () => volListeners.delete(handler);
};

export const registerVolunteer = async (data) => {
  const newVol = {
    id: `vol_${Date.now()}`,
    ...data,
    approved: false,
    available: false,
    createdAt: new Date().toISOString()
  };
  volunteers.push(newVol);
  notify();
  return newVol;
};

export const setVolunteerAvailability = async (id, available) => {
  const v = volunteers.find((vol) => vol.id === id);
  if (v) {
    v.available = available;
    notify();
  }
};

export const approveVolunteer = async (id) => {
  const v = volunteers.find((vol) => vol.id === id);
  if (v) {
    v.approved = true;
    notify();
  }
};

export const rejectVolunteer = async (id) => {
  volunteers = volunteers.filter((v) => v.id !== id);
  notify();
};