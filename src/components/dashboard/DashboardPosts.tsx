
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecentPosts } from '@/hooks/useRecentPosts';
import { useCommunityManager } from '@/hooks/useCommunityManager';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import PostCard from '@/components/communities/PostCard';
import { usePostReactions } from '@/hooks/usePostReactions';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { joinedCommunities } = useCommunityManager();
  const { recentPosts, loading, fetchRecentPosts } = useRecentPosts(user?.id, joinedCommunities);
  const { reactions, setReactions } = usePostReactions();

  // Sort posts by date in descending order
  const sortedPosts = [...recentPosts].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleReactionUpdate = (postId: string, updatedReaction: any) => {
    setReactions(prev => ({
      ...prev,
      [postId]: updatedReaction
    }));
  };

  if (!user) return null;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-collabCorner-purple" />
          Recent Community Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array(2).fill(0).map((_, i) => (
              <div 
                key={i}
                className="p-4 border rounded-lg"
                style={{ 
                  opacity: 0,
                  animation: 'fadeIn 0.5s ease-in-out forwards',
                  animationDelay: `${i * 150}ms`
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-8 w-8 rounded-full" animation="wave" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-2/3" animation="wave" />
                    <Skeleton className="h-3 w-1/4" animation="wave" />
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  <Skeleton className="h-3 w-full" animation="wave" />
                  <Skeleton className="h-3 w-full" animation="wave" />
                  <Skeleton className="h-3 w-3/4" animation="wave" />
                </div>
                <div className="flex gap-3 mt-3">
                  <Skeleton className="h-6 w-16" animation="wave" />
                  <Skeleton className="h-6 w-24" animation="wave" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedPosts.length > 0 ? (
          <div className="space-y-6">
            {sortedPosts.map(post => (
              <PostCard
                key={post.post_id}
                post={post}
                reaction={reactions[post.post_id] || { likes: 0, dislikes: 0 }}
                isMember={true}
                onReactionUpdate={handleReactionUpdate}
                onPostUpdated={fetchRecentPosts}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No posts yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => navigate('/dashboard/communities')}
            >
              Explore Communities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardPosts;
