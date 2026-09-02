import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import CitizenDashboard from './pages/Citizen/CitizenDashboard';
import VolunteerDashboard from './pages/Volunteer/VolunteerDashboard';
import NDRFDashboard from './pages/NDRF/NDRFDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import { LoadingState } from './components/StateFeedback';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <LoadingState message="Authenticating session..." />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  return children;
};

export default function App() {
  const { currentUser, userRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-rose-600 selection:text-white">
      {currentUser && <Navbar />}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        <Routes>
          <Route path="/login" element={currentUser ? <Navigate to={`/${userRole}`} replace /> : <Login />} />
          
          <Route path="/citizen" element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <CitizenDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/volunteer" element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <VolunteerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/ndrf" element={
            <ProtectedRoute allowedRoles={['ndrf']}>
              <NDRFDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}