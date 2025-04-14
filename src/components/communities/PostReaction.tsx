
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { PostReaction as PostReactionType } from '@/hooks/usePostList';

interface PostReactionProps {
  postId: string;
  reaction: PostReactionType;
  isMember: boolean;
  onReactionUpdate: (postId: string, updatedReaction: PostReactionType) => void;
}

const PostReaction: React.FC<PostReactionProps> = ({
  postId,
  reaction,
  isMember,
  onReactionUpdate,
}) => {
  const { user } = useAuth();

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast.error('You must be logged in to react');
      return;
    }
    
    if (!isMember) {
      toast.error('You must join the community to react to posts');
      return;
    }
    
    const currentReaction = reaction.userReaction;
    
    try {
      if (currentReaction === reactionType) {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        const updatedReaction = {
          ...reaction,
          [reactionType === 'like' ? 'likes' : 'dislikes']: 
            Math.max(0, reaction[reactionType === 'like' ? 'likes' : 'dislikes'] - 1),
          userReaction: undefined
        };
        onReactionUpdate(postId, updatedReaction);
        
      } else {
        if (currentReaction) {
          const { error } = await supabase
            .from('reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          const updatedCounts = {
            ...reaction,
            [currentReaction === 'like' ? 'likes' : 'dislikes']: 
              Math.max(0, reaction[currentReaction === 'like' ? 'likes' : 'dislikes'] - 1)
          };
          onReactionUpdate(postId, updatedCounts);
        }
        
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });
          
        if (error) throw error;
        
        const updatedReaction = {
          ...reaction,
          [reactionType === 'like' ? 'likes' : 'dislikes']: 
            (reaction[reactionType === 'like' ? 'likes' : 'dislikes'] || 0) + 1,
          userReaction: reactionType
        };
        onReactionUpdate(postId, updatedReaction);
      }
    } catch (error: any) {
      console.error('Error handling reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="ghost" 
        size="sm"
        className={reaction.userReaction === 'like' ? 'text-green-600' : ''}
        onClick={() => handleReaction('like')}
        disabled={!user || !isMember}
      >
        <ThumbsUp className="h-4 w-4 mr-1" />
        {reaction.likes || 0}
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        className={reaction.userReaction === 'dislike' ? 'text-red-600' : ''}
        onClick={() => handleReaction('dislike')}
        disabled={!user || !isMember}
      >
        <ThumbsDown className="h-4 w-4 mr-1" />
        {reaction.dislikes || 0}
      </Button>
    </div>
  );
};

export default PostReaction;
