import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import History from './pages/History';
import { UserProvider, useUser } from './context/UserContext';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();
  
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-zinc-950 text-white">Loading...</div>;
  
  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useUser();
  
  return (
    <Routes>
      <Route path="/onboarding" element={user ? <Navigate to="/" replace /> : <Onboarding />} />
      <Route path="/account" element={<Account />} />
      <Route path="/history" element={<History />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </Router>
    </UserProvider>
  );
}

export default App;
