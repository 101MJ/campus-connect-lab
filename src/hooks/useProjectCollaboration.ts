
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProjectCollaborator, CollaborationRequest } from '@/types/project';

export const useProjectCollaboration = (projectId: string) => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: collaborators = [], isLoading: loadingCollaborators } = useQuery({
    queryKey: ['project-collaborators', projectId],
    queryFn: async (): Promise<ProjectCollaborator[]> => {
      const { data, error } = await supabase
        .from('project_collaborators')
        .select('*')
        .eq('project_id', projectId)
        .order('joined_at', { ascending: false });
      
      if (error) throw error;
      
      // Cast the role to the correct type
      return (data || []).map(collaborator => ({
        ...collaborator,
        role: collaborator.role as 'owner' | 'admin' | 'contributor' | 'viewer'
      }));
    },
    enabled: !!projectId,
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['collaboration-requests', projectId],
    queryFn: async (): Promise<CollaborationRequest[]> => {
      const { data, error } = await supabase
        .from('collaboration_requests')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Cast the status to the correct type
      return (data || []).map(request => ({
        ...request,
        status: request.status as 'pending' | 'approved' | 'rejected'
      }));
    },
    enabled: !!projectId,
  });

  const requestCollaboration = async (message?: string) => {
    setIsProcessing(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('collaboration_requests')
        .insert({
          project_id: projectId,
          requested_by: user.user.id,
          message: message || null,
        });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['collaboration-requests', projectId] });
      toast.success('Collaboration request sent');
      return true;
    } catch (error: any) {
      console.error('Request collaboration error:', error);
      toast.error(error.message || 'Failed to send collaboration request');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const respondToRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    setIsProcessing(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('collaboration_requests')
        .update({
          status,
          responded_by: user.user.id,
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId);
      
      if (error) throw error;

      // If approved, add as collaborator
      if (status === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: collaboratorError } = await supabase
            .from('project_collaborators')
            .insert({
              project_id: projectId,
              user_id: request.requested_by,
              role: 'contributor',
              invited_by: user.user.id,
            });
          
          if (collaboratorError) throw collaboratorError;
          queryClient.invalidateQueries({ queryKey: ['project-collaborators', projectId] });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['collaboration-requests', projectId] });
      toast.success(`Request ${status}`);
      return true;
    } catch (error: any) {
      console.error('Respond to request error:', error);
      toast.error(error.message || 'Failed to respond to request');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('id', collaboratorId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['project-collaborators', projectId] });
      toast.success('Collaborator removed');
      return true;
    } catch (error: any) {
      console.error('Remove collaborator error:', error);
      toast.error(error.message || 'Failed to remove collaborator');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    collaborators,
    requests,
    loadingCollaborators,
    loadingRequests,
    isProcessing,
    requestCollaboration,
    respondToRequest,
    removeCollaborator,
  };
};
