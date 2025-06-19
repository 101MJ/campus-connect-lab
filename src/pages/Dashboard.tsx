import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useUserTasks } from '@/hooks/useUserTasks';
import ProfileCard from '@/components/dashboard/ProfileCard';
import AcademicsCard from '@/components/dashboard/AcademicsCard';
import ProjectsTab from '@/components/dashboard/ProjectsTab';
import CommunitiesTab from '@/components/dashboard/CommunitiesTab';
import TasksList from '@/components/dashboard/TasksList';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardPosts from '@/components/dashboard/DashboardPosts';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { data: userTasks, isLoading: tasksLoading } = useUserTasks();

  console.log('Raw userTasks from hook:', userTasks);

  // Convert userTasks to the format expected by TasksList component
  const tasks = userTasks?.map(task => ({
    task_id: task.task_id,
    title: task.title,
    description: task.description,
    status: task.is_completed ? 'completed' as const : 'pending' as const,
    priority: 'medium' as const, // Default priority since it's not in userTasks
    due_date: task.deadline,
    project_title: task.project?.title,
  })) || [];

  console.log('Mapped tasks for TasksList:', tasks);

  // Use React Query for better caching and real-time updates
  const { 
    data: projects = [], 
    isLoading: projectsLoading 
  } = useQuery({
    queryKey: ['dashboard', 'projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
    staleTime: 30000 // 30 seconds
  });

  const {
    data: communities = [],
    isLoading: communitiesLoading
  } = useQuery({
    queryKey: ['dashboard', 'communities', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get community memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id);

      if (membershipError) {
        console.error('Error fetching community memberships:', membershipError);
        toast.error('Failed to load communities');
        return [];
      }

      if (!memberships || memberships.length === 0) {
        return [];
      }

      // Then get the actual community data
      const communityIds = memberships.map(m => m.community_id);
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .in('community_id', communityIds)
        .limit(5);
        
      if (error) {
        console.error('Error fetching communities:', error);
        toast.error('Failed to load communities');
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
    staleTime: 30000 // 30 seconds
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;
    
    // Projects real-time subscription
    const projectsChannel = supabase
      .channel('projects_dashboard_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects',
          filter: `created_by=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'projects'] });
        }
      )
      .subscribe();
    
    const communityMembersChannel = supabase
      .channel('community_members_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'community_members',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh communities data when memberships change
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'communities'] });
          queryClient.invalidateQueries({ queryKey: ['communities'] });
        }
      )
      .subscribe();
      
    const communitiesChannel = supabase
      .channel('communities_changes')
      .on(
        'postgres_changes',
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'communities'
        },
        () => {
          // Refresh communities data when a community is deleted
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'communities'] });
          queryClient.invalidateQueries({ queryKey: ['communities'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(communityMembersChannel);
      supabase.removeChannel(communitiesChannel);
    };
  }, [user, queryClient]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <ProfileCard 
          profile={profile}
          projectsCount={projects.length}
          communitiesCount={communities.length}
        />
        <AcademicsCard />
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="mt-4">
          <ProjectsTab projects={projects} loading={projectsLoading} />
        </TabsContent>
        
        <TabsContent value="communities" className="mt-4">
          <CommunitiesTab communities={communities} loading={communitiesLoading} />
        </TabsContent>
      </Tabs>

      <TasksList tasks={tasks} loading={tasksLoading} />
      
      {communities.length > 0 && <DashboardPosts />}
    </div>
  );
};

export default Dashboard;
