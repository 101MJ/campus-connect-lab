import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Briefcase, Users, Settings, LogOut, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const DashboardSidebar = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  const navItems = [
    { name: 'Profile', icon: UserRound, path: '/dashboard' },
    { name: 'Projects', icon: Briefcase, path: '/dashboard/projects' },
    { name: 'Communities', icon: Users, path: '/dashboard/communities' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' }
  ];

  return (
    <div className={cn(
      "bg-white border-r shadow-sm flex flex-col h-full transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Sidebar Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-collabCorner-purple" />
          {!isCollapsed && <span className="text-xl font-semibold">CollabCorner</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hover:bg-gray-100"
        >
          <div className="w-4 h-4 flex flex-col justify-center gap-1">
            <div className="h-0.5 w-full bg-gray-600" />
            <div className="h-0.5 w-full bg-gray-600" />
            <div className="h-0.5 w-full bg-gray-600" />
          </div>
        </Button>
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
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 justify-center w-full",
            isCollapsed && "p-2"
          )}
          onClick={signOut}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
