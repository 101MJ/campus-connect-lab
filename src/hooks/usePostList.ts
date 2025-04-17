
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePostReactions } from './usePostReactions';

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { reactions, setReactions, fetchReactionsForPosts } = usePostReactions();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let { data: postsData, error: postsError } = await supabase
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
      
      if (postsData && postsData.length > 0) {
        const postsWithProfiles: Post[] = [];
        
        for (const post of postsData) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', post.author_id)
            .single();
            
          postsWithProfiles.push({
            ...post,
            profiles: profileData || { full_name: null }
          });
        }

        const { data: reactionsData, error: reactionsError } = await supabase
          .from('reactions')
          .select('post_id, reaction_type')
          .in('post_id', postsData.map(post => post.post_id));
          
        if (reactionsError) {
          console.error('Error fetching reactions:', reactionsError);
        }

        const likeCounts: Record<string, number> = {};
        reactionsData?.forEach(reaction => {
          if (reaction.reaction_type === 'like') {
            likeCounts[reaction.post_id] = (likeCounts[reaction.post_id] || 0) + 1;
          }
        });

        const sortedPosts = postsWithProfiles.sort((a, b) => 
          (likeCounts[b.post_id] || 0) - (likeCounts[a.post_id] || 0)
        );
        
        setPosts(sortedPosts);
        await fetchReactionsForPosts(postsData.map(post => post.post_id));
      } else {
        setPosts([]);
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
