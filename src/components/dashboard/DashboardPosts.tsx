
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecentPosts } from '@/hooks/useRecentPosts';
import { useCommunityManager } from '@/hooks/useCommunityManager';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import PostCard from '@/components/communities/PostCard';
import { usePostReactions } from '@/hooks/usePostReactions';

const DashboardPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { joinedCommunities } = useCommunityManager();
  const { recentPosts, loading } = useRecentPosts(user?.id, joinedCommunities);
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
          <div className="text-center py-4">Loading posts...</div>
        ) : sortedPosts.length > 0 ? (
          <div className="space-y-6">
            {sortedPosts.map(post => (
              <PostCard
                key={post.post_id}
                post={post}
                reaction={reactions[post.post_id] || { likes: 0, dislikes: 0 }}
                isMember={true}
                onReactionUpdate={handleReactionUpdate}
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
