
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PostReaction {
  likes: number;
  dislikes: number;
  userReaction?: string;
}

export const usePostReactions = () => {
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

  return {
    reactions,
    setReactions,
    fetchReactionsForPosts
  };
};
