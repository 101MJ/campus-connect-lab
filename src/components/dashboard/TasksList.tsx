
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
  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
      <CardHeader>
        <CardTitle className="text-collabCorner-purple">Recent Tasks</CardTitle>
        <CardDescription>Your most recent tasks across all projects</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading tasks...</div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task.task_id} 
                className="flex items-start gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all duration-300 border border-transparent hover:border-collabCorner-purple/20"
              >
                <div className="mt-1">
                  {task.is_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-collabCorner-purple" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium">{task.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{task.project.title}</span>
                    </div>
                    {task.deadline && (
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        <span>{format(new Date(task.deadline), 'PPP')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksList;
