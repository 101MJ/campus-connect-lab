
import React from 'react';
import ProjectFormDialog from './ProjectFormDialog';
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
