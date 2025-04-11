
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="w-full py-16 md:py-24 lg:py-32 flex flex-col items-center text-center animate-fade-in">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Manage your student{' '}
            <span className="block mt-1">projects and {' '}
              <span className="text-collabCorner-purple">connect with peers</span>
            </span>
          </h1>
          <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground mt-4 mb-8">
            The all-in-one platform for students to collaborate, track progress, and build a community
            around their academic journey.
          </p>
          <Button
            className="bg-collabCorner-purple hover:bg-collabCorner-purple-dark text-white px-8 py-6 text-lg rounded-lg"
            asChild
          >
            <Link to="/signup" className="flex items-center gap-2">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
