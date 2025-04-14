
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useUserTasks } from '@/hooks/useUserTasks';
import ProfileCard from '@/components/dashboard/ProfileCard';
import SummaryCard from '@/components/dashboard/SummaryCard';
import ProjectsTab from '@/components/dashboard/ProjectsTab';
import AcademicsTab from '@/components/dashboard/AcademicsTab';
import CommunitiesTab from '@/components/dashboard/CommunitiesTab';
import TasksList from '@/components/dashboard/TasksList';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState({
    projects: true,
    communities: true
  });
  const { data: tasks, isLoading: tasksLoading } = useUserTasks();

  useEffect(() => {
    if (user) {
      const fetchProjects = async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching projects:', error);
          toast.error('Failed to load projects');
        } else {
          setProjects(data || []);
        }
        setLoading(prev => ({ ...prev, projects: false }));
      };

      const fetchCommunities = async () => {
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .limit(5);
        
        if (error) {
          console.error('Error fetching communities:', error);
          toast.error('Failed to load communities');
        } else {
          setCommunities(data || []);
        }
        setLoading(prev => ({ ...prev, communities: false }));
      };

      fetchProjects();
      fetchCommunities();
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <ProfileCard profile={profile} />
          <SummaryCard 
            projectsCount={projects.length}
            communitiesCount={communities.length}
          />
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList>
            <TabsTrigger value="projects">Recent Projects</TabsTrigger>
            <TabsTrigger value="academics">Academic Info</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="mt-4">
            <ProjectsTab projects={projects} loading={loading.projects} />
          </TabsContent>
          
          <TabsContent value="academics" className="mt-4">
            <AcademicsTab profile={profile} />
          </TabsContent>
          
          <TabsContent value="communities" className="mt-4">
            <CommunitiesTab communities={communities} loading={loading.communities} />
          </TabsContent>
        </Tabs>

        <TasksList tasks={tasks} loading={tasksLoading} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
