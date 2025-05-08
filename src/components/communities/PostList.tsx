
import React, { useRef, useEffect } from 'react';
import { usePostList } from '@/hooks/usePostList';
import PostCard from './PostCard';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { FixedSizeList as List } from 'react-window';
import { useInView } from 'react-intersection-observer';

interface PostListProps {
  communityId: string;
  isMember: boolean;
}

const PostList: React.FC<PostListProps> = ({ communityId, isMember }) => {
  const { posts, loading, reactions, setReactions, fetchPosts } = usePostList(communityId);
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: loadingRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  useEffect(() => {
    // Trigger animations for skeleton loaders when in view
    if (inView && loading) {
      // Animation is handled via CSS
    }
  }, [inView, loading]);

  const handleReactionUpdate = (postId: string, updatedReaction: any) => {
    setReactions(prev => ({
      ...prev,
      [postId]: updatedReaction
    }));
  };

  const getListHeight = () => {
    // Responsive height calculation based on container and viewport
    if (!containerRef.current) return Math.min(window.innerHeight * 0.7, 700);
    return Math.min(
      containerRef.current.getBoundingClientRect().height || window.innerHeight * 0.7, 
      700
    ); 
  };

  const PostRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const post = posts[index];
    return (
      <div style={{ ...style, paddingBottom: '24px' }}>
        <PostCard
          key={post.post_id}
          post={post}
          reaction={reactions[post.post_id] || { likes: 0, dislikes: 0, userReaction: null }}
          isMember={isMember}
          onReactionUpdate={handleReactionUpdate}
          onPostUpdated={fetchPosts}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-fade-in" ref={loadingRef}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gradient">Community Posts</h2>
          <Button variant="outline" size="sm" disabled>
            <Plus className="h-4 w-4 mr-1" />
            New Post
          </Button>
        </div>
        {Array(3).fill(0).map((_, i) => (
          <div 
            key={i} 
            className="mb-6 rounded-md border bg-card shadow-sm"
            style={{ 
              animationDelay: `${i * 100}ms`, 
              opacity: 0,
              animation: 'fadeIn 0.5s ease-in-out forwards',
              animationDelay: `${i * 150}ms`
            }}
          >
            {/* Better matching skeleton UI */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-2 mt-4">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
            <div className="border-t p-3 flex gap-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed animate-fade-in">
        <div className="p-3 rounded-full bg-muted inline-flex items-center justify-center mb-4">
          <Filter className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium mb-2">No posts in this community yet</h2>
        <p className="text-muted-foreground mb-6">
          {isMember 
            ? "Be the first to start a conversation!" 
            : "Join this community to start a conversation"}
        </p>
        {isMember && (
          <Button className="bg-collabCorner-purple">
            <Plus className="h-4 w-4 mr-1" />
            Create Post
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" ref={containerRef}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gradient">Community Posts</h2>
      </div>
      
      {posts.length <= 3 ? (
        // For small number of posts, don't use virtualization
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.post_id}
              post={post}
              reaction={reactions[post.post_id] || { likes: 0, dislikes: 0, userReaction: null }}
              isMember={isMember}
              onReactionUpdate={handleReactionUpdate}
              onPostUpdated={fetchPosts}
            />
          ))}
        </div>
      ) : (
        // Use virtualization for larger lists
        <List
          height={getListHeight()}
          width="100%"
          itemCount={posts.length}
          itemSize={250} // Average height of a post card
          overscanCount={2} // Pre-render some items for smoother scrolling
        >
          {PostRow}
        </List>
      )}
    </div>
  );
};

export default PostList;
