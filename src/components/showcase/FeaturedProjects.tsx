
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/project';

interface FeaturedProjectsProps {
  projects: Project[];
}

const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ projects }) => {
  if (projects.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Star className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Featured Projects</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Card key={project.project_id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 relative">
            {/* Featured Badge */}
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                <Award className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>

            {/* Cover Image */}
            <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
              {project.cover_image_url ? (
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                  {project.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Project Title Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                  {project.title}
                </h3>
                {project.showcase_description && (
                  <p className="text-gray-200 text-sm line-clamp-2">
                    {project.showcase_description}
                  </p>
                )}
              </div>
            </div>

            <CardContent className="p-6">
              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{project.total_tasks || 0} tasks</span>
                  </div>
                  <Badge variant="secondary">{project.priority}</Badge>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Action Button */}
              <Link to={`/showcase/${project.project_id}`}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Explore Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProjects;
