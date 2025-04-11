
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

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().optional(),
  portfolio: z.string().url('Please enter a valid URL').or(z.literal('')),
  skills: z.string().optional(),
  hobbies: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const academicSchema = z.object({
  grades: z.string().optional(),
  standardised_testing: z.string().optional(),
});

type AcademicFormValues = z.infer<typeof academicSchema>;

const ProfileSettings = () => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Profile form
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

  // Academic form
  const academicForm = useForm<AcademicFormValues>({
    resolver: zodResolver(academicSchema),
    defaultValues: {
      grades: profile?.grades ? JSON.stringify(profile.grades, null, 2) : '',
      standardised_testing: profile?.standardised_testing 
        ? JSON.stringify(profile.standardised_testing, null, 2) 
        : '',
    },
  });

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

  const onAcademicSubmit = async (values: AcademicFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Parse JSON strings
      let grades = null;
      let standardisedTesting = null;
      
      try {
        if (values.grades) grades = JSON.parse(values.grades);
        if (values.standardised_testing) standardisedTesting = JSON.parse(values.standardised_testing);
      } catch (e) {
        toast.error('Invalid JSON format. Please check your input.');
        setIsLoading(false);
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          grades,
          standardised_testing: standardisedTesting,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Academic information updated successfully');
    } catch (error: any) {
      console.error('Error updating academic info:', error);
      toast.error(error.message || 'Failed to update academic information');
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
          
          <TabsContent value="academic" className="mt-4">
            <Card>
              <Form {...academicForm}>
                <form onSubmit={academicForm.handleSubmit(onAcademicSubmit)}>
                  <CardHeader>
                    <CardTitle>Academic Information</CardTitle>
                    <CardDescription>
                      Update your grades and standardized test scores (in JSON format)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={academicForm.control}
                      name="grades"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grades</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder='{ "math": "A", "science": "B+" }'
                              className="font-mono resize-none min-h-[150px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={academicForm.control}
                      name="standardised_testing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Standardized Testing</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder='{ "SAT": 1400, "ACT": 30 }'
                              className="font-mono resize-none min-h-[150px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Academic Info'}
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
