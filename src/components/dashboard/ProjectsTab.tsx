
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Project {
  project_id: string;
  title: string;
  description?: string;
}

interface ProjectsTabProps {
  projects: Project[];
  loading: boolean;
}

const ProjectsTab = ({ projects, loading }: ProjectsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
        <CardDescription>Projects you've created or joined</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading projects...</div>
        ) : projects.length > 0 ? (
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.project_id} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {project.description?.substring(0, 100) || 'No description'}
                  {project.description?.length > 100 && '...'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            You haven't created any projects yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectsTab;
