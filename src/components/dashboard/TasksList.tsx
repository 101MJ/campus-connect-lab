
import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Circle, CalendarDays, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  task_id: string;
  title: string;
  deadline: string | null;
  is_completed: boolean;
  project: {
    title: string;
  };
}

interface TasksListProps {
  tasks: Task[] | undefined;
  loading: boolean;
}

const TasksList = ({ tasks, loading }: TasksListProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d');
    } catch {
      return '';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-collabCorner-purple">Pending Tasks</CardTitle>
        <CardDescription>Your upcoming tasks that need attention</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="text-center py-4">Loading tasks...</div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div 
                key={task.task_id} 
                className="relative flex items-start gap-3 p-2 bg-white rounded-lg hover:shadow-md transition-all duration-300 border border-transparent hover:border-collabCorner-purple/20"
              >
                <div className="mt-1">
                  {task.is_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-collabCorner-purple" />
                  )}
                </div>
                <div className="flex-1 space-y-0.5">
                  <h3 className="font-medium pr-12">{task.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5 mr-1" />
                    <span>{task.project.title}</span>
                  </div>
                </div>
                {task.deadline && (
                  <div className="absolute top-2 right-2 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    {formatDate(task.deadline)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No tasks found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksList;
