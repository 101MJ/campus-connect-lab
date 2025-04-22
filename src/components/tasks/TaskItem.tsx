
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Edit2, 
  Calendar, 
  Trash2, 
  CheckCircle, 
  Loader2 
} from 'lucide-react';
import { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, isCompleted: boolean) => void;
  onEdit: (taskId: string) => void;
  isDeleting?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onDelete, 
  onStatusChange, 
  onEdit,
  isDeleting = false
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={`hover:shadow transition-shadow duration-200 relative ${
      task.is_completed ? 'bg-muted/20' : 'bg-card'
    }`}>
      <CardContent className="p-4 flex items-start">
        <div className="flex-shrink-0 mt-1">
          <Checkbox
            checked={task.is_completed}
            onCheckedChange={(checked) => onStatusChange(task.task_id, Boolean(checked))}
            className={task.is_completed ? 'text-green-500' : ''}
          />
        </div>
        
        <div className="ml-3 flex-1">
          <div className={`text-base font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </div>
          
          {task.description && (
            <p className={`mt-1 text-sm ${task.is_completed ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
              {task.description}
            </p>
          )}
          
          {task.notes && (
            <p className="mt-2 text-xs p-2 bg-muted rounded-sm">
              {task.notes}
            </p>
          )}
          
          {task.deadline && (
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" /> 
              Due: {formatDate(task.deadline)}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task.task_id)}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Edit</span>
            <Edit2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.task_id)}
            className="h-8 w-8 p-0 text-destructive"
            disabled={isDeleting}
          >
            <span className="sr-only">Delete</span>
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
          
          {task.is_completed && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
