
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyCommunityStateProps {
  onCreateClick: () => void;
}

const EmptyCommunityState: React.FC<EmptyCommunityStateProps> = ({ onCreateClick }) => {
  return (
    <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
      <Users className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
      <h2 className="text-xl font-medium mb-2">No communities selected</h2>
      <p className="text-muted-foreground mb-6">
        Select a community from the sidebar to view posts or create a new community
      </p>
      <Button className="bg-collabCorner-purple" onClick={onCreateClick}>
        Create New Community
      </Button>
    </div>
  );
};

export default EmptyCommunityState;
