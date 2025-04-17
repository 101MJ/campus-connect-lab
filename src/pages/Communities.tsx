import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import PostList from '@/components/communities/PostList';
import CommunityDetail from '@/components/communities/CommunityDetail';
import CommunitySidebar from '@/components/communities/CommunitySidebar';
import CreateCommunityDialog from '@/components/communities/CreateCommunityDialog';
import EmptyCommunityState from '@/components/communities/EmptyCommunityState';
import { useCommunityManager } from '@/hooks/useCommunityManager';
import { useRecentPosts } from '@/hooks/useRecentPosts';

const Communities = () => {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCommunities, setFilteredCommunities] = useState<any[]>([]);

  const { 
    communities,
    myCommunities,
    joinedCommunities,
    isLoading,
    createCommunity
  } = useCommunityManager();

  const { recentPosts } = useRecentPosts(user?.id, joinedCommunities);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredCommunities([]);
      return;
    }

    const filtered = communities.filter(community => 
      community.name.toLowerCase().includes(query.toLowerCase()) ||
      (community.description?.toLowerCase() || '').includes(query.toLowerCase())
    );
    setFilteredCommunities(filtered);
  };

  const handleViewCommunity = (communityId: string) => {
    setSelectedCommunity(communityId);
  };
  
  const handleBackToCommunities = () => {
    setSelectedCommunity(null);
  };

  if (selectedCommunity) {
    return (
      <DashboardLayout>
        <CommunityDetail 
          communityId={selectedCommunity} 
          onBack={handleBackToCommunities}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-collabCorner-purple to-collabCorner-purple-light bg-clip-text text-transparent">
              Communities
            </h1>
            <CreateCommunityDialog onCreateSuccess={createCommunity} />
          </div>

          {searchQuery && filteredCommunities.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                <div className="space-y-4">
                  {filteredCommunities.map((community) => (
                    <div 
                      key={community.community_id} 
                      className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleViewCommunity(community.community_id)}
                    >
                      <h3 className="font-semibold">{community.name}</h3>
                      {community.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {community.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!searchQuery && joinedCommunities.length > 0 ? (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Latest Posts from Your Communities</h2>
                <PostList 
                  communityId={joinedCommunities[0].community_id} 
                  isMember={true} 
                />
              </CardContent>
            </Card>
          ) : (
            <EmptyCommunityState onCreateClick={() => setDialogOpen(true)} />
          )}
        </div>

        <CommunitySidebar 
          myCommunities={myCommunities}
          joinedCommunities={joinedCommunities}
          recentPosts={recentPosts}
          loading={isLoading}
          onViewCommunity={handleViewCommunity}
          onSearch={handleSearch}
        />
      </div>
    </DashboardLayout>
  );
};

export default Communities;
