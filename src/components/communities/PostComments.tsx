
import React from 'react';
import { useComments } from './comments/useComments';
import CommentForm from './comments/CommentForm';
import CommentList from './comments/CommentList';

interface PostCommentsProps {
  postId: string;
  isMember: boolean;
}

const PostComments: React.FC<PostCommentsProps> = ({ postId, isMember }) => {
  const {
    comments,
    reactions,
    isLoading,
    isDeletingComment,
    setReactions,
    handleDeleteComment,
    fetchComments
  } = useComments(postId);

  const handleReactionUpdate = (commentId: string, updatedReaction: any) => {
    setReactions(prev => ({
      ...prev,
      [commentId]: updatedReaction
    }));
  };

  return (
    <div className="border-t divide-y">
      <CommentForm
        postId={postId}
        isMember={isMember}
        onCommentAdded={fetchComments}
      />
      
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading comments...</p>
        ) : (
          <CommentList
            comments={comments}
            reactions={reactions}
            isMember={isMember}
            isDeletingComment={isDeletingComment}
            onReactionUpdate={handleReactionUpdate}
            onDeleteComment={handleDeleteComment}
          />
        )}
      </div>
    </div>
  );
};

export default PostComments;
