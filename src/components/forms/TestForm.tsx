
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const testSchema = z.object({
  test_name: z.string().min(1, 'Test name is required'),
  test_score: z.string().optional(),
  year: z.string().min(1, 'Year is required'),
  notes: z.string().optional(),
});

type TestFormValues = z.infer<typeof testSchema>;

export const TestForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      test_name: '',
      test_score: '',
      year: '',
      notes: '',
    },
  });

  const onSubmit = async (values: TestFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_standardized_tests')
        .insert({
          user_id: user.id,
          test_name: values.test_name,
          test_score: values.test_score,
          year: values.year,
          notes: values.notes
        });

      if (error) throw error;
      toast.success('Test score added successfully');
      form.reset();
    } catch (error: any) {
      console.error('Error adding test score:', error);
      toast.error(error.message || 'Failed to add test score');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Add Standardized Test</CardTitle>
            <CardDescription>
              Add your standardized test scores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="test_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter test name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="test_score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Score</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your score" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter the year" />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Add any additional notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Test Score'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
