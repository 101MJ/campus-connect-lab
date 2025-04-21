
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectFormValues } from '@/components/projects/ProjectForm';

interface Project {
  project_id: string;
  title: string;
  description?: string;
  deadline?: string;
  created_at: string;
  created_by: string;
}

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  // Use React Query for data fetching with caching
  const { 
    data: projects = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async (): Promise<Project[]> => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
        return [];
      }
    },
    enabled: !!user,
    staleTime: 60000, // Data considered fresh for 60 seconds
    refetchOnWindowFocus: false
  });

  const fetchProjects = useCallback(() => {
    if (user) {
      refetch();
    }
  }, [refetch, user]);

  const createProject = async (values: ProjectFormValues) => {
    if (!user) return false;
    
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: values.title,
          description: values.description || null,
          deadline: values.deadline || null,
          created_by: user.id,
        })
        .select();
      
      if (error) throw error;
      
      // Update cache
      if (data && data.length > 0) {
        queryClient.setQueryData(['projects', user.id], 
          (oldData: Project[] | undefined) => [...(data || []), ...(oldData || [])]);
      }
      
      toast.success('Project created successfully');
      return true;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      // Optimistically update UI
      queryClient.setQueryData(['projects', user?.id], 
        (oldData: Project[] | undefined) => 
          (oldData || []).filter(project => project.project_id !== projectId));
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      if (selectedProject === projectId) {
        setSelectedProject(null);
      }
      
      toast.success('Project deleted successfully');
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
        exact: false
      });
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
      // Revert optimistic update
      refetch();
    }
  };

  const getProjectById = useCallback((projectId: string | null) => {
    if (!projectId) return null;
    return projects.find(project => project.project_id === projectId) || null;
  }, [projects]);

  return {
    projects,
    isLoading,
    isCreating,
    selectedProject,
    setSelectedProject,
    createProject,
    deleteProject,
    getProjectById,
    fetchProjects
  };
};
