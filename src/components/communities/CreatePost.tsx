
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, X } from 'lucide-react';

interface CreatePostProps {
  communityId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ communityId, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a post');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          community_id: communityId,
          author_id: user.id,
          title: title.trim(),
          content: content.trim()
        });
      
      if (error) throw error;
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Create New Post</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-medium text-lg"
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            <Send className="h-4 w-4 mr-1" /> Post
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePost;
