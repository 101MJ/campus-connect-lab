import React from 'react';
import { format } from 'date-fns';
import { Plus, List, CheckSquare, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskList from '@/components/tasks/TaskList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import EditProjectForm from './EditProjectForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Force refresh of the project page
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
      
      <div className="flex-1">
        <Tabs defaultValue="tasks" className="h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-collabCorner-purple data-[state=active]:text-white">
              <List className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-collabCorner-purple data-[state=active]:text-white">
              <CheckSquare className="h-4 w-4 mr-2" />
              Completed
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="h-full">
            <TaskList projectId={project.project_id} showCompleted={false} />
          </TabsContent>
          <TabsContent value="completed" className="h-full">
            <TaskList projectId={project.project_id} showCompleted={true} />
          </TabsContent>
        </Tabs>
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
