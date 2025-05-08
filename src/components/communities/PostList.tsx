
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from './PostCard';
import { usePostList } from '@/hooks/usePostList';
import { Loader2 } from 'lucide-react';

interface PostListProps {
  communityId: string;
  isMember: boolean;
}

const POSTS_PER_PAGE = {
  DESKTOP: 10,
  MOBILE: 5
};

// Use memo to prevent unnecessary re-renders
const PostList: React.FC<PostListProps> = memo(({ communityId, isMember }) => {
  const { posts, loading, reactions, setReactions, fetchPosts } = usePostList(communityId);
  const [visiblePosts, setVisiblePosts] = useState<number>(window.innerWidth >= 768 ? POSTS_PER_PAGE.DESKTOP : POSTS_PER_PAGE.MOBILE);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);

  // Handle window resize for responsive post count
  useEffect(() => {
    const handleResize = () => {
      setVisiblePosts(prev => {
        // Only reset if changing screen size category
        const newSize = window.innerWidth >= 768 ? POSTS_PER_PAGE.DESKTOP : POSTS_PER_PAGE.MOBILE;
        const prevSize = prev <= POSTS_PER_PAGE.MOBILE ? POSTS_PER_PAGE.MOBILE : POSTS_PER_PAGE.DESKTOP;
        return prevSize !== newSize ? newSize : prev;
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update hasMore when posts length changes
  useEffect(() => {
    setHasMore(posts.length > visiblePosts);
  }, [posts.length, visiblePosts]);

  // Set up intersection observer for infinite scroll - optimized
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setVisiblePosts(prevVisiblePosts => {
          const increment = window.innerWidth >= 768 ? POSTS_PER_PAGE.DESKTOP : POSTS_PER_PAGE.MOBILE;
          return prevVisiblePosts + increment;
        });
      }
    }, { rootMargin: '100px' });
    
    if (node) observer.current.observe(node);
    lastPostRef.current = node;
  }, [loading, hasMore]);

  const handleReactionUpdate = useCallback((postId: string, updatedReaction: any) => {
    setReactions(prev => ({
      ...prev,
      [postId]: updatedReaction
    }));
  }, [setReactions]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse-slow">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
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
      <Card className="border border-dashed animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-2">No posts in this community yet</p>
          {isMember && (
            <p className="text-sm">Be the first to create a post!</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Use visiblePosts to limit rendered items for better performance
  const visiblePostsList = posts.slice(0, visiblePosts);

  return (
    <div className="space-y-6 relative pb-10">
      {visiblePostsList.map((post, index) => {
        const isLastPost = index === visiblePostsList.length - 1;
        
        return (
          <div 
            key={post.post_id} 
            ref={isLastPost ? lastPostElementRef : null}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <PostCard
              post={post}
              reaction={reactions[post.post_id] || { likes: 0, dislikes: 0 }}
              isMember={isMember}
              onReactionUpdate={handleReactionUpdate}
              onPostUpdated={fetchPosts}
            />
          </div>
        );
      })}
      
      {loading && (
        <div className="flex justify-center py-4 animate-fade-in">
          <Loader2 className="w-6 h-6 animate-spin text-collabCorner-purple" />
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="h-10" /> // Space for intersection observer
      )}
    </div>
  );
});

PostList.displayName = 'PostList';

export default PostList;
