
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  DESKTOP: 15,
  MOBILE: 8
};

const PostList: React.FC<PostListProps> = ({ communityId, isMember }) => {
  const { posts, loading, reactions, setReactions } = usePostList(communityId);
  const [visiblePosts, setVisiblePosts] = useState<number>(window.innerWidth >= 768 ? POSTS_PER_PAGE.DESKTOP : POSTS_PER_PAGE.MOBILE);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);

  // Handle window resize for responsive post count
  useEffect(() => {
    const handleResize = () => {
      setVisiblePosts(window.innerWidth >= 768 ? POSTS_PER_PAGE.DESKTOP : POSTS_PER_PAGE.MOBILE);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update hasMore when posts length changes
  useEffect(() => {
    setHasMore(posts.length > visiblePosts);
  }, [posts.length, visiblePosts]);

  // Set up intersection observer for infinite scroll
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
    });
    
    if (node) observer.current.observe(node);
    lastPostRef.current = node;
  }, [loading, hasMore]);

  const handleReactionUpdate = (postId: string, updatedReaction: any) => {
    setReactions(prev => ({
      ...prev,
      [postId]: updatedReaction
    }));
  };

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

  return (
    <div className="space-y-6 relative pb-10">
      {posts.slice(0, visiblePosts).map((post, index) => {
        const isLastPost = index === visiblePosts - 1;
        
        return (
          <div key={post.post_id} ref={isLastPost ? lastPostElementRef : null}>
            <PostCard
              post={post}
              reaction={reactions[post.post_id] || { likes: 0, dislikes: 0 }}
              isMember={isMember}
              onReactionUpdate={handleReactionUpdate}
            />
          </div>
        );
      })}
      
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-collabCorner-purple" />
        </div>
      )}
    </div>
  );
};

export default PostList;
