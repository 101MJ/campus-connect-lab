
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: {
    task_id: string;
    title: string;
    description: string | null;
    deadline: string | null;
    notes: string | null;
  } | null;
  onSubmit: (taskId: string, values: TaskFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  open,
  onOpenChange,
  task,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      deadline: task?.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
      notes: task?.notes || '',
    },
  });

  // Reset form when task changes
  React.useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || '',
        description: task.description || '',
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        notes: task.notes || '',
      });
    }
  }, [task, form]);

  const handleSubmit = async (values: TaskFormValues) => {
    if (task) {
      await onSubmit(task.task_id, values);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details
          </DialogDescription>
        </DialogHeader>
        
        {task && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Task name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Task details"
                        className="resize-none min-h-[80px]"
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Additional notes"
                        className="resize-none min-h-[80px]"
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
