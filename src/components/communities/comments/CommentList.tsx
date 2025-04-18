
import React from 'react';
import CommentCard from './CommentCard';
import type { Comment, CommentReaction } from './useComments';

interface CommentListProps {
  comments: Comment[];
  reactions: Record<string, CommentReaction>;
  isMember: boolean;
  isDeletingComment: string | null;
  onReactionUpdate: (commentId: string, updatedReaction: CommentReaction) => void;
  onDeleteComment: (commentId: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  reactions,
  isMember,
  isDeletingComment,
  onReactionUpdate,
  onDeleteComment,
}) => {
  if (comments.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">No comments yet</p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <CommentCard
          key={comment.comment_id}
          comment={comment}
          reaction={reactions[comment.comment_id] || { likes: 0, dislikes: 0 }}
          isMember={isMember}
          isDeletingComment={isDeletingComment === comment.comment_id}
          onReactionUpdate={onReactionUpdate}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  );
};

export default CommentList;
