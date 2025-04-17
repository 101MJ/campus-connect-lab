import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users, Clock, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { RecentPost } from '@/hooks/usePostList';

interface Community {
  community_id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface Post {
  post_id: string;
  title: string;
  community_id: string;
  created_at: string;
  communityName?: string;
}

interface CommunitySidebarProps {
  myCommunities: Community[];
  joinedCommunities: Community[];
  allCommunities: Community[];
  recentPosts: RecentPost[];
  recommendedCommunities: Community[];
  loading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onViewCommunity: (communityId: string) => void;
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({
  myCommunities,
  joinedCommunities,
  allCommunities,
  recentPosts,
  recommendedCommunities,
  loading,
  activeTab,
  onTabChange,
  onViewCommunity
}) => {
  const navigate = useNavigate();

  const renderCommunityList = (communities: Community[], limit: number = 5) => {
    if (loading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-2 py-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ));
    }
    
    if (communities.length === 0) {
      return <p className="text-sm text-muted-foreground py-2">No communities found</p>;
    }
    
    return communities.slice(0, limit).map(community => (
      <div 
        key={community.community_id} 
        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer group"
        onClick={() => onViewCommunity(community.community_id)}
      >
        <div className="bg-collabCorner-purple/10 rounded-full p-1 group-hover:bg-collabCorner-purple/20">
          <Users className="h-5 w-5 text-collabCorner-purple" />
        </div>
        <div>
          <p className="font-medium text-sm line-clamp-1">{community.name}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(community.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
    ));
  };

  const tabButtonClass = (tabName: string) => 
    `text-sm py-1 px-3 rounded-md transition-all ${
      activeTab === tabName 
        ? "bg-collabCorner-purple text-white" 
        : "hover:bg-muted"
    }`;

  return (
    <aside className="hidden md:block w-80 space-y-6 pl-6">
      {/* Community Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-collabCorner-purple" />
            Communities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="ghost" 
              className={tabButtonClass('all')} 
              onClick={() => onTabChange('all')}
            >
              All
            </Button>
            <Button 
              variant="ghost" 
              className={tabButtonClass('joined')} 
              onClick={() => onTabChange('joined')}
            >
              Joined
            </Button>
            <Button 
              variant="ghost" 
              className={tabButtonClass('my')} 
              onClick={() => onTabChange('my')}
            >
              My Communities
            </Button>
          </div>
          
          <div className="space-y-3">
            {activeTab === 'all' && renderCommunityList(allCommunities)}
            {activeTab === 'joined' && renderCommunityList(joinedCommunities)}
            {activeTab === 'my' && renderCommunityList(myCommunities)}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-collabCorner-purple border-collabCorner-purple/30 hover:bg-collabCorner-purple/10"
          >
            View All Communities
          </Button>
        </CardContent>
      </Card>

      {/* Recommended Communities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-collabCorner-purple" />
            Recommended
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderCommunityList(recommendedCommunities, 3)}
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
            recentPosts.slice(0, 5).map(post => (
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
