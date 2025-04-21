
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ProjectProgressProps {
  totalTasks: number;
  completedTasks: number;
  status: 'on_track' | 'at_risk' | 'delayed';
  priority: 'low' | 'medium' | 'high';
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({
  totalTasks,
  completedTasks,
  status,
  priority
}) => {
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const statusConfig = {
    on_track: { color: 'bg-green-500', icon: CheckCircle, text: 'On Track' },
    at_risk: { color: 'bg-yellow-500', icon: Clock, text: 'At Risk' },
    delayed: { color: 'bg-red-500', icon: AlertTriangle, text: 'Delayed' }
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-purple-100 text-purple-800',
    high: 'bg-red-100 text-red-800'
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 text-${status === 'on_track' ? 'green' : status === 'at_risk' ? 'yellow' : 'red'}-500`} />
          <span className="text-sm font-medium">{statusConfig[status].text}</span>
        </div>
        <Badge className={priorityColors[priority]}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
        </Badge>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="text-sm text-muted-foreground">
        {completedTasks} of {totalTasks} tasks completed
      </div>
    </div>
  );
};

export default ProjectProgress;
