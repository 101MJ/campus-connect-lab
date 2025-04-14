
import React, { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PostComments from './PostComments';
import PostReaction from './PostReaction';
import type { Post, PostReaction as PostReactionType } from '@/hooks/usePostList';

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
    <Card key={post.post_id} className="overflow-hidden">
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>Posted by {post.profiles?.full_name ?? 'Unknown user'}</div>
          <div>{format(new Date(post.created_at), 'MMM d, yyyy')}</div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line">{post.content}</p>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 py-3 flex justify-between">
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
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Comments
          </Button>
        </div>
      </CardFooter>
      
      {isExpanded && (
        <PostComments 
          postId={post.post_id} 
          isMember={isMember}
        />
      )}
    </Card>
  );
};

export default PostCard;
