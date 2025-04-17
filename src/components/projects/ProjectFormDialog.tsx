
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
      <DialogTrigger asChild>
        <Button className="bg-collabCorner-purple hover:bg-collabCorner-purple-dark transition-colors">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </DialogTrigger>
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
