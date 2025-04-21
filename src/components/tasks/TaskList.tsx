
import React, { useState, memo } from 'react';
import { Loader2 } from 'lucide-react';
import TaskItem from './TaskItem';
import TaskEditDialog from './TaskEditDialog';
import EmptyTaskState from './EmptyTaskState';
import { useTaskManager } from '@/hooks/useTaskManager';
import { Task } from '@/types/task';

interface TaskListProps {
  projectId: string | null;
  showCompleted?: boolean;
  onTaskUpdated?: () => void;
}

// Use memo for performance optimization
const TaskList: React.FC<TaskListProps> = memo(({ 
  projectId, 
  showCompleted = false, 
  onTaskUpdated 
}) => {
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    tasks,
    isLoading,
    isDeletingTask,
    handleStatusChange,
    handleDelete,
    handleUpdateTask
  } = useTaskManager(projectId, showCompleted);

  const handleEdit = (taskId: string) => {
    const taskToEdit = tasks.find(task => task.task_id === taskId);
    if (taskToEdit) {
      setEditTask(taskToEdit);
      setIsEditDialogOpen(true);
    }
  };

  const onSubmitUpdate = async (taskId: string, values: any) => {
    setIsSubmitting(true);
    const success = await handleUpdateTask(taskId, values);
    if (success) {
      setIsEditDialogOpen(false);
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-collabCorner-purple" />
      </div>
    );
  }

  if (!projectId || tasks.length === 0) {
    return <EmptyTaskState projectSelected={!!projectId} showCompleted={showCompleted} />;
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
          isDeleting={isDeletingTask}
        />
      ))}
      
      <TaskEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={editTask}
        onSubmit={onSubmitUpdate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
});

TaskList.displayName = 'TaskList';

export default TaskList;
