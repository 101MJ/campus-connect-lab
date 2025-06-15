
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import TaskForm from '@/components/tasks/TaskForm';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  selectedProject?: string | null;
  onSubmit?: (values: any) => Promise<void>;
  isSubmitting?: boolean;
}

const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  selectedProject,
  onSubmit,
  isSubmitting,
}) => {
  const actualProjectId = projectId || selectedProject;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add details for your new task
          </DialogDescription>
        </DialogHeader>
        
        {actualProjectId && (
          <TaskForm 
            projectId={actualProjectId}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
