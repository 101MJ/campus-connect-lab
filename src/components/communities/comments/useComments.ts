
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface Comment {
  comment_id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name?: string | null;
}

export interface CommentReaction {
  likes: number;
  dislikes: number;
  userReaction?: string;
}

export const useComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Record<string, CommentReaction>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingComment, setIsDeletingComment] = useState<string | null>(null);

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
      
      const reactionsMap: Record<string, CommentReaction> = {};
      
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

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return {
    comments,
    reactions,
    isLoading,
    isDeletingComment,
    setReactions,
    handleDeleteComment,
    fetchComments
  };
};
