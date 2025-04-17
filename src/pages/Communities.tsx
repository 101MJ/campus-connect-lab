import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CommunityDetail from '@/components/communities/CommunityDetail';
import CommunitySidebar from '@/components/communities/CommunitySidebar';
import PostList from '@/components/communities/PostList';
import { Post, RecentPost } from '@/hooks/usePostList';

const communitySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

type CommunityFormValues = z.infer<typeof communitySchema>;

interface Community {
  community_id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by: string;
}

const Communities = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (user) {
      fetchCommunities();
      fetchRecentPosts();
    }
  }, [user]);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const { data: allCommunities, error: allError } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (allError) throw allError;
      
      const { data: userCommunities, error: userError } = await supabase
        .from('communities')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false });
      
      if (userError) throw userError;
      
      const { data: memberships, error: membershipsError } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user!.id);
        
      if (membershipsError) throw membershipsError;
      
      const joinedCommunityIds = memberships?.map(m => m.community_id) || [];
      
      let joined: Community[] = [];
      if (joinedCommunityIds.length > 0) {
        const { data: joinedData, error: joinedError } = await supabase
          .from('communities')
          .select('*')
          .in('community_id', joinedCommunityIds)
          .order('created_at', { ascending: false });
          
        if (joinedError) throw joinedError;
        joined = joinedData || [];
      }
      
      const joinedAndOwnedIds = [...joinedCommunityIds, ...userCommunities?.map(c => c.community_id) || []];
      const recommended = allCommunities?.filter(c => !joinedAndOwnedIds.includes(c.community_id)) || [];
      
      setCommunities(allCommunities || []);
      setMyCommunities(userCommunities || []);
      setJoinedCommunities(joined);
      setRecommendedCommunities(recommended.slice(0, 5));
    } catch (error: any) {
      console.error('Error fetching communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const { data: memberships } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user!.id);
        
      const userCommunityIds = memberships?.map(m => m.community_id) || [];

      const { data: userCommunityPosts, error: userPostsError } = await supabase
        .from('posts')
        .select(`
          post_id,
          title,
          content,
          created_at,
          author_id,
          community_id,
          communities (name)
        `)
        .in('community_id', userCommunityIds)
        .order('created_at', { ascending: false });

      const { data: allPosts, error: allPostsError } = await supabase
        .from('posts')
        .select(`
          post_id,
          title,
          content,
          created_at,
          author_id,
          community_id,
          communities (name)
        `)
        .not('community_id', 'in', userCommunityIds)
        .order('created_at', { ascending: false });

      if (userPostsError || allPostsError) throw userPostsError || allPostsError;

      const allPostIds = [...(userCommunityPosts || []), ...(allPosts || [])].map(p => p.post_id);
      const { data: reactions } = await supabase
        .from('reactions')
        .select('post_id, reaction_type')
        .in('post_id', allPostIds)
        .eq('reaction_type', 'like');

      const likeCounts: Record<string, number> = {};
      reactions?.forEach(reaction => {
        likeCounts[reaction.post_id] = (likeCounts[reaction.post_id] || 0) + 1;
      });

      const userPosts = (userCommunityPosts || []).map(post => ({
        ...post,
        likeCount: likeCounts[post.post_id] || 0
      }));

      const topOtherPosts = (allPosts || [])
        .map(post => ({
          ...post,
          likeCount: likeCounts[post.post_id] || 0
        }))
        .sort((a, b) => b.likeCount - a.likeCount)
        .slice(0, 5);

      const formattedPosts: RecentPost[] = [...userPosts, ...topOtherPosts]
        .map(post => ({
          post_id: post.post_id,
          title: post.title,
          content: post.content,
          created_at: post.created_at,
          community_id: post.community_id,
          communityName: post.communities?.name,
          author_id: post.author_id
        }));

      setRecentPosts(formattedPosts);
    } catch (error: any) {
      console.error('Error fetching recent posts:', error);
    }
  };

  const onSubmit = async (values: CommunityFormValues) => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('communities')
        .insert({
          name: values.name,
          description: values.description || null,
          created_by: user.id,
        })
        .select();
      
      if (error) throw error;
      
      setCommunities([...(data || []), ...communities]);
      setMyCommunities([...(data || []), ...myCommunities]);
      toast.success('Community created successfully');
      form.reset();
      setDialogOpen(false);
      
      if (data && data.length > 0) {
        await supabase
          .from('community_members')
          .insert({
            community_id: data[0].community_id,
            user_id: user.id
          });
        
        setJoinedCommunities([...(data || []), ...joinedCommunities]);
        
        fetchCommunities();
      }
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast.error(error.message || 'Failed to create community');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteCommunity = async (communityId: string) => {
    if (!confirm('Are you sure you want to delete this community?')) return;
    
    try {
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('community_id', communityId);
      
      if (error) throw error;
      
      setCommunities(communities.filter(c => c.community_id !== communityId));
      setMyCommunities(myCommunities.filter(c => c.community_id !== communityId));
      setJoinedCommunities(joinedCommunities.filter(c => c.community_id !== communityId));
      toast.success('Community deleted successfully');
      
      fetchCommunities();
      fetchRecentPosts();
    } catch (error: any) {
      console.error('Error deleting community:', error);
      toast.error(error.message || 'Failed to delete community');
    }
  };

  const handleViewCommunity = (communityId: string) => {
    setSelectedCommunity(communityId);
  };
  
  const handleBackToCommunities = () => {
    setSelectedCommunity(null);
  };

  if (selectedCommunity) {
    return (
      <DashboardLayout>
        <CommunityDetail 
          communityId={selectedCommunity} 
          onBack={handleBackToCommunities}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-collabCorner-purple to-collabCorner-purple-light bg-clip-text text-transparent">
              Communities
            </h1>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-collabCorner-purple hover:bg-collabCorner-purple-dark transition-colors">
                  <Plus className="mr-2 h-4 w-4" /> New Community
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Community</DialogTitle>
                  <DialogDescription>
                    Add the details for your new community
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Community name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Community description"
                              className="resize-none min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create Community'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {activeTab === 'all' && joinedCommunities.length > 0 ? (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Latest Posts from Your Communities</h2>
                <PostList 
                  communityId={joinedCommunities[0].community_id} 
                  isMember={true} 
                />
              </CardContent>
            </Card>
          ) : activeTab === 'my' && myCommunities.length > 0 ? (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Latest Posts from Your Communities</h2>
                <PostList 
                  communityId={myCommunities[0].community_id} 
                  isMember={true} 
                />
              </CardContent>
            </Card>
          ) : activeTab === 'joined' && joinedCommunities.length > 0 ? (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Latest Posts from Joined Communities</h2>
                <PostList 
                  communityId={joinedCommunities[0].community_id} 
                  isMember={true} 
                />
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
              <h2 className="text-xl font-medium mb-2">No communities selected</h2>
              <p className="text-muted-foreground mb-6">
                Select a community from the sidebar to view posts or create a new community
              </p>
              <Button className="bg-collabCorner-purple" onClick={() => setDialogOpen(true)}>
                Create New Community
              </Button>
            </div>
          )}
        </div>

        <CommunitySidebar 
          myCommunities={myCommunities}
          joinedCommunities={joinedCommunities}
          allCommunities={communities}
          recentPosts={recentPosts}
          recommendedCommunities={recommendedCommunities}
          loading={isLoading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onViewCommunity={handleViewCommunity}
        />
      </div>
    </DashboardLayout>
  );
};

export default Communities;
