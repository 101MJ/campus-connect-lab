import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PostProfile {
  full_name: string | null;
}

export interface Post {
  post_id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles?: PostProfile | null;
  community_id?: string;
}

export interface PostReaction {
  likes: number;
  dislikes: number;
  userReaction?: string;
}

export const usePostList = (communityId: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<Record<string, PostReaction>>({});

  const fetchReactionsForPosts = async (postIds: string[]) => {
    try {
      const { data: reactionsData, error } = await supabase
        .from('reactions')
        .select('post_id, reaction_type, user_id')
        .in('post_id', postIds);
      
      if (error) throw error;
      
      const reactionsMap: Record<string, PostReaction> = {};
      postIds.forEach(postId => {
        reactionsMap[postId] = { likes: 0, dislikes: 0 };
      });
      
      if (reactionsData) {
        reactionsData.forEach((reaction) => {
          const postId = reaction.post_id;
          if (postId) {
            if (reaction.reaction_type === 'like') {
              reactionsMap[postId].likes += 1;
            } else if (reaction.reaction_type === 'dislike') {
              reactionsMap[postId].dislikes += 1;
            }
          }
        });
      }
      
      setReactions(prev => ({ ...prev, ...reactionsMap }));
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          post_id,
          title,
          content,
          created_at,
          author_id,
          profiles(full_name)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const safeData = (data || []).map(post => ({
        ...post,
        profiles: post.profiles || { full_name: null }
      })) as Post[];
      
      setPosts(safeData);
      
      if (safeData.length > 0) {
        await fetchReactionsForPosts(safeData.map(post => post.post_id));
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

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
        (payload: any) => {
          const typedPayload = payload as any;
          
          if (typedPayload.eventType === 'INSERT' && typedPayload.new) {
            const newPost = typedPayload.new as Post;
            setPosts(prevPosts => [newPost, ...prevPosts]);
            setReactions(prev => ({
              ...prev,
              [newPost.post_id]: { likes: 0, dislikes: 0 }
            }));
          } else if (typedPayload.eventType === 'UPDATE' && typedPayload.new) {
            const updatedPost = typedPayload.new as Post;
            setPosts(prevPosts => 
              prevPosts.map(post => 
                post.post_id === updatedPost.post_id ? updatedPost : post
              )
            );
          } else if (typedPayload.eventType === 'DELETE' && typedPayload.old) {
            const deletedPostId = (typedPayload.old as Post).post_id;
            setPosts(prevPosts => 
              prevPosts.filter(post => post.post_id !== deletedPostId)
            );
            setReactions(prev => {
              const updated = { ...prev };
              delete updated[deletedPostId];
              return updated;
            });
          }
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
  }, [communityId]);

  return {
    posts,
    loading,
    reactions,
    setReactions
  };
};
