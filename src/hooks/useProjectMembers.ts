
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
}

export interface Invitation {
  email: string;
  role: 'owner' | 'editor' | 'viewer';
}

export function useProjectMembers(projectId: string | null) {
  const [isInviting, setIsInviting] = useState(false);
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async (): Promise<ProjectMember[]> => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 30000
  });

  const inviteMember = async ({ email, role }: Invitation) => {
    if (!projectId) return;
    
    setIsInviting(true);
    try {
      const { error } = await supabase
        .from('project_invitations')
        .insert({
          project_id: projectId,
          email,
          role
        });
      
      if (error) throw error;
      
      toast.success('Invitation sent successfully');
      return true;
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error('Failed to send invitation');
      return false;
    } finally {
      setIsInviting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({
        queryKey: ['project-members', projectId]
      });
      
      toast.success('Member removed successfully');
      return true;
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      return false;
    }
  };

  return {
    members,
    isLoading,
    isInviting,
    inviteMember,
    removeMember
  };
}
