
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const EmptyProjectState: React.FC = () => {
  return (
    <Card>
      <CardContent className="text-center py-16">
        <p className="text-muted-foreground">
          Select a project to see details and manage tasks
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyProjectState;
