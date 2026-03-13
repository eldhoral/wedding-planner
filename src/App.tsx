import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './Layout';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './pages/Login';
import SetupWedding from './pages/SetupWedding';
import Overview from './pages/Overview';
import Calendar from './pages/Calendar';
import Budget from './pages/Budget';
import Savings from './pages/Savings';
import Vendors from './pages/Vendors';
import Recommendations from './pages/Recommendations';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, weddingId } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-wedding-bg text-wedding-accent">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!weddingId) {
    return <SetupWedding />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="budget" element={<Budget />} />
            <Route path="savings" element={<Savings />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="recommendations" element={<Recommendations />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
