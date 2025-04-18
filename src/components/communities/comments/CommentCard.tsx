
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Comment, CommentReaction } from './useComments';
import EditCommentDialog from '../EditCommentDialog';

interface CommentCardProps {
  comment: Comment;
  reaction: CommentReaction;
  isMember: boolean;
  isDeletingComment: boolean;
  onReactionUpdate: (commentId: string, updatedReaction: CommentReaction) => void;
  onDeleteComment: (commentId: string) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  reaction,
  isMember,
  isDeletingComment,
  onReactionUpdate,
  onDeleteComment,
}) => {
  const { user } = useAuth();

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast.error('You must be logged in to react');
      return;
    }
    
    if (!isMember) {
      toast.error('You must join the community to react');
      return;
    }
    
    const currentReaction = reaction.userReaction;
    
    try {
      if (currentReaction === reactionType) {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('comment_id', comment.comment_id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        onReactionUpdate(comment.comment_id, {
          ...reaction,
          [reactionType === 'like' ? 'likes' : 'dislikes']: 
            Math.max(0, reaction[reactionType === 'like' ? 'likes' : 'dislikes'] - 1),
          userReaction: undefined
        });
        
      } else {
        if (currentReaction) {
          const { error } = await supabase
            .from('reactions')
            .delete()
            .eq('comment_id', comment.comment_id)
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          const updatedCounts = {
            ...reaction,
            [currentReaction === 'like' ? 'likes' : 'dislikes']: 
              Math.max(0, reaction[currentReaction === 'like' ? 'likes' : 'dislikes'] - 1)
          };
          onReactionUpdate(comment.comment_id, updatedCounts);
        }
        
        const { error } = await supabase
          .from('reactions')
          .insert({
            comment_id: comment.comment_id,
            user_id: user.id,
            reaction_type: reactionType
          });
          
        if (error) throw error;
        
        onReactionUpdate(comment.comment_id, {
          ...reaction,
          [reactionType === 'like' ? 'likes' : 'dislikes']: 
            (reaction[reactionType === 'like' ? 'likes' : 'dislikes'] || 0) + 1,
          userReaction: reactionType
        });
      }
    } catch (error: any) {
      console.error('Error handling reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  return (
    <div className="pb-3">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{comment.author_name}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {format(new Date(comment.created_at), 'MMM d, yyyy')}
          </span>
          {user?.id === comment.author_id && (
            <div className="flex items-center gap-1">
              <EditCommentDialog 
                comment={comment} 
                onCommentUpdated={onDeleteComment} 
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDeleteComment(comment.comment_id)}
                disabled={isDeletingComment}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <p className="my-1">{comment.content}</p>
      <div className="flex items-center gap-4 mt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-7 px-2 ${reaction.userReaction === 'like' ? 'text-green-600' : ''}`}
          onClick={() => handleReaction('like')}
          disabled={!user || !isMember}
        >
          <ThumbsUp className="h-3.5 w-3.5 mr-1" />
          {reaction.likes || 0}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-7 px-2 ${reaction.userReaction === 'dislike' ? 'text-red-600' : ''}`}
          onClick={() => handleReaction('dislike')}
          disabled={!user || !isMember}
        >
          <ThumbsDown className="h-3.5 w-3.5 mr-1" />
          {reaction.dislikes || 0}
        </Button>
      </div>
    </div>
  );
};

export default CommentCard;
