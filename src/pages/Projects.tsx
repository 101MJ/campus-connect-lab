
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProjectList from '@/components/projects/ProjectList';
import ProjectDetails from '@/components/projects/ProjectDetails';
import EmptyProjectState from '@/components/projects/EmptyProjectState';
import ProjectHeader from '@/components/projects/ProjectHeader';
import TaskFormDialog from '@/components/projects/TaskFormDialog';
import { useProjects } from '@/hooks/useProjects';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjectFormValues } from '@/components/projects/ProjectForm';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const {
    projects,
    isLoading,
    isCreating,
    selectedProject,
    setSelectedProject,
    createProject,
    deleteProject,
    getProjectById,
    fetchProjects
  } = useProjects();

  const { isSubmittingTask, createTask } = useTaskManagement();
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const onSubmitProject = async (values: ProjectFormValues) => {
    const success = await createProject(values);
    if (success) {
      setProjectDialogOpen(false);
    }
  };

  const onSubmitTask = async (values: any) => {
    if (!selectedProject || !user) return;
    
    const success = await createTask(values, selectedProject, user.id);
    if (success) {
      setTaskDialogOpen(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(projectId === selectedProject ? null : projectId);
  };

  const selectedProjectData = getProjectById(selectedProject);

  useEffect(() => {
    const handleProjectUpdate = () => {
      fetchProjects();
    };

    window.addEventListener('project-updated', handleProjectUpdate);
    window.addEventListener('task-created', handleProjectUpdate);

    return () => {
      window.removeEventListener('project-updated', handleProjectUpdate);
      window.removeEventListener('task-created', handleProjectUpdate);
    };
  }, [fetchProjects]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProjectHeader 
          projectDialogOpen={projectDialogOpen}
          setProjectDialogOpen={setProjectDialogOpen}
          onSubmitProject={onSubmitProject}
          isCreating={isCreating}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4 text-collabCorner-purple-dark">Your Projects</h2>
            
            <div className="sticky top-6">
              <ProjectList
                projects={projects}
                selectedProject={selectedProject}
                isLoading={isLoading}
                onSelectProject={handleProjectClick}
                onDeleteProject={deleteProject}
              />
            </div>
          </div>
          
          <div className="lg:col-span-3 h-full">
            {selectedProjectData ? (
              <>
                <ProjectDetails 
                  project={selectedProjectData} 
                  onAddTask={() => setTaskDialogOpen(true)} 
                />
                
                <TaskFormDialog
                  open={taskDialogOpen}
                  onOpenChange={setTaskDialogOpen}
                  selectedProject={selectedProject}
                  onSubmit={onSubmitTask}
                  isSubmitting={isSubmittingTask}
                />
              </>
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
