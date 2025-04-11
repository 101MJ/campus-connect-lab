
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const SignIn = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8">
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
            <Button variant="outline" className="w-full bg-collabCorner-blue-light">Sign In</Button>
            <Link to="/signup" className="w-full">
              <Button variant="outline" className="w-full">Sign Up</Button>
            </Link>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
              <Input
                id="email"
                placeholder="Enter your email"
                type="email"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
              <Input
                id="password"
                placeholder="Enter your password"
                type="password"
                autoComplete="current-password"
              />
            </div>
            <Button className="w-full bg-collabCorner-purple hover:bg-collabCorner-purple-dark">
              Sign In
            </Button>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="underline text-collabCorner-purple">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
