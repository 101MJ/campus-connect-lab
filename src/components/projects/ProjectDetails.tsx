
import React, { useState } from 'react';
import { 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Users,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import TaskFormDialog from './TaskFormDialog';
import TaskList from '@/components/tasks/TaskList';
import EditProjectForm from './EditProjectForm';
import ProjectShowcaseToggle from './ProjectShowcaseToggle';
import ProjectMediaTab from './ProjectMediaTab';
import { Project } from '@/types/project';
import { useProjects } from '@/hooks/useProjects';
import { useTaskManager } from '@/hooks/useTaskManager';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const { deleteProject, fetchProjects } = useProjects();
  const { tasks, isLoading: tasksLoading } = useTaskManager(project.project_id);

  const pendingTasks = tasks.filter(task => !task.is_completed);
  const completedTasks = tasks.filter(task => task.is_completed);
  const progressPercentage = project.total_tasks > 0 ? (project.completed_tasks / project.total_tasks) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-500';
      case 'at_risk': return 'bg-yellow-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return <CheckCircle className="h-4 w-4" />;
      case 'at_risk': return <AlertCircle className="h-4 w-4" />;
      case 'delayed': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const handleDelete = async () => {
    await deleteProject(project.project_id);
  };

  const handleProjectUpdated = () => {
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      {/* Project Header Card */}
      <Card className={`border-l-4 ${getPriorityColor(project.priority)}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{project.title}</CardTitle>
                <Badge variant="outline" className="capitalize">
                  {project.priority} Priority
                </Badge>
              </div>
              {project.description && (
                <p className="text-gray-600 max-w-2xl">{project.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <ProjectShowcaseToggle 
                project={project} 
                onProjectUpdated={handleProjectUpdated}
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">
                  {project.completed_tasks}/{project.total_tasks} tasks
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-gray-600">
                {Math.round(progressPercentage)}% complete
              </p>
            </div>

            {/* Status Section */}
            <div className="space-y-3">
              <span className="text-sm font-medium">Status</span>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full text-white ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                </div>
                <span className="capitalize font-medium">
                  {project.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Deadline Section */}
            <div className="space-y-3">
              <span className="text-sm font-medium">Deadline</span>
              {project.deadline ? (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">No deadline set</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Project Content */}
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Tasks ({project.total_tasks})
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Media & Files
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaboration
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Tasks</h3>
            <Button onClick={() => setIsTaskDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Tasks ({pendingTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList 
                  tasks={pendingTasks} 
                  isLoading={tasksLoading}
                  emptyMessage="No pending tasks"
                />
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed Tasks ({completedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList 
                  tasks={completedTasks} 
                  isLoading={tasksLoading}
                  emptyMessage="No completed tasks"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          <ProjectMediaTab project={project} />
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration">
          <Card>
            <CardHeader>
              <CardTitle>Project Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Collaboration Features Coming Soon
                </h3>
                <p className="text-gray-600">
                  Team management and collaboration tools will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TaskFormDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        projectId={project.project_id}
      />

      <EditProjectForm
        project={project}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleProjectUpdated}
      />
    </div>
  );
};

export default ProjectDetails;
