
import React from 'react';
import { useCommunityDetail } from '@/hooks/useCommunityDetail';
import CommunityLoadingState from './CommunityLoadingState';
import CommunityNotFound from './CommunityNotFound';
import CommunityContent from './CommunityContent';

interface CommunityDetailProps {
  communityId: string;
  onBack: () => void;
}

const CommunityDetail = ({ communityId, onBack }: CommunityDetailProps) => {
  const {
    community,
    isMember,
    memberCount,
    isCreator,
    isLoading,
    showCreatePost,
    showDeleteDialog,
    setShowCreatePost,
    setShowDeleteDialog,
    handleJoinCommunity,
    handleLeaveCommunity
  } = useCommunityDetail(communityId);

  if (isLoading) {
    return <CommunityLoadingState onBack={onBack} />;
  }

  if (!community) {
    return <CommunityNotFound onBack={onBack} />;
  }

  return (
    <CommunityContent
      community={community}
      memberCount={memberCount}
      isCreator={isCreator}
      isMember={isMember}
      showCreatePost={showCreatePost}
      showDeleteDialog={showDeleteDialog}
      onBack={onBack}
      onDeleteClick={() => setShowDeleteDialog(true)}
      onCloseDeleteDialog={() => setShowDeleteDialog(false)}
      onJoin={handleJoinCommunity}
      onLeave={handleLeaveCommunity}
      onToggleCreatePost={() => setShowCreatePost(!showCreatePost)}
      communityId={communityId}
    />
  );
};

export default CommunityDetail;
