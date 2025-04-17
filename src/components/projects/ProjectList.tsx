
import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderGit2 } from 'lucide-react';

interface Project {
  project_id: string;
  title: string;
  description?: string;
  deadline?: string;
  created_at: string;
}

interface ProjectListProps {
  projects: Project[];
  selectedProject: string | null;
  isLoading: boolean;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  selectedProject, 
  isLoading, 
  onSelectProject, 
  onDeleteProject 
}) => {
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'No deadline';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pt-6 pb-6">
          <CardDescription className="text-center">
            No projects yet. Click "New Project" to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <Card 
          key={project.project_id} 
          className={`cursor-pointer transition-all hover:border-collabCorner-purple 
                    ${selectedProject === project.project_id ? 'border-collabCorner-purple shadow-md bg-gradient-to-br from-white to-blue-50' : ''}`}
          onClick={() => onSelectProject(project.project_id)}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-full bg-collabCorner-purple/10">
                <FolderGit2 className="h-4 w-4 text-collabCorner-purple" />
              </div>
              {project.title}
            </CardTitle>
          </CardHeader>
          <CardFooter className="p-2 pt-0 flex justify-between">
            <CardDescription className="text-xs">
              {formatDate(project.deadline)}
            </CardDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProject(project.project_id);
              }}
              className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ProjectList;
