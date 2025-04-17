
import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ProjectForm from '@/components/projects/ProjectForm';
import ProjectList from '@/components/projects/ProjectList';
import ProjectDetails from '@/components/projects/ProjectDetails';
import EmptyProjectState from '@/components/projects/EmptyProjectState';
import { useProjects } from '@/hooks/useProjects';
import type { ProjectFormValues } from '@/components/projects/ProjectForm';

const Projects: React.FC = () => {
  const {
    projects,
    isLoading,
    isCreating,
    selectedProject,
    setSelectedProject,
    createProject,
    deleteProject,
    getProjectById
  } = useProjects();

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const onSubmitProject = async (values: ProjectFormValues) => {
    const success = await createProject(values);
    if (success) {
      setProjectDialogOpen(false);
    }
  };

  const onSubmitTask = async (values: any) => {
    setTaskDialogOpen(false);
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(projectId === selectedProject ? null : projectId);
  };

  const selectedProjectData = getProjectById(selectedProject);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-collabCorner-purple to-collabCorner-purple-light bg-clip-text text-transparent">
            Projects
          </h1>
          
          <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
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
                onSubmit={onSubmitProject} 
                isSubmitting={isCreating} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Projects List - Left Column */}
          <div className="lg:col-span-1 space-y-4 h-fit">
            <h2 className="text-lg font-semibold mb-2">Your Projects</h2>
            
            <ProjectList
              projects={projects}
              selectedProject={selectedProject}
              isLoading={isLoading}
              onSelectProject={handleProjectClick}
              onDeleteProject={deleteProject}
            />
          </div>
          
          {/* Project Details & Tasks - Right Column */}
          <div className="lg:col-span-3 flex flex-col">
            {selectedProjectData ? (
              <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                <ProjectDetails 
                  project={selectedProjectData} 
                  onAddTask={() => setTaskDialogOpen(true)} 
                />

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
                      onSubmit={onSubmitTask}
                      isSubmitting={false}
                    />
                  )}
                </DialogContent>
              </Dialog>
            ) : (
              <EmptyProjectState />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;

interface TaskFormProps {
  projectId: string;
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ projectId, onSubmit, isSubmitting }) => {
  return null;
};
