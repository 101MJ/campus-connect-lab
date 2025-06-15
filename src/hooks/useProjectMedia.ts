
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProjectMedia } from '@/types/project';

export const useProjectMedia = (projectId: string) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['project-media', projectId],
    queryFn: async (): Promise<ProjectMedia[]> => {
      const { data, error } = await supabase
        .from('project_media')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });

  const uploadFile = async (file: File, fileType: 'image' | 'document' | 'video') => {
    setIsUploading(true);
    try {
      // Check file size limit (100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size exceeds 100MB limit');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const bucketName = `project-${fileType}s`;
      const fileName = `${user.id}/${projectId}/${Date.now()}-${file.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('project_media')
        .insert({
          project_id: projectId,
          file_name: file.name,
          file_path: fileName,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
        });
      
      if (dbError) throw dbError;
      
      // Refresh media list
      queryClient.invalidateQueries({ queryKey: ['project-media', projectId] });
      
      toast.success('File uploaded successfully');
      return true;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (mediaId: string, filePath: string, bucketName: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
      
      if (storageError) throw storageError;

      // Delete metadata from database
      const { error: dbError } = await supabase
        .from('project_media')
        .delete()
        .eq('id', mediaId);
      
      if (dbError) throw dbError;
      
      // Refresh media list
      queryClient.invalidateQueries({ queryKey: ['project-media', projectId] });
      
      toast.success('File deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete file');
    }
  };

  const getFileUrl = (filePath: string, fileType: 'image' | 'document' | 'video') => {
    const bucketName = `project-${fileType}s`;
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  return {
    media,
    isLoading,
    isUploading,
    uploadFile,
    deleteFile,
    getFileUrl,
  };
};
