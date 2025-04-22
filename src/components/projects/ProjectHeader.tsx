
import React from 'react';
import ProjectFormDialog from './ProjectFormDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { ProjectFormValues } from '@/components/projects/ProjectForm';

interface ProjectHeaderProps {
  projectDialogOpen: boolean;
  setProjectDialogOpen: (open: boolean) => void;
  onSubmitProject: (values: ProjectFormValues) => Promise<void>;
  isCreating: boolean;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectDialogOpen,
  setProjectDialogOpen,
  onSubmitProject,
  isCreating,
}) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-collabCorner-purple to-collabCorner-purple-light bg-clip-text text-transparent">
        Projects
      </h1>
      
      <Button 
        onClick={() => setProjectDialogOpen(true)} 
        className="bg-collabCorner-purple hover:bg-collabCorner-purple-dark"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> New Project
      </Button>
      
      <ProjectFormDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        onSubmit={onSubmitProject}
        isCreating={isCreating}
      />
    </div>
  );
};

export default ProjectHeader;
