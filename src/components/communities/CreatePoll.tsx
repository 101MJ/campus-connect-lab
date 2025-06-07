
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BarChart3, X, Plus, Minus } from 'lucide-react';

interface CreatePollProps {
  communityId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CreatePoll: React.FC<CreatePollProps> = ({ communityId, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a poll');
      return;
    }
    
    if (!question.trim()) {
      toast.error('Poll question is required');
      return;
    }
    
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('At least 2 poll options are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const pollData = {
        type: 'poll',
        question: question.trim(),
        options: validOptions,
        description: description.trim(),
        votes: validOptions.reduce((acc, _, index) => ({ ...acc, [index]: 0 }), {}),
        voters: []
      };

      console.log('Creating new poll in community:', communityId);
      const { data, error } = await supabase
        .from('posts')
        .insert({
          community_id: communityId,
          author_id: user.id,
          title: question.trim(),
          content: JSON.stringify(pollData)
        })
        .select();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Poll created successfully:', data);
      toast.success('Poll created successfully');
      setQuestion('');
      setDescription('');
      setOptions(['', '']);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidForm = question.trim() && options.filter(opt => opt.trim()).length >= 2;

  return (
    <Card className="border border-dashed border-collabCorner-purple/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-collabCorner-purple" />
          Create New Poll
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="What's your poll question?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="font-medium text-lg"
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Add a description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Poll Options (2-6 options)</h4>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1"
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddOption}
                className="text-collabCorner-purple hover:text-collabCorner-purple/80"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            )}
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
            disabled={isSubmitting || !isValidForm}
            className="bg-collabCorner-purple"
          >
            <BarChart3 className="h-4 w-4 mr-1" /> Create Poll
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePoll;
