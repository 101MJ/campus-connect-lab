
import React from 'react';
import { format } from 'date-fns';
import { Plus, List, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskList from '@/components/tasks/TaskList';

interface Project {
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
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'No deadline';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
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
              
              <Button size="sm" onClick={onAddTask} className="bg-collabCorner-purple hover:bg-collabCorner-purple-dark transition-colors">
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
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
            <TaskList projectId={project.project_id} />
          </TabsContent>
          <TabsContent value="completed" className="h-full">
            <Card>
              <CardContent className="text-center py-4">
                <p className="text-muted-foreground">
                  Completed tasks will be shown here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ProjectDetails;
