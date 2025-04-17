
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Community {
  community_id: string;
  name: string;
  description?: string;
}

interface CommunitiesTabProps {
  communities: Community[];
  loading: boolean;
}

const CommunitiesTab = ({ communities, loading }: CommunitiesTabProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-soft-blue/20 border-soft-blue/10">
      <CardHeader>
        <CardTitle className="text-collabCorner-purple">Communities</CardTitle>
        <CardDescription>Communities you're part of</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading communities...</div>
        ) : communities.length > 0 ? (
          <div className="space-y-4">
            {communities.slice(0, 3).map((community) => (
              <div 
                key={community.community_id} 
                className="p-3 bg-white rounded-lg hover:shadow-md transition-all hover:border-collabCorner-purple/20 border border-transparent"
              >
                <h3 className="font-semibold">{community.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {community.description?.substring(0, 100) || 'No description'}
                  {community.description?.length > 100 && '...'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No communities found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunitiesTab;
