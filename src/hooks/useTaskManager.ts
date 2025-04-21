
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Task } from '@/types/task';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useTaskManager(projectId: string | null, showCompleted: boolean = false) {
  const queryClient = useQueryClient();
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  
  // Use React Query for data fetching with caching
  const { 
    data: tasks = [], 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['tasks', projectId, showCompleted],
    queryFn: async (): Promise<Task[]> => {
      if (!projectId) return [];
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_completed', showCompleted)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
        return [];
      }
    },
    enabled: !!projectId,
    staleTime: 30000, // Data considered fresh for 30 seconds
    refetchOnWindowFocus: false
  });

  // Set up real-time subscription for the selected project's tasks
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          // Update cache based on the event type
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task;
            if (newTask.is_completed === showCompleted) {
              queryClient.setQueryData(['tasks', projectId, showCompleted], 
                (oldData: Task[] | undefined) => [newTask, ...(oldData || [])]);
            }
          } else if (payload.eventType === 'DELETE') {
            queryClient.setQueryData(['tasks', projectId, showCompleted], 
              (oldData: Task[] | undefined) => 
                (oldData || []).filter(task => task.task_id !== payload.old.task_id));
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as Task;
            if (updatedTask.is_completed === showCompleted) {
              queryClient.setQueryData(['tasks', projectId, showCompleted], 
                (oldData: Task[] | undefined) => 
                  (oldData || []).map(task => 
                    task.task_id === updatedTask.task_id ? updatedTask : task));
            } else {
              queryClient.setQueryData(['tasks', projectId, showCompleted], 
                (oldData: Task[] | undefined) => 
                  (oldData || []).filter(task => task.task_id !== updatedTask.task_id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, showCompleted, queryClient]);

  const handleStatusChange = useCallback(async (taskId: string, isCompleted: boolean) => {
    try {
      // Optimistically update UI
      queryClient.setQueryData(['tasks', projectId, showCompleted], 
        (oldData: Task[] | undefined) => 
          (oldData || []).filter(task => task.task_id !== taskId));

      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
        .eq('task_id', taskId);
      
      if (error) throw error;
      
      toast.success(`Task ${isCompleted ? 'completed' : 'reopened'}`);
      
      // Invalidate related queries to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
        exact: false
      });
      
      // Also invalidate userTasks query to update dashboard
      queryClient.invalidateQueries({
        queryKey: ['userTasks'],
        exact: false
      });
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      // Revert optimistic update on error
      refetch();
    }
  }, [projectId, showCompleted, queryClient, refetch]);

  const handleDelete = useCallback(async (taskId: string) => {
    setIsDeletingTask(true);
    try {
      // Optimistically update UI
      queryClient.setQueryData(['tasks', projectId, showCompleted], 
        (oldData: Task[] | undefined) => 
          (oldData || []).filter(task => task.task_id !== taskId));

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('task_id', taskId);
      
      if (error) throw error;
      
      toast.success('Task deleted successfully');
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
        exact: false
      });
      
      // Also invalidate userTasks query
      queryClient.invalidateQueries({
        queryKey: ['userTasks'],
        exact: false
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      // Revert optimistic update on error
      refetch();
    } finally {
      setIsDeletingTask(false);
    }
  }, [projectId, showCompleted, queryClient, refetch]);

  const handleUpdateTask = useCallback(async (taskId: string, values: any) => {
    try {
      // Optimistically update UI
      queryClient.setQueryData(['tasks', projectId, showCompleted], 
        (oldData: Task[] | undefined) => 
          (oldData || []).map(task => 
            task.task_id === taskId ? 
            { ...task, ...values, updated_at: new Date().toISOString() } : 
            task));

      const { error } = await supabase
        .from('tasks')
        .update({
          title: values.title,
          description: values.description || null,
          deadline: values.deadline || null,
          notes: values.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('task_id', taskId);
      
      if (error) throw error;
      
      toast.success('Task updated successfully');
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
        exact: false
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      // Revert optimistic update on error
      refetch();
      return false;
    }
  }, [projectId, showCompleted, queryClient, refetch]);

  return {
    tasks,
    isLoading,
    isDeletingTask,
    handleStatusChange,
    handleDelete,
    handleUpdateTask
  };
}
