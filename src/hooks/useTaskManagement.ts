
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface TaskFormValues {
  title: string;
  description?: string;
  deadline?: string;
  notes?: string;
}

export const useTaskManagement = () => {
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const queryClient = useQueryClient();

  const createTask = async (values: TaskFormValues, projectId: string, createdBy: string) => {
    if (!projectId || !values.title) return;
    
    setIsSubmittingTask(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: values.title,
          description: values.description || null,
          deadline: values.deadline || null,
          notes: values.notes || null,
          project_id: projectId,
          created_by: createdBy
        })
        .select();
        
      if (error) throw error;
      
      toast.success('Task created successfully');
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
        exact: false
      });
      
      // Invalidate and refetch projects to update progress
      queryClient.invalidateQueries({
        queryKey: ['projects'],
        exact: false
      });
      
      // Create a task-created event for listeners
      const event = new CustomEvent('task-created');
      window.dispatchEvent(event);
      
      return true;
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      return false;
    } finally {
      setIsSubmittingTask(false);
    }
  };

  return {
    isSubmittingTask,
    createTask
  };
};
