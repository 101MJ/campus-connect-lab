
import React from 'react';
import { useComments } from './comments/useComments';
import CommentForm from './comments/CommentForm';
import CommentList from './comments/CommentList';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PostCommentsProps {
  postId: string;
  isMember: boolean;
}

const PostComments: React.FC<PostCommentsProps> = ({ postId, isMember }) => {
  const [expanded, setExpanded] = React.useState(true);
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

  const commentCount = comments.length;

  return (
    <div className="border-t">
      <div className="p-3 flex items-center justify-between border-b">
        <h3 className="font-medium flex items-center">
          Comments {commentCount > 0 && `(${commentCount})`}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span className="text-sm">Hide</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span className="text-sm">Show</span>
            </>
          )}
        </Button>
      </div>
      
      {expanded && (
        <>
          <CommentForm
            postId={postId}
            isMember={isMember}
            onCommentAdded={fetchComments}
          />
          
          <div className={`p-4 space-y-4 max-h-[400px] overflow-y-auto ${comments.length > 0 ? 'animate-accordion-down' : ''}`}>
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
        </>
      )}
    </div>
  );
};

export default PostComments;
