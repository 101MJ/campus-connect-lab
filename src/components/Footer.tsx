
import React from 'react';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 bg-white border-t border-gray-100">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BookOpen className="w-6 h-6 text-collabCorner-purple" />
            <span className="text-lg font-semibold">CollabCorner</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {currentYear} CollabCorner. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
