
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
    <Card>
      <CardHeader>
        <CardTitle>Communities</CardTitle>
        <CardDescription>Communities you're part of</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading communities...</div>
        ) : communities.length > 0 ? (
          <div className="space-y-4">
            {communities.slice(0, 3).map((community) => (
              <div key={community.community_id} className="border-b pb-4 last:border-0">
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
