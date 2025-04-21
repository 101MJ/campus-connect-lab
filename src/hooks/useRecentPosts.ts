
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Community } from './useCommunityManager';
import { Post } from './usePostList';
import { useQuery } from '@tanstack/react-query';

export interface RecentPost extends Post {
  communityName?: string;
}

export const useRecentPosts = (userId?: string, joinedCommunities: Community[] = []) => {
  // Use React Query for better caching and performance
  const { 
    data: recentPosts = [], 
    isLoading: loading,
    refetch: fetchRecentPosts
  } = useQuery({
    queryKey: ['recentPosts', userId, joinedCommunities.map(c => c.community_id).join('-')],
    queryFn: async (): Promise<RecentPost[]> => {
      if (!userId || joinedCommunities.length === 0) {
        return [];
      }
      
      const userCommunityIds = joinedCommunities.map(c => c.community_id);
      
      // Fetch posts from joined communities with limit
      const { data: communityPosts, error: postsError } = await supabase
        .from('posts')
        .select(`
          post_id,
          title,
          content,
          created_at,
          author_id,
          community_id,
          communities (name)
        `)
        .in('community_id', userCommunityIds)
        .order('created_at', { ascending: false })
        .limit(10); // Start with a smaller initial batch
      
      if (postsError) throw postsError;
      if (!communityPosts || communityPosts.length === 0) {
        return [];
      }

      // Get author profiles in a single batch
      const authorIds = communityPosts.map(post => post.author_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', authorIds);
      
      // Create a lookup map for profiles
      const profileMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile);
        });
      }
      
      // Get reactions data
      const { data: reactions } = await supabase
        .from('reactions')
        .select('post_id, reaction_type')
        .in('post_id', communityPosts.map(post => post.post_id));
      
      // Calculate like counts
      const likeCounts: Record<string, number> = {};
      if (reactions) {
        reactions.forEach(reaction => {
          if (reaction.reaction_type === 'like') {
            likeCounts[reaction.post_id] = (likeCounts[reaction.post_id] || 0) + 1;
          }
        });
      }

      // Format posts with profiles
      const formattedPosts: RecentPost[] = communityPosts.map(post => ({
        post_id: post.post_id,
        title: post.title,
        content: post.content,
        created_at: post.created_at,
        community_id: post.community_id,
        communityName: post.communities?.name,
        author_id: post.author_id,
        profiles: {
          full_name: profileMap.get(post.author_id)?.full_name || null
        }
      }));

      // Sort by likes, then by date
      return formattedPosts.sort((a, b) => {
        const likeDiff = (likeCounts[b.post_id] || 0) - (likeCounts[a.post_id] || 0);
        if (likeDiff !== 0) return likeDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    },
    enabled: !!userId && joinedCommunities.length > 0,
    staleTime: 60000, // 1 minute cache
    refetchOnWindowFocus: false
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!userId || joinedCommunities.length === 0) return;
    
    const communityIds = joinedCommunities.map(c => c.community_id);
    const channels = communityIds.map(communityId => {
      return supabase
        .channel(`posts-community-${communityId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts',
            filter: `community_id=eq.${communityId}`
          },
          () => {
            // Refetch when there's a change
            fetchRecentPosts();
          }
        )
        .subscribe();
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [userId, joinedCommunities, fetchRecentPosts]);

  return { recentPosts, loading, fetchRecentPosts };
};
