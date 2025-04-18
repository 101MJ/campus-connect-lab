import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PostList from './PostList';
import CreatePost from './CreatePost';
import { ArrowLeft, Users, Trash2 } from 'lucide-react';
import DeleteCommunityDialog from './DeleteCommunityDialog';

interface CommunityDetailProps {
  communityId: string;
  onBack: () => void;
}

const CommunityDetail = ({ communityId, onBack }: CommunityDetailProps) => {
  const { user } = useAuth();
  const [community, setCommunity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    if (communityId) {
      fetchCommunityDetails();
    }
  }, [communityId, user]);

  const fetchCommunityDetails = async () => {
    setIsLoading(true);
    try {
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('community_id', communityId)
        .single();
      
      if (communityError) throw communityError;
      setCommunity(communityData);

      if (user) {
        const { data: membershipData, error: membershipError } = await supabase
          .from('community_members')
          .select('*')
          .eq('community_id', communityId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (membershipError) throw membershipError;
        setIsMember(!!membershipData);
      }

      const { count, error: countError } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId);
      
      if (countError) throw countError;
      setMemberCount(count || 0);
      
    } catch (error: any) {
      console.error('Error fetching community details:', error);
      toast.error('Failed to load community details');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIsCreator = async () => {
    if (user && community) {
      setIsCreator(user.id === community.created_by);
    }
  };

  useEffect(() => {
    checkIsCreator();
  }, [user, community]);

  const handleJoinCommunity = async () => {
    if (!user) {
      toast.error('You must be logged in to join communities');
      return;
    }

    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id
        });
      
      if (error) throw error;
      
      setIsMember(true);
      setMemberCount(prev => prev + 1);
      toast.success('Successfully joined community');
    } catch (error: any) {
      console.error('Error joining community:', error);
      toast.error('Failed to join community');
    }
  };

  const handleLeaveCommunity = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setIsMember(false);
      setMemberCount(prev => Math.max(0, prev - 1));
      toast.success('Successfully left community');
    } catch (error: any) {
      console.error('Error leaving community:', error);
      toast.error('Failed to leave community');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading community details...</div>;
  }

  if (!community) {
    return (
      <div className="text-center py-8">
        <p>Community not found</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Communities
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
      
      <Card>
        <CardHeader className="bg-muted/50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-collabCorner-purple" />
              {community?.name}
            </CardTitle>
            <div className="flex items-center gap-4">
              {user && (
                isMember ? (
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={() => setShowCreatePost(!showCreatePost)} 
                      className="bg-collabCorner-purple"
                    >
                      {showCreatePost ? 'Cancel' : 'Create Post'}
                    </Button>
                    <Button 
                      onClick={handleLeaveCommunity}
                      variant="outline"
                    >
                      Leave Community
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleJoinCommunity}
                    className="bg-collabCorner-purple"
                  >
                    Join Community
                  </Button>
                )
              )}
              {isCreator && (
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                  size="icon"
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Users className="h-4 w-4" />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
            <span>•</span>
            <span>Created {format(new Date(community?.created_at || ''), 'MMM d, yyyy')}</span>
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
                  setShowCreatePost(false);
                  toast.success('Post created successfully');
                }}
                onCancel={() => setShowCreatePost(false)}
              />
            </div>
          )}
          
          <PostList communityId={communityId} isMember={isMember} />
        </CardContent>
      </Card>

      <DeleteCommunityDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        communityId={communityId}
        communityName={community?.name || ''}
        onDeleteSuccess={onBack}
      />
    </div>
  );
};

export default CommunityDetail;
