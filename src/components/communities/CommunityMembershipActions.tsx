
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
    <div className="flex items-center gap-3">
      <Button 
        onClick={onToggleCreatePost} 
        className="bg-collabCorner-purple"
      >
        <Plus className="h-4 w-4 mr-1" />
        {showCreatePost ? 'Cancel Post' : 'Create Post'}
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
