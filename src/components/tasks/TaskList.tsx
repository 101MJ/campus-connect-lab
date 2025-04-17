
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TaskItem from './TaskItem';

interface Task {
  task_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  notes: string | null;
  is_completed: boolean;
}

interface TaskListProps {
  projectId: string | null;
  showCompleted?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ projectId, showCompleted = false }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [projectId, showCompleted]);

  const fetchTasks = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
        .eq('task_id', taskId);
      
      if (error) throw error;
      
      // If the task status change means it should no longer appear in this list,
      // remove it from the tasks array
      if (isCompleted !== showCompleted) {
        setTasks(tasks.filter(task => task.task_id !== taskId));
      } else {
        setTasks(tasks.map(task => 
          task.task_id === taskId ? { ...task, is_completed: isCompleted } : task
        ));
      }
      
      toast.success(`Task ${isCompleted ? 'completed' : 'reopened'}`);
      
      // Refetch tasks to ensure the lists are up to date
      fetchTasks();
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

  if (isLoading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  if (!projectId) {
    return <div className="text-center py-4 text-muted-foreground">Select a project to see tasks</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {showCompleted 
          ? "No completed tasks found for this project" 
          : "No active tasks found for this project"
        }
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskItem 
          key={task.task_id} 
          task={task} 
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
};

export default TaskList;
