
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FolderOpenDot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyProjectStateProps {
  onCreateClick?: () => void;
}

const EmptyProjectState: React.FC<EmptyProjectStateProps> = ({ onCreateClick }) => {
  return (
    <Card className="h-full bg-gradient-to-br from-white to-blue-50/50 border-dashed border-muted-foreground/20">
      <CardContent className="flex flex-col items-center justify-center h-full py-16 text-center space-y-4">
        <div className="p-4 rounded-full bg-soft-purple/30">
          <FolderOpenDot size={40} className="text-collabCorner-purple" />
        </div>
        <p className="text-muted-foreground mb-4">
          Select a project to see details and manage tasks
        </p>
        {onCreateClick && (
          <Button 
            onClick={onCreateClick}
            variant="outline" 
            className="border-collabCorner-purple/30 text-collabCorner-purple hover:bg-collabCorner-purple/5"
          >
            Create New Project
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyProjectState;
