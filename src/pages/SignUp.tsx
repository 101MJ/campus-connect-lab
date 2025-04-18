import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    try {
      const { success, error } = await signUp(values.email, values.password);
      
      if (success) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.from('profiles').update({
            full_name: values.fullName
          }).eq('id', userData.user.id);
        }
      } else if (error) {
        console.error('Sign up error:', error);
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-collabCorner-purple" />
              <span className="text-2xl font-bold">CollabCorner</span>
            </Link>
            <h1 className="text-3xl font-bold">Welcome to CollabCorner</h1>
            <p className="text-muted-foreground">Join our community of students</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
            <div className="flex space-x-2">
              <Link to="/signin" className="w-full">
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Button variant="outline" className="w-full bg-collabCorner-blue-light">Sign Up</Button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your full name"
                          type="text"
                          autoComplete="name"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your email"
                          type="email"
                          autoComplete="email"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your password"
                          type="password"
                          autoComplete="new-password"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit"
                  className="w-full bg-collabCorner-purple hover:bg-collabCorner-purple-dark"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link to="/signin" className="underline text-collabCorner-purple">
                    Sign In
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
