
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Project } from '@/types/project';

export const useProjectShowcase = () => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: publicProjects = [], isLoading } = useQuery({
    queryKey: ['public-projects'],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
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
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const updateProjectVisibility = async (projectId: string, isPublic: boolean, showcaseData?: {
    showcase_description?: string;
    tags?: string[];
    cover_image_url?: string;
  }) => {
    setIsUpdating(true);
    try {
      const updateData: any = { is_public: isPublic };
      
      if (showcaseData) {
        if (showcaseData.showcase_description !== undefined) {
          updateData.showcase_description = showcaseData.showcase_description;
        }
        if (showcaseData.tags !== undefined) {
          updateData.tags = showcaseData.tags;
        }
        if (showcaseData.cover_image_url !== undefined) {
          updateData.cover_image_url = showcaseData.cover_image_url;
        }
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['public-projects'] });
      
      toast.success(isPublic ? 'Project published to showcase' : 'Project made private');
      return true;
    } catch (error: any) {
      console.error('Update project visibility error:', error);
      toast.error(error.message || 'Failed to update project visibility');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const recordProjectView = async (projectId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('project_views')
        .insert({
          project_id: projectId,
          viewer_id: user.user?.id || null,
          user_agent: navigator.userAgent,
        });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Record view error:', error);
      // Don't show error to user for view tracking
    }
  };

  return {
    publicProjects,
    isLoading,
    isUpdating,
    updateProjectVisibility,
    recordProjectView,
  };
};
