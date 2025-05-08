
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Bold, Italic, List, Reply } from 'lucide-react';
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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

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

  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newComment.substring(start, end);
    const beforeText = newComment.substring(0, start);
    const afterText = newComment.substring(end);
    
    const newValue = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;
    setNewComment(newValue);
    
    // Focus back to textarea and set cursor position after the inserted formatting
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <div className="p-4">
      {user && isMember ? (
        <div className="flex flex-col gap-2 animate-fade-in">
          <Textarea
            ref={textareaRef}
            placeholder={replyToId ? "Write a reply..." : "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className={cn(
              "min-h-[80px] resize-none transition-all duration-200",
              replyToId && "border-l-2 border-l-collabCorner-purple pl-3"
            )}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => insertFormatting('**', '**')}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => insertFormatting('*', '*')}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => insertFormatting('- ')}
                title="List"
              >
                <List className="h-4 w-4" />
              </Button>
              {!replyToId && (
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => insertFormatting('> ')}
                  title="Quote"
                >
                  <Reply className="h-4 w-4 rotate-180" />
                </Button>
              )}
            </div>
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
          <div className="text-xs text-muted-foreground mt-1">
            Supports markdown: **bold**, *italic*, - list, &gt; quote
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
