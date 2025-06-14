
import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProjectReactionsProps {
  projectId: string;
}

interface ReactionCounts {
  likes: number;
  bookmarks: number;
  views: number;
}

interface UserReactions {
  liked: boolean;
  bookmarked: boolean;
}

const ProjectReactions: React.FC<ProjectReactionsProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ReactionCounts>({ likes: 0, bookmarks: 0, views: 0 });
  const [userReactions, setUserReactions] = useState<UserReactions>({ liked: false, bookmarked: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReactionData();
  }, [projectId, user]);

  const loadReactionData = async () => {
    try {
      // Load reaction counts
      const { data: reactions } = await supabase
        .from('project_reactions')
        .select('reaction_type')
        .eq('project_id', projectId);

      const likesCount = reactions?.filter(r => r.reaction_type === 'like').length || 0;
      const bookmarksCount = reactions?.filter(r => r.reaction_type === 'bookmark').length || 0;

      // Load view count
      const { data: views } = await supabase
        .from('project_views')
        .select('id')
        .eq('project_id', projectId);

      setCounts({
        likes: likesCount,
        bookmarks: bookmarksCount,
        views: views?.length || 0
      });

      // Load user's reactions if logged in
      if (user) {
        const { data: userReactionData } = await supabase
          .from('project_reactions')
          .select('reaction_type')
          .eq('project_id', projectId)
          .eq('user_id', user.id);

        setUserReactions({
          liked: userReactionData?.some(r => r.reaction_type === 'like') || false,
          bookmarked: userReactionData?.some(r => r.reaction_type === 'bookmark') || false
        });
      }
    } catch (error) {
      console.error('Error loading reaction data:', error);
    }
  };

  const toggleReaction = async (type: 'like' | 'bookmark') => {
    if (!user) {
      toast.error('Please sign in to react to projects');
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const isCurrentlyActive = type === 'like' ? userReactions.liked : userReactions.bookmarked;

      if (isCurrentlyActive) {
        // Remove reaction
        await supabase
          .from('project_reactions')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .eq('reaction_type', type);

        setCounts(prev => ({
          ...prev,
          [type === 'like' ? 'likes' : 'bookmarks']: prev[type === 'like' ? 'likes' : 'bookmarks'] - 1
        }));

        setUserReactions(prev => ({
          ...prev,
          [type === 'like' ? 'liked' : 'bookmarked']: false
        }));
      } else {
        // Add reaction
        await supabase
          .from('project_reactions')
          .insert({
            project_id: projectId,
            user_id: user.id,
            reaction_type: type
          });

        setCounts(prev => ({
          ...prev,
          [type === 'like' ? 'likes' : 'bookmarks']: prev[type === 'like' ? 'likes' : 'bookmarks'] + 1
        }));

        setUserReactions(prev => ({
          ...prev,
          [type === 'like' ? 'liked' : 'bookmarked']: true
        }));
      }
    } catch (error: any) {
      console.error('Error toggling reaction:', error);
      toast.error('Failed to update reaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/showcase/${projectId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this project',
          url: url
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Project link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleReaction('like')}
          disabled={isLoading}
          className={`gap-1 ${userReactions.liked ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-red-600'}`}
        >
          <Heart className={`h-4 w-4 ${userReactions.liked ? 'fill-current' : ''}`} />
          {counts.likes}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleReaction('bookmark')}
          disabled={isLoading}
          className={`gap-1 ${userReactions.bookmarked ? 'text-blue-600 hover:text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}
        >
          <Bookmark className={`h-4 w-4 ${userReactions.bookmarked ? 'fill-current' : ''}`} />
          {counts.bookmarks}
        </Button>

        <div className="flex items-center gap-1 text-gray-600">
          <Eye className="h-4 w-4" />
          {counts.views}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="gap-1 text-gray-600 hover:text-blue-600"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </div>
  );
};

export default ProjectReactions;
