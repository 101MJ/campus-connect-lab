
import React from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TaskItemProps {
  task: {
    task_id: string;
    title: string;
    description: string | null;
    deadline: string | null;
    notes: string | null;
    is_completed: boolean;
  };
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, isCompleted: boolean) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onStatusChange }) => {
  const handleStatusChange = async (checked: boolean) => {
    onStatusChange(task.task_id, checked);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={`border-l-4 ${task.is_completed ? 'border-l-green-500' : 'border-l-amber-500'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={task.is_completed} 
            onCheckedChange={handleStatusChange}
            className="mt-1"
          />
          <div className="flex-1">
            <h3 className={`text-lg font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-muted-foreground mt-1">
                {task.description}
              </p>
            )}
            {task.notes && (
              <div className="mt-2 bg-muted/50 p-2 rounded text-sm">
                <p className="font-medium">Notes:</p>
                <p>{task.notes}</p>
              </div>
            )}
            {task.deadline && (
              <p className="text-sm mt-2">
                <span className="font-medium">Deadline:</span> {formatDate(task.deadline)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end p-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDelete(task.task_id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskItem;
