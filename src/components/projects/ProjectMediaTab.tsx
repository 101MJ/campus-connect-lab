
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MediaManager from '@/components/media/MediaManager';
import { Project } from '@/types/project';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectMediaTabProps {
  project: Project;
}

const ProjectMediaTab: React.FC<ProjectMediaTabProps> = ({ project }) => {
  const { user } = useAuth();
  
  const canUpload = user && (
    project.created_by === user.id || 
    // Add logic here to check if user is a collaborator with upload permissions
    false
  );

  const canDelete = user && project.created_by === user.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Media & Files</CardTitle>
      </CardHeader>
      <CardContent>
        <MediaManager
          projectId={project.project_id}
          canUpload={canUpload}
          canDelete={canDelete}
        />
      </CardContent>
    </Card>
  );
};

export default ProjectMediaTab;
