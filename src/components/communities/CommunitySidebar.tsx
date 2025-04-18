import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Clock, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { RecentPost } from '@/hooks/useRecentPosts';

interface Community {
  community_id: string;
  name: string;
  description?: string;
}

interface CommunitySidebarProps {
  myCommunities: Community[];
  joinedCommunities: Community[];
  recentPosts: RecentPost[];
  loading: boolean;
  onViewCommunity: (communityId: string) => void;
  onSearch: (query: string) => void;
}

const CommunitySidebar = ({ 
  myCommunities,
  joinedCommunities,
  recentPosts, 
  loading,
  onViewCommunity,
  onSearch,
}: CommunitySidebarProps) => {
  const navigate = useNavigate();

  // Sort posts by date in descending order
  const sortedPosts = [...recentPosts].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <aside className="hidden md:block w-80 space-y-6 pl-6">
      {/* Search Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-collabCorner-purple" />
            Find Communities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search communities..."
            className="w-full"
            onChange={(e) => onSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* My Communities */}
      {myCommunities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-collabCorner-purple" />
              My Communities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myCommunities.map(community => (
              <div 
                key={community.community_id}
                onClick={() => onViewCommunity(community.community_id)}
                className="cursor-pointer p-2 rounded-md hover:bg-muted transition-colors"
              >
                <h4 className="font-medium text-sm">{community.name}</h4>
                {community.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{community.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Joined Communities */}
      {joinedCommunities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-collabCorner-purple" />
              Joined Communities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {joinedCommunities.map(community => (
              <div 
                key={community.community_id}
                onClick={() => onViewCommunity(community.community_id)}
                className="cursor-pointer p-2 rounded-md hover:bg-muted transition-colors"
              >
                <h4 className="font-medium text-sm">{community.name}</h4>
                {community.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{community.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Posts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-collabCorner-purple" />
            Recent Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="py-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))
          ) : sortedPosts.length > 0 ? (
            sortedPosts.map(post => (
              <div 
                key={post.post_id} 
                className="py-2 cursor-pointer hover:text-collabCorner-purple"
                onClick={() => onViewCommunity(post.community_id)}
              >
                <p className="text-sm font-medium line-clamp-1">{post.title}</p>
                <p className="text-xs text-muted-foreground">
                  {post.communityName && `in ${post.communityName} • `}
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-2">No recent posts</p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
};

export default CommunitySidebar;
