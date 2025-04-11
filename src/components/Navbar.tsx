
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <BookOpen className="w-8 h-8 text-collabCorner-purple" />
        <span className="text-xl font-semibold">CollabCorner</span>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link to="/signin">Sign In</Link>
        </Button>
        <Button className="bg-collabCorner-purple hover:bg-collabCorner-purple-dark" asChild>
          <Link to="/signup">Get Started</Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
