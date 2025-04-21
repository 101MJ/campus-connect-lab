
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface Community {
  community_id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by: string;
}

export const useCommunityManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([]);

  // Fetch all communities
  const { data: communities = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['communities', 'all'],
    queryFn: async (): Promise<Community[]> => {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  });

  // Fetch communities created by the user
  const { data: myCommunities = [], isLoading: isLoadingMy } = useQuery({
    queryKey: ['communities', 'created', user?.id],
    queryFn: async (): Promise<Community[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  });

  // Fetch joined communities
  const { data: joinedCommunities = [], isLoading: isLoadingJoined } = useQuery({
    queryKey: ['communities', 'joined', user?.id],
    queryFn: async (): Promise<Community[]> => {
      if (!user) return [];
      
      // Get memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id);
        
      if (membershipsError) throw membershipsError;
      
      const joinedCommunityIds = memberships?.map(m => m.community_id) || [];
      
      if (joinedCommunityIds.length === 0) return [];
      
      // Get joined communities
      const { data: joinedData, error: joinedError } = await supabase
        .from('communities')
        .select('*')
        .in('community_id', joinedCommunityIds)
        .order('created_at', { ascending: false });
          
      if (joinedError) throw joinedError;
      return joinedData || [];
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  });

  const isLoading = isLoadingAll || isLoadingMy || isLoadingJoined;

  const fetchCommunities = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['communities'] });
  }, [queryClient]);

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
      
      // Update caches
      queryClient.invalidateQueries({ 
        queryKey: ['communities', 'all'] 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['communities', 'created', user.id]
      });

      if (data && data.length > 0) {
        // Add user as a member
        await supabase
          .from('community_members')
          .insert({
            community_id: data[0].community_id,
            user_id: user.id
          });
        
        // Invalidate joined communities
        queryClient.invalidateQueries({ 
          queryKey: ['communities', 'joined', user.id] 
        });
      }

      return data?.[0] || null;
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast.error(error.message || 'Failed to create community');
      return null;
    }
  };

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
