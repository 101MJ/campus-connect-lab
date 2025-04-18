
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      // Save the current path before redirecting
      if (location.pathname !== '/signin') {
        localStorage.setItem('lastVisitedPath', location.pathname);
      }
      navigate('/signin');
    }
  }, [user, loading, navigate, location.pathname]);

  // After successful authentication, redirect to the last visited path
  useEffect(() => {
    if (user && location.pathname === '/dashboard') {
      const lastPath = localStorage.getItem('lastVisitedPath');
      if (lastPath && lastPath !== '/signin' && lastPath !== '/signup') {
        navigate(lastPath);
      }
    }
  }, [user, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
