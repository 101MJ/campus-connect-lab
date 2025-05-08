
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft, Trash2 } from 'lucide-react';

interface CommunityHeaderProps {
  community: {
    name: string;
    created_at: string;
  };
  memberCount: number;
  isCreator: boolean;
  onBack: () => void;
  onDeleteClick: () => void;
}

const CommunityHeader = ({
  community,
  memberCount,
  isCreator,
  onBack,
  onDeleteClick,
}: CommunityHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <Button onClick={onBack} variant="outline" size="sm" className="hover:bg-collabCorner-purple/5 hover:border-collabCorner-purple/20">
          <ArrowLeft className="mr-2 h-4 w-4 text-collabCorner-purple" /> Back
        </Button>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-collabCorner-purple" />
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-collabCorner-purple to-collabCorner-purple-light bg-clip-text text-transparent">
              {community.name}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Users className="h-4 w-4" />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
            <span>•</span>
            <span>Created {format(new Date(community.created_at || ''), 'MMM d, yyyy')}</span>
          </div>
        </div>
        {isCreator && (
          <Button
            onClick={onDeleteClick}
            variant="destructive"
            size="icon"
            className="ml-2 transition-all duration-200 hover:scale-105"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );
};

export default CommunityHeader;
