
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import PostList from './PostList';
import CreatePost from './CreatePost';
import DeleteCommunityDialog from './DeleteCommunityDialog';
import CommunityHeader from './CommunityHeader';
import CommunityMembershipActions from './CommunityMembershipActions';
import { useAuth } from '@/contexts/AuthContext';

interface CommunityContentProps {
  community: any;
  memberCount: number;
  isCreator: boolean;
  isMember: boolean;
  showCreatePost: boolean;
  showDeleteDialog: boolean;
  onBack: () => void;
  onDeleteClick: () => void;
  onCloseDeleteDialog: () => void;
  onJoin: () => void;
  onLeave: () => void;
  onToggleCreatePost: () => void;
  communityId: string;
}

const CommunityContent: React.FC<CommunityContentProps> = ({
  community,
  memberCount,
  isCreator,
  isMember,
  showCreatePost,
  showDeleteDialog,
  onBack,
  onDeleteClick,
  onCloseDeleteDialog,
  onJoin,
  onLeave,
  onToggleCreatePost,
  communityId,
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in overflow-hidden hover:shadow-lg transition-all duration-300 border-collabCorner-purple/20">
        <CardHeader className="bg-gradient-to-r from-white to-collabCorner-purple/5">
          <CommunityHeader
            community={community}
            memberCount={memberCount}
            isCreator={isCreator}
            onBack={onBack}
            onDeleteClick={onDeleteClick}
          />
          <div className="flex justify-end mt-4">
            {user && (
              <CommunityMembershipActions
                isMember={isMember}
                showCreatePost={showCreatePost}
                onJoin={onJoin}
                onLeave={onLeave}
                onToggleCreatePost={onToggleCreatePost}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {community?.description && (
            <p className="mb-6 text-muted-foreground">{community.description}</p>
          )}
          
          {showCreatePost && isMember && (
            <div className="mb-8 animate-fade-in">
              <CreatePost 
                communityId={communityId} 
                onSuccess={() => {
                  onToggleCreatePost();
                  toast.success('Post created successfully');
                }}
                onCancel={onToggleCreatePost}
              />
            </div>
          )}
          
          <div className="animate-fade-in">
            <PostList communityId={communityId} isMember={isMember} />
          </div>
        </CardContent>
      </Card>

      <DeleteCommunityDialog
        isOpen={showDeleteDialog}
        onClose={onCloseDeleteDialog}
        communityId={communityId}
        communityName={community?.name || ''}
        onDeleteSuccess={onBack}
      />
    </div>
  );
};

export default CommunityContent;
