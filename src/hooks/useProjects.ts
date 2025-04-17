
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Project {
  project_id: string;
  title: string;
  description?: string;
  deadline?: string;
  created_at: string;
  created_by: string;
}

interface ProjectFormValues {
  title: string;
  description?: string;
  deadline?: string;
}

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (values: ProjectFormValues) => {
    if (!user) return;
    
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
      
      setProjects([...(data || []), ...projects]);
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
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      setProjects(projects.filter(project => project.project_id !== projectId));
      
      if (selectedProject === projectId) {
        setSelectedProject(null);
      }
      
      toast.success('Project deleted successfully');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const getProjectById = (projectId: string | null) => {
    if (!projectId) return null;
    return projects.find(project => project.project_id === projectId) || null;
  };

  return {
    projects,
    isLoading,
    isCreating,
    selectedProject,
    setSelectedProject,
    createProject,
    deleteProject,
    getProjectById
  };
};
