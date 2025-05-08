
import React, { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, User, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PostComments from './PostComments';
import PostReaction from './PostReaction';
import type { Post } from '@/hooks/usePostList';
import type { PostReaction as PostReactionType } from '@/hooks/usePostReactions';
import EditPostDialog from './EditPostDialog';

interface PostCardProps {
  post: Post;
  reaction: PostReactionType;
  isMember: boolean;
  onReactionUpdate: (postId: string, updatedReaction: PostReactionType) => void;
  onPostUpdated: () => void;
  filterTags?: string[];
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  reaction,
  isMember,
  onReactionUpdate,
  onPostUpdated,
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Count comments by checking length of comments array, used instead of post.comment_count
  const commentCount = post.comments?.length || 0;
  
  // Determine if post is popular (more than 5 likes or has comments)
  const isPopular = (reaction?.likes > 5 || commentCount > 3);
  
  // Define card styling based on popularity
  const cardClasses = `overflow-hidden hover:shadow-lg transition-all duration-300 ${
    isPopular 
      ? 'bg-gradient-to-br from-white to-collabCorner-purple/10 border-l-4 border-l-collabCorner-purple'
      : 'bg-gradient-to-br from-white to-blue-50'
  }`;

  const handleDeletePost = async () => {
    if (!user || isDeleting) return;
    
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('post_id', post.post_id)
        .eq('author_id', user.id);
      
      if (error) throw error;
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const isAuthor = user?.id === post.author_id;

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-full ${isPopular ? 'bg-collabCorner-purple/20' : 'bg-collabCorner-purple/10'}`}>
            <User className="h-5 w-5 text-collabCorner-purple" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{post.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Posted by {post.profiles?.full_name ?? 'Unknown user'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {format(new Date(post.created_at), 'MMM d, yyyy')}
            </div>
            {isAuthor && (
              <div className="flex items-center gap-1">
                <EditPostDialog post={post} onPostUpdated={onPostUpdated} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line">{post.content}</p>
      </CardContent>
      <CardFooter className="border-t bg-white py-3 flex justify-between">
        <div className="flex items-center gap-4">
          <PostReaction
            postId={post.post_id}
            reaction={reaction}
            isMember={isMember}
            onReactionUpdate={onReactionUpdate}
          />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-collabCorner-purple hover:text-collabCorner-purple/80 hover:bg-collabCorner-purple/10"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Comments {commentCount > 0 && `(${commentCount})`}
          </Button>
        </div>
      </CardFooter>
      
      {isExpanded && (
        <div className="border-t animate-accordion-down">
          <PostComments 
            postId={post.post_id} 
            isMember={isMember}
          />
        </div>
      )}
    </Card>
  );
};

export default PostCard;
