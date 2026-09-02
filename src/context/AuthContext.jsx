// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = authService.onAuthChange((user, role) => {
      setCurrentUser(user);
      setUserRole(role || user?.role || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (name, phone, password, role) => {
    setLoading(true);
    try {
      const { user, role: assignedRole } = await authService.loginUser(name, phone, password, role);
      setCurrentUser(user);
      setUserRole(assignedRole);
      return { user, role: assignedRole };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logoutUser();
    setCurrentUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userRole, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);