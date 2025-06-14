
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Globe, Lock, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/project';
import { useProjectShowcase } from '@/hooks/useProjectShowcase';

interface ProjectShowcaseToggleProps {
  project: Project;
  onProjectUpdated: () => void;
}

const ProjectShowcaseToggle: React.FC<ProjectShowcaseToggleProps> = ({
  project,
  onProjectUpdated,
}) => {
  const { updateProjectVisibility, isUpdating } = useProjectShowcase();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showcaseDescription, setShowcaseDescription] = useState(project.showcase_description || '');
  const [tags, setTags] = useState<string[]>(project.tags || []);
  const [newTag, setNewTag] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState(project.cover_image_url || '');

  const handleVisibilityToggle = async (isPublic: boolean) => {
    if (isPublic && !project.showcase_description) {
      setDialogOpen(true);
      return;
    }

    const success = await updateProjectVisibility(project.project_id, isPublic);
    if (success) {
      onProjectUpdated();
    }
  };

  const handleSaveShowcaseData = async () => {
    const success = await updateProjectVisibility(project.project_id, true, {
      showcase_description: showcaseDescription,
      tags: tags,
      cover_image_url: coverImageUrl || undefined,
    });
    
    if (success) {
      setDialogOpen(false);
      onProjectUpdated();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {project.is_public ? (
          <Globe className="h-4 w-4 text-green-600" />
        ) : (
          <Lock className="h-4 w-4 text-gray-400" />
        )}
        <span className="text-sm font-medium">
          {project.is_public ? 'Public' : 'Private'}
        </span>
      </div>
      
      <Switch
        checked={project.is_public}
        onCheckedChange={handleVisibilityToggle}
        disabled={isUpdating}
      />

      {project.is_public && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Showcase Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Project Showcase Settings</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="showcase-description">Showcase Description</Label>
                <Textarea
                  id="showcase-description"
                  placeholder="Describe your project for the public showcase..."
                  value={showcaseDescription}
                  onChange={(e) => setShowcaseDescription(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cover-image">Cover Image URL (Optional)</Label>
                <Input
                  id="cover-image"
                  placeholder="https://example.com/image.jpg"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag}>Add</Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveShowcaseData} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save & Publish'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProjectShowcaseToggle;
