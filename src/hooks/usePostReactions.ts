
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PostReaction {
  likes: number;
  dislikes: number;
  userReaction?: string;
}

export const usePostReactions = () => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Record<string, PostReaction>>({});

  const fetchReactionsForPosts = async (postIds: string[]) => {
    if (!postIds.length) return;
    
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
        // Count likes and dislikes
        reactionsData.forEach((reaction) => {
          const postId = reaction.post_id;
          if (postId) {
            if (reaction.reaction_type === 'like') {
              reactionsMap[postId].likes = (reactionsMap[postId].likes || 0) + 1;
            } else if (reaction.reaction_type === 'dislike') {
              reactionsMap[postId].dislikes = (reactionsMap[postId].dislikes || 0) + 1;
            }
            
            // Track the current user's reaction
            if (user && reaction.user_id === user.id) {
              reactionsMap[postId].userReaction = reaction.reaction_type;
            }
          }
        });
      }
      
      setReactions(prev => ({ ...prev, ...reactionsMap }));
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  return {
    reactions,
    setReactions,
    fetchReactionsForPosts
  };
};
