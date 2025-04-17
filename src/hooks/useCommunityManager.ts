
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface Community {
  community_id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by: string;
}

export const useCommunityManager = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const { data: allCommunities, error: allError } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (allError) throw allError;
      
      const { data: userCommunities, error: userError } = await supabase
        .from('communities')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false });
      
      if (userError) throw userError;
      
      const { data: memberships, error: membershipsError } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user!.id);
        
      if (membershipsError) throw membershipsError;
      
      const joinedCommunityIds = memberships?.map(m => m.community_id) || [];
      
      let joined: Community[] = [];
      if (joinedCommunityIds.length > 0) {
        const { data: joinedData, error: joinedError } = await supabase
          .from('communities')
          .select('*')
          .in('community_id', joinedCommunityIds)
          .order('created_at', { ascending: false });
          
        if (joinedError) throw joinedError;
        joined = joinedData || [];
      }
      
      setCommunities(allCommunities || []);
      setMyCommunities(userCommunities || []);
      setJoinedCommunities(joined);

    } catch (error: any) {
      console.error('Error fetching communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setIsLoading(false);
    }
  };

  const createCommunity = async (name: string, description?: string) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('communities')
        .insert({
          name,
          description: description || null,
          created_by: user.id,
        })
        .select();
      
      if (error) throw error;
      
      setCommunities(prev => [...(data || []), ...prev]);
      setMyCommunities(prev => [...(data || []), ...prev]);

      if (data && data.length > 0) {
        await supabase
          .from('community_members')
          .insert({
            community_id: data[0].community_id,
            user_id: user.id
          });
        
        setJoinedCommunities(prev => [...(data || []), ...prev]);
        await fetchCommunities();
      }

      return data?.[0] || null;
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast.error(error.message || 'Failed to create community');
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCommunities();
    }
  }, [user]);

  return {
    communities,
    myCommunities,
    joinedCommunities,
    recommendedCommunities,
    isLoading,
    createCommunity,
    fetchCommunities
  };
};
