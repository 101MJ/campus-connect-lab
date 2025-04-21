
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePostReactions } from './usePostReactions';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface Post {
  post_id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles?: PostProfile | null;
  community_id: string;
}

interface PostProfile {
  full_name: string | null;
}

export const usePostList = (communityId: string) => {
  const queryClient = useQueryClient();
  const { reactions, setReactions, fetchReactionsForPosts } = usePostReactions();
  
  // Fetch posts using React Query
  const { 
    data: posts = [], 
    isLoading: loading,
    refetch: fetchPosts 
  } = useQuery({
    queryKey: ['posts', communityId],
    queryFn: async (): Promise<Post[]> => {
      // Fetch all posts for this community
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          post_id,
          title,
          content,
          created_at,
          author_id,
          community_id
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;
      
      if (!postsData || postsData.length === 0) {
        return [];
      }
      
      // Get author information for each post
      const postsWithProfiles = await Promise.all(postsData.map(async (post) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', post.author_id)
          .maybeSingle();
          
        return {
          ...post,
          profiles: profileData || { full_name: null }
        };
      }));

      // Get reactions for sorting
      const { data: reactionsData } = await supabase
        .from('reactions')
        .select('post_id, reaction_type')
        .in('post_id', postsData.map(post => post.post_id));
      
      // Calculate like counts for each post
      const likeCounts: Record<string, number> = {};
      const dislikeCounts: Record<string, number> = {};
      
      reactionsData?.forEach(reaction => {
        if (reaction.reaction_type === 'like') {
          likeCounts[reaction.post_id] = (likeCounts[reaction.post_id] || 0) + 1;
        } else if (reaction.reaction_type === 'dislike') {
          dislikeCounts[reaction.post_id] = (dislikeCounts[reaction.post_id] || 0) + 1;
        }
      });

      // Sort posts by likes (more likes first) and then by date (newer first)
      const sortedPosts = postsWithProfiles.sort((a, b) => {
        const aLikes = likeCounts[a.post_id] || 0;
        const bLikes = likeCounts[b.post_id] || 0;
        
        if (bLikes !== aLikes) {
          return bLikes - aLikes; // Sort by likes
        }
        
        // If likes are equal, sort by date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Get reactions data for the UI
      await fetchReactionsForPosts(postsData.map(post => post.post_id));
      
      return sortedPosts;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `community_id=eq.${communityId}`
        },
        () => {
          // Simply refetch when any post changes
          queryClient.invalidateQueries({ queryKey: ['posts', communityId] });
        }
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel('reactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `post_id=not.is.null`
        },
        (payload: any) => {
          const typedPayload = payload as any;
          if (typedPayload.new?.post_id) {
            fetchReactionsForPosts([typedPayload.new.post_id]);
          } else if (typedPayload.old?.post_id) {
            fetchReactionsForPosts([typedPayload.old.post_id]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [communityId, queryClient, fetchReactionsForPosts]);

  return {
    posts,
    loading,
    reactions,
    setReactions,
    fetchPosts
  };
};
