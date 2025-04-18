
import React from 'react';
import { Button } from '@/components/ui/button';

interface CommunityMembershipActionsProps {
  isMember: boolean;
  showCreatePost: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onToggleCreatePost: () => void;
}

const CommunityMembershipActions = ({
  isMember,
  showCreatePost,
  onJoin,
  onLeave,
  onToggleCreatePost,
}: CommunityMembershipActionsProps) => {
  if (!isMember) {
    return (
      <Button 
        onClick={onJoin}
        className="bg-collabCorner-purple"
      >
        Join Community
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Button 
        onClick={onToggleCreatePost} 
        className="bg-collabCorner-purple"
      >
        {showCreatePost ? 'Cancel' : 'Create Post'}
      </Button>
      <Button 
        onClick={onLeave}
        variant="outline"
      >
        Leave Community
      </Button>
    </div>
  );
};

export default CommunityMembershipActions;
