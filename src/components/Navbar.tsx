
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut, User, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <BookOpen className="w-8 h-8 text-collabCorner-purple" />
        <span className="text-xl font-semibold">CollabCorner</span>
      </div>
      <div className="flex gap-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{profile?.full_name || user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button className="bg-collabCorner-purple hover:bg-collabCorner-purple-dark" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
