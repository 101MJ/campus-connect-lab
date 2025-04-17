
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Community } from './useCommunityManager';
import { Post } from './usePostList';

export interface RecentPost extends Post {
  communityName?: string;
}

export const useRecentPosts = (userId?: string, joinedCommunities: Community[] = []) => {
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentPosts = async () => {
    if (!userId || joinedCommunities.length === 0) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const userCommunityIds = joinedCommunities.map(c => c.community_id);
      
      // Fetch all posts from the user's joined communities
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
        .limit(20);
      
      if (postsError) throw postsError;

      // Get author information for each post
      const postsWithAuthors = await Promise.all((communityPosts || []).map(async (post) => {
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
      
      // Fetch reactions for all posts
      const allPostIds = postsWithAuthors.map(p => p.post_id);
      const { data: reactions } = await supabase
        .from('reactions')
        .select('post_id, reaction_type')
        .in('post_id', allPostIds);

      // Calculate like counts for sorting
      const likeCounts: Record<string, number> = {};
      reactions?.forEach(reaction => {
        if (reaction.reaction_type === 'like') {
          likeCounts[reaction.post_id] = (likeCounts[reaction.post_id] || 0) + 1;
        }
      });

      const formattedPosts: RecentPost[] = postsWithAuthors
        .map(post => ({
          post_id: post.post_id,
          title: post.title,
          content: post.content,
          created_at: post.created_at,
          community_id: post.community_id,
          communityName: post.communities?.name,
          author_id: post.author_id,
          profiles: post.profiles
        }))
        .sort((a, b) => {
          // First sort by likes, then by creation date
          const likeDiff = (likeCounts[b.post_id] || 0) - (likeCounts[a.post_id] || 0);
          if (likeDiff !== 0) return likeDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      setRecentPosts(formattedPosts);
    } catch (error: any) {
      console.error('Error fetching recent posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentPosts();
  }, [userId, joinedCommunities.length]);

  return { recentPosts, loading, fetchRecentPosts };
};
