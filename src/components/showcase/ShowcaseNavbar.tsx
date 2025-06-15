
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const ShowcaseNavbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-collabCorner-purple" />
            <span className="text-xl font-semibold">CollabCorner</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {user && (
              <Button variant="outline" asChild>
                <Link to="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </Button>
            )}
            
            {!user && (
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ShowcaseNavbar;
