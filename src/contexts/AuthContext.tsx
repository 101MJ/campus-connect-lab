
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const navigate = useNavigate();

  // Function to fetch user profile with error handling and retries
  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log(`Fetching profile for user: ${userId}`);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Retry logic for network-related errors
        if (retryCount < 2 && (error.code === 'PGRST301' || error.message.includes('network'))) {
          console.log(`Retrying profile fetch, attempt ${retryCount + 1}`);
          setTimeout(() => fetchUserProfile(userId, retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        
        toast.error('Failed to load user profile');
        return;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('Exception fetching profile:', error);
      toast.error('Failed to load user profile');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // First, set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          console.log('Auth state changed:', _event, session?.user?.email);
          
          setUser(session?.user ?? null);
          
          // Fetch profile if user exists, but use setTimeout to avoid Supabase client deadlock
          if (session?.user) {
            setTimeout(() => {
              fetchUserProfile(session.user!.id);
            }, 0);
          } else {
            setProfile(null);
          }
          
          setLoading(false);
        });

        // Then check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.email);
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
        
        setAuthInitialized(true);
        setLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast.error('Authentication service error');
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    initialize();
  }, []);

  async function signIn(email: string, password: string) {
    try {
      setLoading(true);
      console.log('Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error('Sign in failed. Please check your credentials.');
        throw error;
      }

      console.log('Sign in successful:', data.user?.email);
      toast.success('Signed in successfully');
      
      // Fetch profile after successful sign in
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during sign in' 
      };
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string) {
    try {
      setLoading(true);
      console.log('Signing up new user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        toast.error('Sign up failed. Please try again.');
        throw error;
      }

      if (data.user) {
        console.log('Sign up successful:', data.user.email);
        setUser(data.user);
        toast.success('Account created successfully! Please check your email to confirm your account.');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error signing up:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during sign up' 
      };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);
      console.log('Signing out user');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Sign out failed. Please try again.');
        throw error;
      }
      
      // Clear user and profile state immediately after successful signout
      console.log('Sign out successful');
      setUser(null);
      setProfile(null);
      
      toast.success('Signed out successfully');
      
      // Navigate after state is cleared
      navigate('/signin', { replace: true });
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error; // Re-throw to be handled by the component
    } finally {
      setLoading(false);
    }
  }

  // Add auth status info to log when the context is fully loaded
  useEffect(() => {
    if (authInitialized) {
      console.log('Auth state initialized. Authenticated:', !!user);
    }
  }, [authInitialized, user]);

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
