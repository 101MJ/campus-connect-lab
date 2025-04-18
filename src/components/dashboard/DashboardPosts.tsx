
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecentPosts } from '@/hooks/useRecentPosts';
import { useCommunityManager } from '@/hooks/useCommunityManager';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

const DashboardPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { joinedCommunities } = useCommunityManager();
  const { recentPosts, loading } = useRecentPosts(user?.id, joinedCommunities);

  // Sort posts by date in descending order
  const sortedPosts = [...recentPosts].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleViewCommunity = (communityId: string) => {
    navigate(`/dashboard/communities?community=${communityId}`);
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
          <div className="space-y-4">
            {sortedPosts.map(post => (
              <div 
                key={post.post_id}
                onClick={() => handleViewCommunity(post.community_id)}
                className="cursor-pointer"
              >
                <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {post.communityName && `From ${post.communityName} • `}
                      {format(new Date(post.created_at), 'MMM d, yyyy, h:mm a')}
                    </p>
                    <p className="mt-2 line-clamp-2">{post.content}</p>
                  </CardContent>
                </Card>
              </div>
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
