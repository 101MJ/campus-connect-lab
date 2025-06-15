
import React from 'react';
import { Calendar, Eye, Heart, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Project } from '@/types/project';

interface ShowcaseProjectHeaderProps {
  project: Project;
}

const ShowcaseProjectHeader: React.FC<ShowcaseProjectHeaderProps> = ({ project }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const progressPercentage = project.total_tasks > 0 ? (project.completed_tasks / project.total_tasks) * 100 : 0;

  return (
    <Card className={`border-l-4 ${getPriorityColor(project.priority)}`}>
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Project Cover Image */}
          <div className="lg:w-1/3">
            <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
              {project.cover_image_url ? (
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                  {project.title.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Project Info */}
          <div className="lg:w-2/3 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <Badge variant="outline" className="capitalize">
                  {project.priority} Priority
                </Badge>
              </div>
              
              {project.showcase_description && (
                <p className="text-lg text-gray-600 leading-relaxed">
                  {project.showcase_description}
                </p>
              )}
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-collabCorner-purple">{project.total_tasks}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{project.completed_tasks}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {project.status.replace('_', ' ')}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>

            {/* Project Meta */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              {project.deadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Like
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowcaseProjectHeader;
