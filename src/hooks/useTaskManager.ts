
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Task {
  task_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  notes: string | null;
  is_completed: boolean;
}

export function useTaskManager(projectId: string | null, showCompleted: boolean = false) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

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
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task;
            if (newTask.is_completed === showCompleted) {
              setTasks(prev => [newTask, ...prev]);
            }
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.task_id !== payload.old.task_id));
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as Task;
            if (updatedTask.is_completed === showCompleted) {
              setTasks(prev => prev.map(task => 
                task.task_id === updatedTask.task_id ? updatedTask : task
              ));
            } else {
              setTasks(prev => prev.filter(task => task.task_id !== updatedTask.task_id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, showCompleted]);

  useEffect(() => {
    if (!projectId) return;
    
    const fetchTasks = async () => {
      setIsLoading(true);
      
      const timeout = setTimeout(() => {
        setIsLoading(false);
        toast.error('Loading tasks is taking longer than expected. Please refresh the page.');
      }, 10000);
      
      setLoadingTimeout(timeout);
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_completed', showCompleted)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setTasks(data || []);
      } catch (error: any) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }
        setIsLoading(false);
      }
    };

    fetchTasks();

    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [projectId, showCompleted]);

  const handleStatusChange = async (taskId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
        .eq('task_id', taskId);
      
      if (error) throw error;
      
      setTasks(tasks.filter(task => task.task_id !== taskId));
      toast.success(`Task ${isCompleted ? 'completed' : 'reopened'}`);
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('task_id', taskId);
      
      if (error) throw error;
      
      setTasks(tasks.filter(task => task.task_id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleUpdateTask = async (taskId: string, values: any) => {
    try {
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
      
      setTasks(tasks.map(task => 
        task.task_id === taskId ? 
        { ...task, ...values, updated_at: new Date().toISOString() } : 
        task
      ));
      
      return true;
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      return false;
    }
  };

  return {
    tasks,
    isLoading,
    handleStatusChange,
    handleDelete,
    handleUpdateTask
  };
}
