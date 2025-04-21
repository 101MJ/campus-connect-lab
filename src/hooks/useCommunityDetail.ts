
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CommunityDetailData {
  community: any;
  isMember: boolean;
  memberCount: number;
  isCreator: boolean;
}

export const useCommunityDetail = (communityId: string) => {
  const { user } = useAuth();
  const [data, setData] = useState<CommunityDetailData>({
    community: null,
    isMember: false,
    memberCount: 0,
    isCreator: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchCommunityDetails = async () => {
    setIsLoading(true);
    try {
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('community_id', communityId)
        .single();
      
      if (communityError) throw communityError;

      let isMember = false;
      if (user) {
        const { data: membershipData, error: membershipError } = await supabase
          .from('community_members')
          .select('*')
          .eq('community_id', communityId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (membershipError) throw membershipError;
        isMember = !!membershipData;
      }

      const { count, error: countError } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId);
      
      if (countError) throw countError;

      setData({
        community: communityData,
        isMember,
        memberCount: count || 0,
        isCreator: user?.id === communityData?.created_by
      });
    } catch (error: any) {
      console.error('Error fetching community details:', error);
      toast.error('Failed to load community details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    if (!user) {
      toast.error('You must be logged in to join communities');
      return;
    }

    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id
        });
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        isMember: true,
        memberCount: prev.memberCount + 1
      }));
      toast.success('Successfully joined community');
    } catch (error: any) {
      console.error('Error joining community:', error);
      toast.error('Failed to join community');
    }
  };

  const handleLeaveCommunity = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        isMember: false,
        memberCount: Math.max(0, prev.memberCount - 1)
      }));
      toast.success('Successfully left community');
    } catch (error: any) {
      console.error('Error leaving community:', error);
      toast.error('Failed to leave community');
    }
  };

  useEffect(() => {
    if (communityId) {
      fetchCommunityDetails();
    }
  }, [communityId, user]);

  return {
    ...data,
    isLoading,
    showCreatePost,
    showDeleteDialog,
    setShowCreatePost,
    setShowDeleteDialog,
    handleJoinCommunity,
    handleLeaveCommunity
  };
};
