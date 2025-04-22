import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  deadline: z.string().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().optional()
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  projectId: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  isSubmitting: boolean;
  projectMembers?: { user_id: string; role: string }[];
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  projectId, 
  onSubmit, 
  isSubmitting,
  projectMembers = []
}) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
      notes: '',
      assigned_to: undefined
    }
  });

  const handleSubmit = async (values: TaskFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
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
        
        <FormField
          control={form.control}
          name="assigned_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign To (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {projectMembers.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm;
