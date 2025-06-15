
import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';
import FeaturedProjects from '@/components/showcase/FeaturedProjects';
import ShowcaseProjectGrid from '@/components/showcase/ShowcaseProjectGrid';
import ShowcaseNavbar from '@/components/showcase/ShowcaseNavbar';

const Showcase = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');

  const { data: publicProjects = [], isLoading } = useQuery({
    queryKey: ['public-projects'],
    queryFn: async (): Promise<Project[]> => {
      console.log('Fetching public projects...');
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching public projects:', error);
        throw error;
      }
      
      console.log('Found public projects:', data?.length || 0);
      
      return (data || []).map(project => ({
        project_id: project.project_id,
        title: project.title,
        description: project.description || undefined,
        deadline: project.deadline || undefined,
        created_at: project.created_at,
        created_by: project.created_by,
        priority: (project.priority as 'low' | 'medium' | 'high') || 'medium',
        status: (project.status as 'on_track' | 'at_risk' | 'delayed') || 'on_track',
        total_tasks: project.total_tasks || 0,
        completed_tasks: project.completed_tasks || 0,
        is_public: project.is_public || false,
        showcase_description: project.showcase_description || undefined,
        tags: project.tags || [],
        cover_image_url: project.cover_image_url || undefined,
      }));
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  // Set up real-time subscriptions for projects
  useEffect(() => {
    console.log('Setting up real-time subscription for projects');
    
    const channel = supabase
      .channel('projects_showcase_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects'
        },
        (payload) => {
          console.log('Project change detected:', payload);
          // Refresh public projects when any project changes
          queryClient.invalidateQueries({ queryKey: ['public-projects'] });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ShowcaseNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Project Showcase
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing projects created by our community. Get inspired and collaborate!
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-collabCorner-purple mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading projects...</p>
          </div>
        ) : publicProjects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No public projects yet</h3>
            <p className="text-gray-500">Be the first to share your project with the community!</p>
          </div>
        ) : (
          <>
            <FeaturedProjects projects={publicProjects.slice(0, 3)} />
            <ShowcaseProjectGrid 
              projects={publicProjects} 
              viewMode={viewMode}
              sortBy={sortBy}
              isLoading={isLoading}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Showcase;
