
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, Bookmark, Calendar, User, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Project } from '@/types/project';
import ProjectReactions from './ProjectReactions';

interface ShowcaseProjectGridProps {
  projects: Project[];
  viewMode: 'grid' | 'list';
  sortBy: string;
  isLoading: boolean;
}

const ShowcaseProjectGrid: React.FC<ShowcaseProjectGridProps> = ({
  projects,
  viewMode,
  sortBy,
  isLoading
}) => {
  const [visibleProjects, setVisibleProjects] = useState(12);
  const [sortedProjects, setSortedProjects] = useState<Project[]>([]);

  useEffect(() => {
    let sorted = [...projects];
    
    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'popular':
        // For now, sort by total_tasks as a proxy for popularity
        sorted.sort((a, b) => (b.total_tasks || 0) - (a.total_tasks || 0));
        break;
      case 'liked':
        // Future: sort by reaction count
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'viewed':
        // Future: sort by view count
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    
    setSortedProjects(sorted);
  }, [projects, sortBy]);

  const loadMore = () => {
    setVisibleProjects(prev => prev + 12);
  };

  if (isLoading) {
    return (
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
            {project.title.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {project.title}
          </h3>
          <Badge variant="secondary" className="ml-2 shrink-0">
            {project.priority}
          </Badge>
        </div>

        {project.showcase_description && (
          <p className="text-gray-600 mb-4 line-clamp-2">
            {project.showcase_description}
          </p>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Project Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Creator</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Engagement Metrics */}
        <ProjectReactions projectId={project.project_id} />

        {/* Action Button */}
        <div className="pt-4 border-t">
          <Link to={`/showcase/${project.project_id}`}>
            <Button className="w-full">
              View Project
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  const ProjectListItem: React.FC<{ project: Project }> = ({ project }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Cover Image */}
        <div className="w-48 h-32 bg-gradient-to-br from-blue-500 to-purple-600 shrink-0">
          {project.cover_image_url ? (
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
              {project.title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <CardContent className="flex-1 p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600">
              {project.title}
            </h3>
            <Badge variant="secondary">{project.priority}</Badge>
          </div>

          {project.showcase_description && (
            <p className="text-gray-600 mb-3 line-clamp-2">
              {project.showcase_description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, 4).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <Link to={`/showcase/${project.project_id}`}>
              <Button variant="outline">View Project</Button>
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {sortedProjects.slice(0, visibleProjects).map(project => (
          viewMode === 'grid' ? (
            <ProjectCard key={project.project_id} project={project} />
          ) : (
            <ProjectListItem key={project.project_id} project={project} />
          )
        ))}
      </div>

      {/* Load More Button */}
      {visibleProjects < sortedProjects.length && (
        <div className="text-center pt-8">
          <Button onClick={loadMore} variant="outline" size="lg">
            Load More Projects
          </Button>
        </div>
      )}

      {sortedProjects.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or browse different categories.</p>
        </div>
      )}
    </div>
  );
};

export default ShowcaseProjectGrid;
