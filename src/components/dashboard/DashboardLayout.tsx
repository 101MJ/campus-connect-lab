import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import { Loader2 } from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Set up loading timeout
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.error('Authentication check timeout');
        navigate('/signin', { 
          replace: true,
          state: { from: location.pathname }
        });
      }, 10000); // 10 second timeout
      
      setLoadingTimeout(timeout);
      
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
    
    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [loading, navigate, location.pathname]);

  // Redirect to sign in if not authenticated - keep this simple
  useEffect(() => {
    if (!loading) {
      if (loadingTimeout) clearTimeout(loadingTimeout);
      
      if (!user) {
        navigate('/signin', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-collabCorner-purple" />
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
