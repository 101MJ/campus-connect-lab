
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CommentFormProps {
  postId: string;
  isMember: boolean;
  onCommentAdded: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, isMember, onCommentAdded }) => {
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
          content: newComment.trim()
        });
      
      if (error) throw error;
      
      setNewComment('');
      onCommentAdded();
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
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAddComment}
              disabled={isSubmitting || !newComment.trim()}
              size="sm"
            >
              <Send className="h-4 w-4 mr-1" />
              Comment
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-2">
          {!user ? "Log in to comment" : "Join the community to comment"}
        </p>
      )}
    </div>
  );
};

export default CommentForm;
