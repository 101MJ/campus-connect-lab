import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectPath?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const session = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      setUser(session?.user ?? null)
      setLoading(false)
    }

    session()

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
  }, []);

  async function signIn(email: string, password: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // After successful sign in, check if there's a last visited path
      const lastVisitedPath = localStorage.getItem('lastVisitedPath');
      if (lastVisitedPath && lastVisitedPath !== '/signin' && lastVisitedPath !== '/signup') {
        // Return the path so the login component can redirect
        return { success: true, redirectPath: lastVisitedPath };
      }
      
      return { success: true, redirectPath: '/dashboard' };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message || 'An error occurred during sign in' };
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setUser(data.user);
      return { success: true };
    } catch (error: any) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message || 'An error occurred during sign up' };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      navigate('/signin');
    } catch (error: any) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
