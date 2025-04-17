
import React from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, CalendarDays } from 'lucide-react';
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
    <Card className={`border-l-4 ${task.is_completed ? 'border-l-green-500' : 'border-l-amber-500'} bg-gradient-to-r ${task.is_completed ? 'from-green-50/50 to-white' : 'from-amber-50/50 to-white'}`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3 relative">
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
              <p className="text-muted-foreground mt-1 text-sm">
                {task.description}
              </p>
            )}
            {task.notes && (
              <div className="mt-2 bg-white/80 p-2 rounded text-sm">
                <p className="font-medium">Notes:</p>
                <p className="text-muted-foreground">{task.notes}</p>
              </div>
            )}
          </div>
          
          {task.deadline && (
            <div className="absolute top-0 right-0">
              <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                <CalendarDays className="h-3 w-3" />
                <span>{format(new Date(task.deadline), 'MMM d')}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end p-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDelete(task.task_id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskItem;
