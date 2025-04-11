
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

const communitySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

type CommunityFormValues = z.infer<typeof communitySchema>;

const Communities = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<any[]>([]);
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    }
  }, [user]);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      // Fetch all communities
      const { data: allCommunities, error: allError } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (allError) throw allError;
      
      // Fetch user's created communities
      const { data: userCommunities, error: userError } = await supabase
        .from('communities')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false });
      
      if (userError) throw userError;
      
      setCommunities(allCommunities || []);
      setMyCommunities(userCommunities || []);
    } catch (error: any) {
      console.error('Error fetching communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setIsLoading(false);
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
      toast.success('Community deleted successfully');
    } catch (error: any) {
      console.error('Error deleting community:', error);
      toast.error(error.message || 'Failed to delete community');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Communities</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-collabCorner-purple">
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

        {/* My Communities Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">My Communities</h2>
          {isLoading ? (
            <div className="text-center py-4">Loading communities...</div>
          ) : myCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCommunities.map((community) => (
                <Card key={community.community_id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-collabCorner-purple" />
                      {community.name}
                    </CardTitle>
                    <CardDescription>
                      Created {format(new Date(community.created_at), 'MMM d, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {community.description || 'No description provided'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteCommunity(community.community_id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  You haven't created any communities yet
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* All Communities Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">All Communities</h2>
          {isLoading ? (
            <div className="text-center py-4">Loading communities...</div>
          ) : communities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => (
                <Card key={community.community_id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-collabCorner-purple" />
                      {community.name}
                    </CardTitle>
                    <CardDescription>
                      Created {format(new Date(community.created_at), 'MMM d, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {community.description || 'No description provided'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  No communities available
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Communities;
