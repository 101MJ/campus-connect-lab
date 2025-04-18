
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyTaskStateProps {
  projectSelected: boolean;
  showCompleted: boolean;
}

const EmptyTaskState: React.FC<EmptyTaskStateProps> = ({ projectSelected, showCompleted }) => {
  if (!projectSelected) {
    return (
      <Card className="border border-dashed">
        <CardContent className="flex items-center justify-center p-6 text-muted-foreground">
          Select a project to see tasks
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-dashed">
      <CardContent className="flex items-center justify-center p-6 text-muted-foreground">
        {showCompleted 
          ? "No completed tasks found for this project" 
          : "No active tasks found for this project"
        }
      </CardContent>
    </Card>
  );
};

export default EmptyTaskState;
