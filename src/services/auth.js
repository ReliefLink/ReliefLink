// src/services/auth.js

export const onAuthChange = (callback) => {
  const savedUser = localStorage.getItem('dcp_user');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      callback(user, user.role);
    } catch (e) {
      callback(null, null);
    }
  } else {
    callback(null, null);
  }
  return () => {};
};

export const loginUser = async (name, phone, password, selectedRole = 'citizen') => {
  const user = {
    id: `usr_${selectedRole}_${Date.now()}`,
    name: name || `${selectedRole.toUpperCase()} User`,
    phone,
    role: selectedRole,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('dcp_user', JSON.stringify(user));
  return { user, role: user.role };
};

export const logoutUser = async () => {
  localStorage.removeItem('dcp_user');
};