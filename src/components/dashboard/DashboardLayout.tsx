
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  
  // Check Supabase connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Simple query to check connection
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionError(true);
          toast.error('Could not connect to database. Please try again later.');
        }
      } catch (err) {
        console.error('Supabase connection check failed:', err);
        setConnectionError(true);
        toast.error('Connection error. Please try again later.');
      }
    };
    
    checkConnection();
  }, []);
  
  // Set up loading timeout
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.error('Authentication check timeout');
        toast.error('Authentication check timed out. Redirecting to sign in page.');
        
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

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading) {
      if (loadingTimeout) clearTimeout(loadingTimeout);
      
      if (!user) {
        console.log('No authenticated user found, redirecting to signin');
        toast.info('Please sign in to access the dashboard');
        navigate('/signin', { 
          replace: true, 
          state: { from: location.pathname } 
        });
      } else {
        console.log('User authenticated, loading dashboard:', user.email);
      }
    }
  }, [user, loading, navigate, location.pathname, loadingTimeout]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-collabCorner-purple mb-4" />
        <p className="text-lg font-medium text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
        <p className="text-gray-700 mb-4">Unable to connect to the database.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-collabCorner-purple text-white rounded hover:bg-collabCorner-purple-dark"
        >
          Try Again
        </button>
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
