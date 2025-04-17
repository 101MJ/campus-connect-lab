
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Community } from './useCommunityManager';
import { Post } from './usePostList';

export interface RecentPost extends Post {
  communityName?: string;
}

export const useRecentPosts = (userId?: string, joinedCommunities: Community[] = []) => {
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);

  const fetchRecentPosts = async () => {
    if (!userId) return;

    try {
      const userCommunityIds = joinedCommunities.map(c => c.community_id);

      const { data: userCommunityPosts, error: userPostsError } = await supabase
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
        .order('created_at', { ascending: false });

      if (userPostsError) throw userPostsError;

      const allPostIds = (userCommunityPosts || []).map(p => p.post_id);
      const { data: reactions } = await supabase
        .from('reactions')
        .select('post_id, reaction_type')
        .in('post_id', allPostIds)
        .eq('reaction_type', 'like');

      const likeCounts: Record<string, number> = {};
      reactions?.forEach(reaction => {
        likeCounts[reaction.post_id] = (likeCounts[reaction.post_id] || 0) + 1;
      });

      const formattedPosts: RecentPost[] = (userCommunityPosts || [])
        .map(post => ({
          post_id: post.post_id,
          title: post.title,
          content: post.content,
          created_at: post.created_at,
          community_id: post.community_id,
          communityName: post.communities?.name,
          author_id: post.author_id
        }))
        .sort((a, b) => likeCounts[b.post_id] - likeCounts[a.post_id])
        .slice(0, 10);

      setRecentPosts(formattedPosts);
    } catch (error: any) {
      console.error('Error fetching recent posts:', error);
    }
  };

  useEffect(() => {
    if (userId && joinedCommunities.length > 0) {
      fetchRecentPosts();
    }
  }, [userId, joinedCommunities]);

  return { recentPosts, fetchRecentPosts };
};
