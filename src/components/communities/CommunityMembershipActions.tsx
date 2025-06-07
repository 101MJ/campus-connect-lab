
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3 } from 'lucide-react';

interface CommunityMembershipActionsProps {
  isMember: boolean;
  showCreatePost: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onToggleCreatePost: () => void;
  onToggleCreatePoll?: () => void;
}

const CommunityMembershipActions = ({
  isMember,
  showCreatePost,
  onJoin,
  onLeave,
  onToggleCreatePost,
  onToggleCreatePoll,
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
      {onToggleCreatePoll && (
        <Button 
          onClick={onToggleCreatePoll}
          variant="outline"
          className="border-collabCorner-purple text-collabCorner-purple hover:bg-collabCorner-purple hover:text-white"
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          Create Poll
        </Button>
      )}
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
