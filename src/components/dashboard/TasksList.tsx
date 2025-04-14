
import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Circle } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
        <CardDescription>Your most recent tasks across all projects</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading tasks...</div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.task_id} className="flex items-start gap-3 border-b last:border-0 pb-4 last:pb-0">
                <div className="mt-1">
                  {task.is_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Project: {task.project.title}
                  </p>
                  {task.deadline && (
                    <p className="text-sm text-muted-foreground">
                      Due: {format(new Date(task.deadline), 'PPP')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No tasks found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksList;
