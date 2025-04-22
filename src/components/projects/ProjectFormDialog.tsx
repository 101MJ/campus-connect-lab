
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ProjectForm from '@/components/projects/ProjectForm';
import type { ProjectFormValues } from '@/components/projects/ProjectForm';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  isCreating: boolean;
}

const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isCreating,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add the details for your new project
          </DialogDescription>
        </DialogHeader>
        
        <ProjectForm 
          onSubmit={onSubmit} 
          isSubmitting={isCreating} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormDialog;
