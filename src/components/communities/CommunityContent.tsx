
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      <Card>
        <CardHeader className="bg-muted/50">
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
            <div className="mb-8">
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
          
          <PostList communityId={communityId} isMember={isMember} />
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
