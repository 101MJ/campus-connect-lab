
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface DeleteCommunityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  communityName: string;
  onDeleteSuccess: () => void;
}

const DeleteCommunityDialog = ({
  isOpen,
  onClose,
  communityId,
  communityName,
  onDeleteSuccess,
}: DeleteCommunityDialogProps) => {
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('community_id', communityId);

      if (error) throw error;

      toast.success('Community deleted successfully');
      onDeleteSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting community:', error);
      toast.error('Failed to delete community');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Community</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the community "{communityName}"? This action cannot be undone.
            All posts and content will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Community
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCommunityDialog;
