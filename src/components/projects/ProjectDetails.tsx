import React from 'react';
import { format } from 'date-fns';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import TaskList from '@/components/tasks/TaskList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import EditProjectForm from './EditProjectForm';

export interface Project {
  project_id: string;
  title: string;
  description?: string;
  deadline?: string;
  created_at: string;
}

interface ProjectDetailsProps {
  project: Project;
  onAddTask: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onAddTask }) => {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'No deadline';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const handleEditProject = async (values: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: values.title,
          description: values.description || null,
          deadline: values.deadline || null,
        })
        .eq('project_id', project.project_id);

      if (error) throw error;

      toast.success('Project updated successfully');
      setEditDialogOpen(false);
      
      const event = new CustomEvent('project-updated');
      window.dispatchEvent(event);
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        <Card className="bg-gradient-to-br from-white to-blue-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>
                  Created {format(new Date(project.created_at), 'MMM d, yyyy')}
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setEditDialogOpen(true)}
                  className="bg-white hover:bg-gray-100"
                >
                  <Pencil className="mr-2 h-4 w-4 text-gray-600" /> Edit
                </Button>
                <Button 
                  size="sm" 
                  onClick={onAddTask} 
                  className="bg-collabCorner-purple hover:bg-collabCorner-purple-dark transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {project.description || 'No description provided'}
            </p>
            {project.deadline && (
              <div className="mt-4 text-sm">
                <span className="font-medium">Deadline: </span>
                <span className="text-muted-foreground">
                  {formatDate(project.deadline)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-collabCorner-purple">Pending Tasks</h2>
          <div className="bg-white rounded-lg p-4">
            <TaskList projectId={project.project_id} showCompleted={false} />
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4 text-collabCorner-purple">Completed Tasks</h2>
          <div className="bg-white rounded-lg p-4">
            <TaskList projectId={project.project_id} showCompleted={true} />
          </div>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to your project details
            </DialogDescription>
          </DialogHeader>
          
          <EditProjectForm 
            project={project}
            onSubmit={handleEditProject}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectDetails;
