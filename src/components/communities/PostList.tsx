
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import PostComments from './PostComments';
import { Skeleton } from '@/components/ui/skeleton';

interface PostProfile {
  full_name: string | null;
}

interface Post {
  post_id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles?: PostProfile | null;
  community_id?: string;
}

interface PostReaction {
  likes: number;
  dislikes: number;
  userReaction?: string;
}

interface PostListProps {
  communityId: string;
  isMember: boolean;
}

// Interfaces for Supabase real-time payloads
interface RealtimePostPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Post;
  old: Post;
}

interface RealtimeReactionPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: {
    post_id: string;
    [key: string]: any;
  };
  old: {
    post_id: string;
    [key: string]: any;
  };
}

const PostList: React.FC<PostListProps> = ({ communityId, isMember }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, PostReaction>>({});

  useEffect(() => {
    fetchPosts();

    // Enable real-time updates for posts
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'posts',
          filter: `community_id=eq.${communityId}`
        },
        (payload: any) => {
          console.log('Real-time post update:', payload);
          const typedPayload = payload as RealtimePostPayload;
          
          if (typedPayload.eventType === 'INSERT' && typedPayload.new) {
            // Add new post to the list
            const newPost = typedPayload.new as Post;
            setPosts(prevPosts => [newPost, ...prevPosts]);
            
            // Initialize reactions for the new post
            setReactions(prev => ({
              ...prev,
              [newPost.post_id]: { likes: 0, dislikes: 0 }
            }));
          } else if (typedPayload.eventType === 'UPDATE' && typedPayload.new) {
            // Update existing post
            const updatedPost = typedPayload.new as Post;
            setPosts(prevPosts => 
              prevPosts.map(post => 
                post.post_id === updatedPost.post_id ? updatedPost : post
              )
            );
          } else if (typedPayload.eventType === 'DELETE' && typedPayload.old) {
            // Remove deleted post
            const deletedPostId = (typedPayload.old as Post).post_id;
            setPosts(prevPosts => 
              prevPosts.filter(post => post.post_id !== deletedPostId)
            );
            
            // Remove reactions for deleted post
            setReactions(prev => {
              const updatedReactions = { ...prev };
              if (deletedPostId && updatedReactions[deletedPostId]) {
                delete updatedReactions[deletedPostId];
              }
              return updatedReactions;
            });
          }
        }
      )
      .subscribe();

    // Also listen for reaction changes
    const reactionsChannel = supabase
      .channel('reactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `post_id=not.is.null` // Only listen for post reactions, not comment reactions
        },
        (payload: any) => {
          console.log('Real-time reaction update:', payload);
          const typedPayload = payload as RealtimeReactionPayload;
          
          // Re-fetch reactions for affected post
          if (typedPayload.new && typedPayload.new.post_id) {
            fetchReactionsForPosts([typedPayload.new.post_id]);
          } else if (typedPayload.old && typedPayload.old.post_id) {
            fetchReactionsForPosts([typedPayload.old.post_id]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [communityId]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      console.log('Fetching posts for community:', communityId);
      // Fetch posts for this community
      const { data, error } = await supabase
        .from('posts')
        .select(`
          post_id,
          title,
          content,
          created_at,
          author_id,
          profiles(full_name)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Posts data received:', data);
      
      // Make sure we handle possible profile errors by providing a default
      // and transforming the response to match our Post interface
      const safeData = (data || []).map(post => {
        // Check if profiles exists and has the error property (indicating a query error)
        const hasProfileError = post.profiles && 
                               typeof post.profiles === 'object' && 
                               'error' in post.profiles;
        
        return {
          ...post,
          // Fix the null check here by using nullish coalescing to handle both null and error cases
          profiles: hasProfileError || post.profiles === null 
            ? { full_name: null } 
            : post.profiles
        };
      }) as Post[];
      
      setPosts(safeData);
      
      // Get reactions counts for each post
      if (safeData && safeData.length > 0) {
        await fetchReactionsForPosts(safeData.map(post => post.post_id));
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchReactionsForPosts = async (postIds: string[]) => {
    try {
      console.log('Fetching reactions for posts:', postIds);
      // Get all reactions for these posts
      const { data: reactionsData, error } = await supabase
        .from('reactions')
        .select('post_id, reaction_type, user_id')
        .in('post_id', postIds);
      
      if (error) throw error;
      
      console.log('Reactions data received:', reactionsData);
      
      // Calculate likes and dislikes for each post
      const reactionsMap: Record<string, PostReaction> = {};
      
      postIds.forEach(postId => {
        reactionsMap[postId] = { likes: 0, dislikes: 0 };
      });
      
      if (reactionsData) {
        reactionsData.forEach((reaction) => {
          const postId = reaction.post_id;
          if (postId) {
            if (reaction.reaction_type === 'like') {
              reactionsMap[postId].likes += 1;
            } else if (reaction.reaction_type === 'dislike') {
              reactionsMap[postId].dislikes += 1;
            }
            
            // Mark user's reaction
            if (user && reaction.user_id === user.id) {
              reactionsMap[postId].userReaction = reaction.reaction_type;
            }
          }
        });
      }
      
      setReactions(prev => ({ ...prev, ...reactionsMap }));
    } catch (error: any) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    if (!user) {
      toast.error('You must be logged in to react');
      return;
    }
    
    if (!isMember) {
      toast.error('You must join the community to react to posts');
      return;
    }
    
    const currentReaction = reactions[postId]?.userReaction;
    
    try {
      if (currentReaction === reactionType) {
        // User is removing their reaction
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Update local state
        setReactions(prev => {
          const updated = { ...prev };
          if (reactionType === 'like') {
            updated[postId] = { 
              ...updated[postId], 
              likes: Math.max(0, updated[postId].likes - 1),
              userReaction: undefined
            };
          } else {
            updated[postId] = { 
              ...updated[postId], 
              dislikes: Math.max(0, updated[postId].dislikes - 1),
              userReaction: undefined
            };
          }
          return updated;
        });
        
      } else {
        // User is adding or changing reaction
        if (currentReaction) {
          // First remove the existing reaction
          const { error } = await supabase
            .from('reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          // Update local state to remove old reaction
          setReactions(prev => {
            const updated = { ...prev };
            if (currentReaction === 'like') {
              updated[postId].likes = Math.max(0, updated[postId].likes - 1);
            } else {
              updated[postId].dislikes = Math.max(0, updated[postId].dislikes - 1);
            }
            return updated;
          });
        }
        
        // Add the new reaction
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });
          
        if (error) throw error;
        
        // Update local state to add new reaction
        setReactions(prev => {
          const updated = { ...prev };
          if (reactionType === 'like') {
            updated[postId] = { 
              ...updated[postId], 
              likes: (updated[postId].likes || 0) + 1,
              userReaction: 'like'
            };
          } else {
            updated[postId] = { 
              ...updated[postId], 
              dislikes: (updated[postId].dislikes || 0) + 1,
              userReaction: 'dislike'
            };
          }
          return updated;
        });
      }
    } catch (error: any) {
      console.error('Error handling reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  const handleToggleComments = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
            <CardFooter className="border-t py-3">
              <Skeleton className="h-8 w-3/4" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="border border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-2">No posts in this community yet</p>
          {isMember && (
            <p className="text-sm">Be the first to create a post!</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.post_id} className="overflow-hidden">
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>Posted by {post.profiles?.full_name || 'Unknown user'}</div>
              <div>{format(new Date(post.created_at), 'MMM d, yyyy')}</div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{post.content}</p>
          </CardContent>
          <CardFooter className="border-t bg-muted/30 py-3 flex justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                className={reactions[post.post_id]?.userReaction === 'like' ? 'text-green-600' : ''}
                onClick={() => handleReaction(post.post_id, 'like')}
                disabled={!user || !isMember}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {reactions[post.post_id]?.likes || 0}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={reactions[post.post_id]?.userReaction === 'dislike' ? 'text-red-600' : ''}
                onClick={() => handleReaction(post.post_id, 'dislike')}
                disabled={!user || !isMember}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                {reactions[post.post_id]?.dislikes || 0}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleToggleComments(post.post_id)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Comments
              </Button>
            </div>
          </CardFooter>
          
          {expandedPost === post.post_id && (
            <PostComments 
              postId={post.post_id} 
              isMember={isMember}
            />
          )}
        </Card>
      ))}
    </div>
  );
};

export default PostList;
