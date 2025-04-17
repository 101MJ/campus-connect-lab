import React, { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PostComments from './PostComments';
import PostReaction from './PostReaction';
import type { Post } from '@/hooks/usePostList';
import type { PostReaction as PostReactionType } from '@/hooks/usePostReactions';

interface PostCardProps {
  post: Post;
  reaction: PostReactionType;
  isMember: boolean;
  onReactionUpdate: (postId: string, updatedReaction: PostReactionType) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  reaction,
  isMember,
  onReactionUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
      <CardHeader>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-collabCorner-purple/10 rounded-full">
            <User className="h-5 w-5 text-collabCorner-purple" />
          </div>
          <div>
            <CardTitle className="text-lg">{post.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Posted by {post.profiles?.full_name ?? 'Unknown user'}
            </div>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            {format(new Date(post.created_at), 'MMM d, yyyy')}
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
            Comments
          </Button>
        </div>
      </CardFooter>
      
      {isExpanded && (
        <div className="border-t">
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
