
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState({
    projects: true,
    communities: true
  });

  useEffect(() => {
    if (user) {
      // Fetch user's projects
      const fetchProjects = async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching projects:', error);
          toast.error('Failed to load projects');
        } else {
          setProjects(data || []);
        }
        setLoading(prev => ({ ...prev, projects: false }));
      };

      // Fetch communities
      const fetchCommunities = async () => {
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .limit(5);
        
        if (error) {
          console.error('Error fetching communities:', error);
          toast.error('Failed to load communities');
        } else {
          setCommunities(data || []);
        }
        setLoading(prev => ({ ...prev, communities: false }));
      };

      fetchProjects();
      fetchCommunities();
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
              <CardDescription>Your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{profile?.full_name}</h3>
                  <p className="text-muted-foreground mt-1">
                    {profile?.bio || 'No bio added yet'}
                  </p>
                </div>

                {profile?.portfolio && (
                  <div>
                    <h4 className="font-medium">Portfolio</h4>
                    <a 
                      href={profile.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.portfolio}
                    </a>
                  </div>
                )}

                {profile?.skills && profile.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium">Skills</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 px-2 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile?.hobbies && profile.hobbies.length > 0 && (
                  <div>
                    <h4 className="font-medium">Hobbies</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.hobbies.map((hobby, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 px-2 py-1 rounded-full text-sm"
                        >
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Projects</span>
                <span className="font-semibold">{projects.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Communities</span>
                <span className="font-semibold">{communities.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Academic Information */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList>
            <TabsTrigger value="projects">Recent Projects</TabsTrigger>
            <TabsTrigger value="academics">Academic Info</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Projects you've created or joined</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.projects ? (
                  <div className="text-center py-4">Loading projects...</div>
                ) : projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.slice(0, 3).map((project: any) => (
                      <div key={project.project_id} className="border-b pb-4 last:border-0">
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.description?.substring(0, 100) || 'No description'}
                          {project.description?.length > 100 && '...'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    You haven't created any projects yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="academics" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Grades</h3>
                    {profile?.grades ? (
                      <pre className="bg-gray-50 p-4 rounded text-sm">
                        {JSON.stringify(profile.grades, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-muted-foreground">No grade information added yet</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Standardized Testing</h3>
                    {profile?.standardised_testing ? (
                      <pre className="bg-gray-50 p-4 rounded text-sm">
                        {JSON.stringify(profile.standardised_testing, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-muted-foreground">No standardized test information added yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="communities" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Communities</CardTitle>
                <CardDescription>Communities you're part of</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.communities ? (
                  <div className="text-center py-4">Loading communities...</div>
                ) : communities.length > 0 ? (
                  <div className="space-y-4">
                    {communities.slice(0, 3).map((community: any) => (
                      <div key={community.community_id} className="border-b pb-4 last:border-0">
                        <h3 className="font-semibold">{community.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {community.description?.substring(0, 100) || 'No description'}
                          {community.description?.length > 100 && '...'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No communities found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
