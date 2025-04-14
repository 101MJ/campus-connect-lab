
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from './PostCard';
import { usePostList } from '@/hooks/usePostList';

interface PostListProps {
  communityId: string;
  isMember: boolean;
}

const PostList: React.FC<PostListProps> = ({ communityId, isMember }) => {
  const { posts, loading, reactions, setReactions } = usePostList(communityId);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="border border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-2">No posts in this community yet</p>
          {isMember && (
            <p className="text-sm">Be the first to create a post!</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const handleReactionUpdate = (postId: string, updatedReaction: any) => {
    setReactions(prev => ({
      ...prev,
      [postId]: updatedReaction
    }));
  };

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.post_id}
          post={post}
          reaction={reactions[post.post_id] || { likes: 0, dislikes: 0 }}
          isMember={isMember}
          onReactionUpdate={handleReactionUpdate}
        />
      ))}
    </div>
  );
};

export default PostList;
