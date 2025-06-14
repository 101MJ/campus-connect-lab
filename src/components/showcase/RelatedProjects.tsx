
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';

interface RelatedProjectsProps {
  currentProjectId: string;
  tags: string[];
}

const RelatedProjects: React.FC<RelatedProjectsProps> = ({ currentProjectId, tags }) => {
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRelatedProjects();
  }, [currentProjectId, tags]);

  const loadRelatedProjects = async () => {
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .eq('is_public', true)
        .neq('project_id', currentProjectId)
        .limit(6);

      const { data, error } = await query;

      if (error) throw error;

      const projects: Project[] = (data || []).map(project => ({
        project_id: project.project_id,
        title: project.title,
        description: project.description || undefined,
        deadline: project.deadline || undefined,
        created_at: project.created_at,
        created_by: project.created_by,
        priority: (project.priority as 'low' | 'medium' | 'high') || 'medium',
        status: (project.status as 'on_track' | 'at_risk' | 'delayed') || 'on_track',
        total_tasks: project.total_tasks || 0,
        completed_tasks: project.completed_tasks || 0,
        is_public: project.is_public || false,
        showcase_description: project.showcase_description || undefined,
        tags: project.tags || [],
        cover_image_url: project.cover_image_url || undefined,
      }));

      // Sort by tag similarity
      const sortedProjects = projects.sort((a, b) => {
        const aMatchingTags = a.tags.filter(tag => tags.includes(tag)).length;
        const bMatchingTags = b.tags.filter(tag => tags.includes(tag)).length;
        return bMatchingTags - aMatchingTags;
      });

      setRelatedProjects(sortedProjects.slice(0, 4));
    } catch (error) {
      console.error('Error loading related projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Related Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-300"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProjects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Related Projects</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProjects.map(project => (
          <Card key={project.project_id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            {/* Cover Image */}
            <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
              {project.cover_image_url ? (
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                  {project.title.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {project.title}
              </h3>
              
              {project.showcase_description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {project.showcase_description}
                </p>
              )}

              {/* Common Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.slice(0, 2).map(tag => {
                    const isCommon = tags.includes(tag);
                    return (
                      <Badge 
                        key={tag} 
                        variant={isCommon ? "default" : "outline"} 
                        className="text-xs"
                      >
                        {isCommon && <Tag className="h-2 w-2 mr-1" />}
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              )}

              <Link to={`/showcase/${project.project_id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatedProjects;
