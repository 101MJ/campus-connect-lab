
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, User, Tag, Github, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import MediaManager from '@/components/media/MediaManager';
import ProjectReactions from '@/components/showcase/ProjectReactions';
import RelatedProjects from '@/components/showcase/RelatedProjects';
import { Project } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { useProjectShowcase } from '@/hooks/useProjectShowcase';
import { toast } from 'sonner';

const ShowcaseProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordProjectView } = useProjectShowcase();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject(id);
      recordProjectView(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_public', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          toast.error('Project not found or not publicly available');
          navigate('/showcase');
          return;
        }
        throw error;
      }

      const projectData: Project = {
        project_id: data.project_id,
        title: data.title,
        description: data.description || undefined,
        deadline: data.deadline || undefined,
        created_at: data.created_at,
        created_by: data.created_by,
        priority: (data.priority as 'low' | 'medium' | 'high') || 'medium',
        status: (data.status as 'on_track' | 'at_risk' | 'delayed') || 'on_track',
        total_tasks: data.total_tasks || 0,
        completed_tasks: data.completed_tasks || 0,
        is_public: data.is_public || false,
        showcase_description: data.showcase_description || undefined,
        tags: data.tags || [],
        cover_image_url: data.cover_image_url || undefined,
      };

      setProject(projectData);
    } catch (error: any) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
      navigate('/showcase');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or isn't publicly available.</p>
          <Link to="/showcase">
            <Button>Browse Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => navigate('/showcase')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Showcase
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                    {project.showcase_description && (
                      <p className="text-lg text-gray-600">{project.showcase_description}</p>
                    )}
                  </div>
                  <Badge variant="secondary">{project.priority}</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Description */}
                {project.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">About This Project</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                  </div>
                )}

                {/* Project Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{project.total_tasks}</div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{project.completed_tasks}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {project.total_tasks > 0 ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Progress</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{project.status.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600">Status</div>
                  </div>
                </div>

                {/* Reactions */}
                <Separator className="my-6" />
                <ProjectReactions projectId={project.project_id} />
              </CardContent>
            </Card>

            {/* Media Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Project Media</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaManager
                  projectId={project.project_id}
                  canUpload={false}
                  canDelete={false}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Creator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {project.created_by.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Project Creator</div>
                    <div className="text-sm text-gray-600">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                
                {project.deadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Priority:</span>
                    <Badge variant="outline">{project.priority}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant="outline">{project.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Share Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Projects */}
        <div className="mt-12">
          <RelatedProjects 
            currentProjectId={project.project_id} 
            tags={project.tags}
          />
        </div>
      </div>
    </div>
  );
};

export default ShowcaseProjectDetail;
