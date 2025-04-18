import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Send, Trash2 } from 'lucide-react';

interface PostCommentsProps {
  postId: string;
  isMember: boolean;
}

interface Comment {
  comment_id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name?: string | null;
}

const PostComments: React.FC<PostCommentsProps> = ({ postId, isMember }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Record<string, {likes: number, dislikes: number, userReaction?: string}>>({});
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          comment_id,
          content,
          created_at,
          author_id
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (commentsError) throw commentsError;
      
      if (commentsData && commentsData.length > 0) {
        const authorIds = commentsData.map(comment => comment.author_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', authorIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }
        
        const profilesMap = profilesData ? profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile.full_name;
          return acc;
        }, {} as Record<string, string | null>) : {};
        
        const commentsWithNames = commentsData.map(comment => ({
          ...comment,
          author_name: profilesMap[comment.author_id] || 'Unknown user'
        }));
        
        setComments(commentsWithNames);
        
        await fetchReactionsForComments(commentsData.map(comment => comment.comment_id));
      } else {
        setComments([]);
      }
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReactionsForComments = async (commentIds: string[]) => {
    try {
      const { data: reactionsData, error } = await supabase
        .from('reactions')
        .select('comment_id, reaction_type, user_id')
        .in('comment_id', commentIds);
      
      if (error) throw error;
      
      const reactionsMap: Record<string, {likes: number, dislikes: number, userReaction?: string}> = {};
      
      commentIds.forEach(commentId => {
        reactionsMap[commentId] = { likes: 0, dislikes: 0 };
      });
      
      if (reactionsData) {
        reactionsData.forEach((reaction) => {
          const commentId = reaction.comment_id;
          if (commentId) {
            if (reaction.reaction_type === 'like') {
              reactionsMap[commentId].likes += 1;
            } else if (reaction.reaction_type === 'dislike') {
              reactionsMap[commentId].dislikes += 1;
            }
            
            if (user && reaction.user_id === user.id) {
              reactionsMap[commentId].userReaction = reaction.reaction_type;
            }
          }
        });
      }
      
      setReactions(reactionsMap);
    } catch (error: any) {
      console.error('Error fetching comment reactions:', error);
    }
  };

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
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: newComment.trim()
        })
        .select('comment_id, content, created_at, author_id');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }
        
        const authorName = profileData?.full_name || 'Unknown user';
        
        const newCommentWithAuthor = {
          ...data[0],
          author_name: authorName
        };
        
        setComments(prev => [...prev, newCommentWithAuthor]);
        setNewComment('');
        
        setReactions(prev => ({
          ...prev,
          [data[0].comment_id]: { likes: 0, dislikes: 0 }
        }));
      }
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (commentId: string, reactionType: string) => {
    if (!user) {
      toast.error('You must be logged in to react');
      return;
    }
    
    if (!isMember) {
      toast.error('You must join the community to react');
      return;
    }
    
    const currentReaction = reactions[commentId]?.userReaction;
    
    try {
      if (currentReaction === reactionType) {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setReactions(prev => {
          const updated = { ...prev };
          if (reactionType === 'like') {
            updated[commentId] = { 
              ...updated[commentId], 
              likes: Math.max(0, updated[commentId].likes - 1),
              userReaction: undefined
            };
          } else {
            updated[commentId] = { 
              ...updated[commentId], 
              dislikes: Math.max(0, updated[commentId].dislikes - 1),
              userReaction: undefined
            };
          }
          return updated;
        });
        
      } else {
        if (currentReaction) {
          const { error } = await supabase
            .from('reactions')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          setReactions(prev => {
            const updated = { ...prev };
            if (currentReaction === 'like') {
              updated[commentId].likes = Math.max(0, updated[commentId].likes - 1);
            } else {
              updated[commentId].dislikes = Math.max(0, updated[commentId].dislikes - 1);
            }
            return updated;
          });
        }
        
        const { error } = await supabase
          .from('reactions')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            reaction_type: reactionType
          });
          
        if (error) throw error;
        
        setReactions(prev => {
          const updated = { ...prev };
          if (reactionType === 'like') {
            updated[commentId] = { 
              ...updated[commentId], 
              likes: (updated[commentId].likes || 0) + 1,
              userReaction: 'like'
            };
          } else {
            updated[commentId] = { 
              ...updated[commentId], 
              dislikes: (updated[commentId].dislikes || 0) + 1,
              userReaction: 'dislike'
            };
          }
          return updated;
        });
      }
    } catch (error: any) {
      console.error('Error handling reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || isDeletingComment) return;
    
    if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    setIsDeletingComment(commentId);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('comment_id', commentId)
        .eq('author_id', user.id);
      
      if (error) throw error;
      
      setComments(prev => prev.filter(c => c.comment_id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setIsDeletingComment(null);
    }
  };

  return (
    <div className="border-t divide-y">
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
      
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.comment_id} className="pb-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{comment.author_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {format(new Date(comment.created_at), 'MMM d, yyyy')}
                  </span>
                  {user?.id === comment.author_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteComment(comment.comment_id)}
                      disabled={isDeletingComment === comment.comment_id}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="my-1">{comment.content}</p>
              <div className="flex items-center gap-4 mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-7 px-2 ${reactions[comment.comment_id]?.userReaction === 'like' ? 'text-green-600' : ''}`}
                  onClick={() => handleReaction(comment.comment_id, 'like')}
                  disabled={!user || !isMember}
                >
                  <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                  {reactions[comment.comment_id]?.likes || 0}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-7 px-2 ${reactions[comment.comment_id]?.userReaction === 'dislike' ? 'text-red-600' : ''}`}
                  onClick={() => handleReaction(comment.comment_id, 'dislike')}
                  disabled={!user || !isMember}
                >
                  <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                  {reactions[comment.comment_id]?.dislikes || 0}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground">No comments yet</p>
        )}
      </div>
    </div>
  );
};

export default PostComments;
