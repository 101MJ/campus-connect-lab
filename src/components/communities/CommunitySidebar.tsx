
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Clock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { RecentPost } from '@/hooks/usePostList';

interface Community {
  community_id: string;
  name: string;
  description?: string;
}

interface CommunitySidebarProps {
  myCommunities: Community[];
  joinedCommunities: Community[];
  allCommunities: Community[];
  recentPosts: RecentPost[];
  loading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onViewCommunity: (communityId: string) => void;
  onSearch: (query: string) => void;
}

const CommunitySidebar = ({ 
  recentPosts, 
  loading,
  onViewCommunity,
  onSearch,
}: CommunitySidebarProps) => {
  const navigate = useNavigate();

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
          ) : recentPosts.length > 0 ? (
            recentPosts.slice(0, 10).map(post => (
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
