import React, { useState } from 'react';
import ProjectFormDialog from './ProjectFormDialog';
import type { ProjectFormValues } from '@/components/projects/ProjectForm';
import ShareProjectDialog from './ShareProjectDialog';
import { Plus, Users } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ProjectHeaderProps {
  projectDialogOpen: boolean;
  setProjectDialogOpen: (open: boolean) => void;
  onSubmitProject: (values: ProjectFormValues) => Promise<void>;
  isCreating: boolean;
  selectedProject?: string | null;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectDialogOpen,
  setProjectDialogOpen,
  onSubmitProject,
  isCreating,
  selectedProject
}) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-collabCorner-purple to-collabCorner-purple-light bg-clip-text text-transparent">
          Projects
        </h1>
      </div>
      <div className="flex gap-2">
        {selectedProject && (
          <Button
            onClick={() => setShareDialogOpen(true)}
            variant="outline"
            className="bg-white"
          >
            <Users className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
        <Button onClick={() => setProjectDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <ProjectFormDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        onSubmit={onSubmitProject}
        isCreating={isCreating}
      />

      {selectedProject && (
        <ShareProjectDialog
          projectId={selectedProject}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      )}
    </div>
  );
};

export default ProjectHeader;
