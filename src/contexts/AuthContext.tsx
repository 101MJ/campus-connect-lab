import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Define the Profile interface
export interface Profile {
  id?: string;
  full_name?: string;
  bio?: string;
  portfolio?: string;
  skills?: string[];
  hobbies?: string[];
}

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectPath?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const session = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      setUser(session?.user ?? null)
      
      // Fetch user profile if user exists
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false)
    }

    session()

    // Use the auth state change event to keep the user state in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      // Fetch user profile if user exists after auth state change
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    }
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

      // Fetch profile after successful sign in
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      
      // Simplified return - the SignIn component will handle navigation directly
      return { success: true };
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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear user and profile state immediately after successful signout
      setUser(null);
      setProfile(null);
      
      // Navigate after state is cleared
      navigate('/signin', { replace: true });
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error; // Re-throw to be handled by the component
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
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
