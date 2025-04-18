
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { PostReaction as PostReactionType } from '@/hooks/usePostReactions';

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
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast.error('You must be logged in to react');
      return;
    }
    
    if (!isMember) {
      toast.error('You must join the community to react to posts');
      return;
    }
    
    if (isProcessing) {
      return; // Prevent multiple clicks while processing
    }
    
    setIsProcessing(true);
    const currentReaction = reaction.userReaction;
    
    try {
      let updatedReaction = { ...reaction };

      if (currentReaction === reactionType) {
        // Remove reaction
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        updatedReaction = {
          ...reaction,
          [reactionType === 'like' ? 'likes' : 'dislikes']: 
            Math.max(0, reaction[reactionType === 'like' ? 'likes' : 'dislikes'] - 1),
          userReaction: undefined
        };
      } else {
        // Handle switching reaction type
        if (currentReaction) {
          // Delete existing reaction first
          const { error: deleteError } = await supabase
            .from('reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
            
          if (deleteError) throw deleteError;
          
          updatedReaction = {
            ...reaction,
            [currentReaction === 'like' ? 'likes' : 'dislikes']: 
              Math.max(0, reaction[currentReaction === 'like' ? 'likes' : 'dislikes'] - 1)
          };
          
          // Small delay to ensure the delete completes before insert
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Add new reaction
        const { error: insertError } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });
          
        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
        
        updatedReaction = {
          ...updatedReaction,
          [reactionType === 'like' ? 'likes' : 'dislikes']: 
            (updatedReaction[reactionType === 'like' ? 'likes' : 'dislikes'] || 0) + 1,
          userReaction: reactionType
        };
      }
      
      onReactionUpdate(postId, updatedReaction);
    } catch (error: any) {
      console.error('Error handling reaction:', error);
      toast.error('Failed to update reaction');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="ghost" 
        size="sm"
        className={`${reaction.userReaction === 'like' ? 'text-green-600' : ''}`}
        onClick={() => handleReaction('like')}
        disabled={!user || !isMember || isProcessing}
      >
        <ThumbsUp className="h-4 w-4 mr-1" />
        {reaction.likes || 0}
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        className={`${reaction.userReaction === 'dislike' ? 'text-red-600' : ''}`}
        onClick={() => handleReaction('dislike')}
        disabled={!user || !isMember || isProcessing}
      >
        <ThumbsDown className="h-4 w-4 mr-1" />
        {reaction.dislikes || 0}
      </Button>
    </div>
  );
};

export default PostReaction;
