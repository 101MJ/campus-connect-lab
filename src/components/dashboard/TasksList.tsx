
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  task_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  project_title?: string;
}

interface TasksListProps {
  tasks: Task[];
  loading: boolean;
}

const TasksList = ({ tasks, loading }: TasksListProps) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('pending');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Recent Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Recent Tasks
        </CardTitle>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { key: 'pending', label: 'Pending', count: taskCounts.pending },
            { key: 'in_progress', label: 'In Progress', count: taskCounts.in_progress },
            { key: 'completed', label: 'Completed', count: taskCounts.completed },
            { key: 'all', label: 'All', count: taskCounts.all },
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key as any)}
              className="text-xs"
            >
              {label} ({count})
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No {filter === 'all' ? '' : filter} tasks found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.slice(0, 10).map((task) => (
              <div key={task.task_id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(task.status)}
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {task.title}
                      </h4>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {task.project_title && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {task.project_title}
                        </span>
                      )}
                      {task.due_date && (
                        <span>
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getPriorityColor(task.priority))}
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksList;
