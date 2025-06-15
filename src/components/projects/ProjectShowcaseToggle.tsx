
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';

interface ProjectShowcaseToggleProps {
  project: Project;
  onUpdate: () => void;
}

const ProjectShowcaseToggle: React.FC<ProjectShowcaseToggleProps> = ({ 
  project, 
  onUpdate 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          is_public: checked,
          showcase_description: checked ? project.description : null
        })
        .eq('project_id', project.project_id);

      if (error) throw error;

      toast.success(
        checked 
          ? 'Project added to showcase!' 
          : 'Project removed from showcase'
      );
      onUpdate();
    } catch (error) {
      console.error('Error updating project visibility:', error);
      toast.error('Failed to update project visibility');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="showcase-toggle"
        checked={project.is_public || false}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
      />
      <Label htmlFor="showcase-toggle" className="text-sm font-medium">
        Show in public showcase
      </Label>
    </div>
  );
};

export default ProjectShowcaseToggle;
