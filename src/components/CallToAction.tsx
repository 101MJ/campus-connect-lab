
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="w-full py-16 md:py-24 bg-collabCorner-purple text-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Collaborating?</h2>
          <p className="max-w-[600px] text-lg md:text-xl opacity-90">
            Join thousands of students who are already using CollabCorner to manage their 
            projects and connect with peers.
          </p>
          <Button
            className="mt-6 bg-white text-collabCorner-purple hover:bg-gray-100 px-8 py-6 text-lg rounded-lg"
            asChild
          >
            <Link to="/signup">Get Started Today</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
