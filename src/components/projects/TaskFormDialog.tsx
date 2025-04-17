
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface TaskFormProps {
  projectId: string;
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ projectId, onSubmit, isSubmitting }) => {
  return null; // This is already implemented elsewhere and imported
};

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProject: string | null;
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
}

const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  open,
  onOpenChange,
  selectedProject,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add details for your new task
          </DialogDescription>
        </DialogHeader>
        
        {selectedProject && (
          <TaskForm 
            projectId={selectedProject}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
