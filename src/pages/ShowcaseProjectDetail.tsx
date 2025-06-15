
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';
import ShowcaseProjectHeader from '@/components/showcase/ShowcaseProjectHeader';
import ProjectDetails from '@/components/projects/ProjectDetails';
import RelatedProjects from '@/components/showcase/RelatedProjects';
import ShowcaseNavbar from '@/components/showcase/ShowcaseNavbar';
import { useProjectShowcase } from '@/hooks/useProjectShowcase';

const ShowcaseProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { recordProjectView } = useProjectShowcase();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['public-project', id],
    queryFn: async (): Promise<Project> => {
      if (!id) throw new Error('Project ID is required');
      
      console.log('Fetching project with ID:', id);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('project_id', id)
        .eq('is_public', true)
        .single();
      
      if (error) {
        console.error('Error fetching project:', error);
        throw new Error('Project not found or not publicly available');
      }
      
      if (!data) {
        throw new Error('Project not found or not publicly available');
      }
      
      console.log('Found project:', data);
      
      return {
        project_id: data.project_id,
        title: data.title,
        description: data.description || undefined,
        deadline: data.deadline || undefined,
        created_at: data.created_at,
        created_by: data.created_by,
        priority: (data.priority as 'low' | 'medium' | 'high') || 'medium',
        status: (data.status as 'on_track' | 'at_risk' | 'delayed') || 'on_track',
        total_tasks: data.total_tasks || 0,
        completed_tasks: data.completed_tasks || 0,
        is_public: data.is_public || false,
        showcase_description: data.showcase_description || undefined,
        tags: data.tags || [],
        cover_image_url: data.cover_image_url || undefined,
      };
    },
    enabled: !!id,
    retry: 1,
  });

  // Record project view
  useEffect(() => {
    if (project) {
      recordProjectView(project.project_id);
    }
  }, [project, recordProjectView]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShowcaseNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-collabCorner-purple mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShowcaseNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
            <p className="text-gray-600">
              The project you're looking for doesn't exist or is not publicly available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShowcaseNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <ShowcaseProjectHeader project={project} />
          <ProjectDetails project={project} />
          <RelatedProjects currentProjectId={project.project_id} tags={project.tags} />
        </div>
      </main>
    </div>
  );
};

export default ShowcaseProjectDetail;
