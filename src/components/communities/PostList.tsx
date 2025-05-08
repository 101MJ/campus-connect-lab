
import React, { useState } from 'react';
import { usePostList } from '@/hooks/usePostList';
import PostCard from './PostCard';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import PostTagsFilter from './PostTagsFilter';

interface PostListProps {
  communityId: string;
  isMember: boolean;
}

const PostList: React.FC<PostListProps> = ({ communityId, isMember }) => {
  const { posts, loading, reactions, setReactions, fetchPosts } = usePostList(communityId);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const handleReactionUpdate = (postId: string, updatedReaction: any) => {
    setReactions(prev => ({
      ...prev,
      [postId]: updatedReaction
    }));
  };

  const handleFilterChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gradient">Community Posts</h2>
          <Button variant="outline" size="sm" disabled>
            <Plus className="h-4 w-4 mr-1" />
            New Post
          </Button>
        </div>
        {Array(3).fill(0).map((_, i) => (
          <div 
            key={i} 
            className="mb-6 p-6 rounded-md border bg-card animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-5 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-3 bg-muted rounded w-1/4 mb-6"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-4/5"></div>
            </div>
            <div className="flex gap-3 mt-4">
              <div className="h-8 w-20 bg-muted rounded"></div>
              <div className="h-8 w-28 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed animate-fade-in">
        <div className="p-3 rounded-full bg-muted inline-flex items-center justify-center mb-4">
          <Filter className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium mb-2">No posts in this community yet</h2>
        <p className="text-muted-foreground mb-6">
          {isMember 
            ? "Be the first to start a conversation!" 
            : "Join this community to start a conversation"}
        </p>
        {isMember && (
          <Button className="bg-collabCorner-purple">
            <Plus className="h-4 w-4 mr-1" />
            Create Post
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gradient">Community Posts</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTagFilter(!showTagFilter)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            {selectedTags.length > 0 && (
              <span className="bg-collabCorner-purple text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium">
                {selectedTags.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {showTagFilter && (
        <div className="animate-fade-in">
          <PostTagsFilter onFilterChange={handleFilterChange} />
        </div>
      )}
      
      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.post_id}
              post={post}
              reaction={reactions[post.post_id] || { likes: 0, dislikes: 0, userReaction: null }}
              isMember={isMember}
              onReactionUpdate={handleReactionUpdate}
              onPostUpdated={fetchPosts}
              filterTags={selectedTags}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No posts match your selected filters</p>
          {selectedTags.length > 0 && (
            <Button 
              variant="link" 
              className="text-collabCorner-purple"
              onClick={() => setSelectedTags([])}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostList;
