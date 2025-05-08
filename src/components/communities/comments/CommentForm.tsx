
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommentFormProps {
  postId: string;
  isMember: boolean;
  onCommentAdded: () => void;
  replyToId?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  postId, 
  isMember, 
  onCommentAdded,
  replyToId 
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }
    
    if (!isMember) {
      toast.error('You must join the community to comment');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: newComment.trim(),
          parent_id: replyToId || null
        });
      
      if (error) throw error;
      
      setNewComment('');
      onCommentAdded();
      toast.success('Comment added successfully');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      {user && isMember ? (
        <div className="flex flex-col gap-2 animate-fade-in">
          <Textarea
            placeholder={replyToId ? "Write a reply..." : "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className={cn(
              "min-h-[80px] resize-none transition-all duration-200",
              replyToId && "border-l-2 border-l-collabCorner-purple pl-3"
            )}
          />
          <div className="flex items-center justify-end">
            <Button 
              onClick={handleAddComment}
              disabled={isSubmitting || !newComment.trim()}
              size="sm"
              className="bg-collabCorner-purple hover:bg-collabCorner-purple/80"
            >
              <Send className="h-4 w-4 mr-1" />
              {replyToId ? 'Reply' : 'Comment'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground py-4 bg-muted/30 rounded-md">
          <p>
            {!user ? "Log in to comment" : "Join the community to comment"}
          </p>
          {!user && (
            <Button 
              variant="link" 
              className="text-collabCorner-purple p-0 h-auto mt-1"
              onClick={() => window.location.href = '/signin'}
            >
              Sign in now
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentForm;
