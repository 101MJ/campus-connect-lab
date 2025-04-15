
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().optional(),
  portfolio: z.string().url('Please enter a valid URL').or(z.literal('')),
  skills: z.string().optional(),
  hobbies: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const gradeSchema = z.object({
  grade: z.string().min(1, 'Grade is required'),
  gpa_marks: z.string().optional(),
  year: z.string().min(1, 'Year is required'),
  notes: z.string().optional(),
});

const testSchema = z.object({
  test_name: z.string().min(1, 'Test name is required'),
  test_score: z.string().optional(),
  year: z.string().min(1, 'Year is required'),
  notes: z.string().optional(),
});

const awardSchema = z.object({
  title: z.string().min(1, 'Award title is required'),
  organization: z.string().optional(),
  year: z.string().min(1, 'Year is required'),
  description: z.string().optional(),
});

type GradeFormValues = z.infer<typeof gradeSchema>;
type TestFormValues = z.infer<typeof testSchema>;
type AwardFormValues = z.infer<typeof awardSchema>;

const ProfileSettings = () => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      portfolio: profile?.portfolio || '',
      skills: profile?.skills ? profile.skills.join(', ') : '',
      hobbies: profile?.hobbies ? profile.hobbies.join(', ') : '',
    },
  });

  const gradeForm = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      grade: '',
      gpa_marks: '',
      year: '',
      notes: '',
    },
  });

  const testForm = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      test_name: '',
      test_score: '',
      year: '',
      notes: '',
    },
  });

  const awardForm = useForm<AwardFormValues>({
    resolver: zodResolver(awardSchema),
    defaultValues: {
      title: '',
      organization: '',
      year: '',
      description: '',
    },
  });

  const onGradeSubmit = async (values: GradeFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_grades')
        .insert({
          user_id: user.id,
          ...values
        });

      if (error) throw error;
      toast.success('Grade added successfully');
      gradeForm.reset();
    } catch (error: any) {
      console.error('Error adding grade:', error);
      toast.error(error.message || 'Failed to add grade');
    } finally {
      setIsLoading(false);
    }
  };

  const onTestSubmit = async (values: TestFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Make sure test_name is included and not optional as it's required by the database schema
      const { error } = await supabase
        .from('user_standardized_tests')
        .insert({
          user_id: user.id,
          test_name: values.test_name, // Explicitly include this required field
          test_score: values.test_score,
          year: values.year,
          notes: values.notes
        });

      if (error) throw error;
      toast.success('Test score added successfully');
      testForm.reset();
    } catch (error: any) {
      console.error('Error adding test score:', error);
      toast.error(error.message || 'Failed to add test score');
    } finally {
      setIsLoading(false);
    }
  };

  const onAwardSubmit = async (values: AwardFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Make sure title is included and not optional as it's required by the database schema
      const { error } = await supabase
        .from('user_awards')
        .insert({
          user_id: user.id,
          title: values.title, // Explicitly include this required field
          organization: values.organization,
          year: values.year,
          description: values.description
        });

      if (error) throw error;
      toast.success('Award added successfully');
      awardForm.reset();
    } catch (error: any) {
      console.error('Error adding award:', error);
      toast.error(error.message || 'Failed to add award');
    } finally {
      setIsLoading(false);
    }
  };

  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Convert comma-separated strings to arrays
      const skills = values.skills 
        ? values.skills.split(',').map(s => s.trim()).filter(Boolean) 
        : [];
      
      const hobbies = values.hobbies 
        ? values.hobbies.split(',').map(h => h.trim()).filter(Boolean) 
        : [];
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          bio: values.bio,
          portfolio: values.portfolio || null,
          skills,
          hobbies,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Update your profile information and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-4">
            <Card>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and public profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Tell us about yourself"
                              className="resize-none min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="portfolio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://yourportfolio.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="React, TypeScript, Design (comma separated)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="hobbies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hobbies</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Reading, Coding, Sports (comma separated)" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
          
          <TabsContent value="academic" className="mt-4 space-y-6">
            {/* Grades Form */}
            <Card>
              <Form {...gradeForm}>
                <form onSubmit={gradeForm.handleSubmit(onGradeSubmit)}>
                  <CardHeader>
                    <CardTitle>Add Grade</CardTitle>
                    <CardDescription>
                      Add your academic grades and marks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={gradeForm.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your grade" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={gradeForm.control}
                      name="gpa_marks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GPA/Marks</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your GPA or marks" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={gradeForm.control}
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
                      control={gradeForm.control}
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
                      {isLoading ? 'Adding...' : 'Add Grade'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>

            {/* Standardized Tests Form */}
            <Card>
              <Form {...testForm}>
                <form onSubmit={testForm.handleSubmit(onTestSubmit)}>
                  <CardHeader>
                    <CardTitle>Add Standardized Test</CardTitle>
                    <CardDescription>
                      Add your standardized test scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={testForm.control}
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
                      control={testForm.control}
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
                      control={testForm.control}
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
                      control={testForm.control}
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

            {/* Awards Form */}
            <Card>
              <Form {...awardForm}>
                <form onSubmit={awardForm.handleSubmit(onAwardSubmit)}>
                  <CardHeader>
                    <CardTitle>Add Award</CardTitle>
                    <CardDescription>
                      Add your awards and achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={awardForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Award Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter award title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={awardForm.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter organization name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={awardForm.control}
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
                      control={awardForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Add award description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Award'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;
