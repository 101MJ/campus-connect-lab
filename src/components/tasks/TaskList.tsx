
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TaskItem from './TaskItem';
import TaskEditDialog from './TaskEditDialog';

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
  onTaskUpdated?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ projectId, showCompleted = false, onTaskUpdated }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    } else {
      setTasks([]);
    }

    // Set up real-time subscription for task updates
    let subscription: any;
    
    if (projectId) {
      subscription = supabase
        .channel('tasks-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            // Refresh tasks when a change is detected
            fetchTasks();
          }
        )
        .subscribe();
    }

    // Cleanup subscription
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
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

      if (onTaskUpdated) {
        onTaskUpdated();
      }
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
      
      // Immediately update the UI by removing the task from the current list
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
      
      // Update state
      setTasks(tasks.filter(task => task.task_id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleEdit = (taskId: string) => {
    const taskToEdit = tasks.find(task => task.task_id === taskId);
    if (taskToEdit) {
      setEditTask(taskToEdit);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateTask = async (taskId: string, values: any) => {
    setIsSubmitting(true);
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
      
      // Close dialog and refresh tasks
      setIsEditDialogOpen(false);
      toast.success('Task updated successfully');
      
      // Update the task in the current state
      setTasks(tasks.map(task => 
        task.task_id === taskId ? 
        { ...task, ...values, updated_at: new Date().toISOString() } : 
        task
      ));
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setIsSubmitting(false);
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
          onEdit={handleEdit}
        />
      ))}
      
      <TaskEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={editTask}
        onSubmit={handleUpdateTask}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default TaskList;
