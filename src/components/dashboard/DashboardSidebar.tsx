
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User, Briefcase, Users, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const DashboardSidebar = () => {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  
  const navItems = [
    { name: 'Profile', icon: User, path: '/dashboard' },
    { name: 'Projects', icon: Briefcase, path: '/dashboard/projects' },
    { name: 'Communities', icon: Users, path: '/dashboard/communities' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' }
  ];

  return (
    <div className="w-64 bg-white border-r shadow-sm flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-collabCorner-purple" />
          <span className="text-xl font-semibold">CollabCorner</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-collabCorner-purple text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-semibold">
            {profile?.full_name?.charAt(0) || '?'}
          </div>
          <div>
            <div className="font-medium truncate">{profile?.full_name}</div>
            <div className="text-sm text-muted-foreground truncate">{profile?.bio || 'No bio yet'}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                  location.pathname === item.path 
                    ? "bg-collabCorner-purple text-white"
                    : "hover:bg-gray-100"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 justify-center"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
