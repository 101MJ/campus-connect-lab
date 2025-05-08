
import React from 'react';
import { Users, Info, Plus, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from '@/components/ui/motion';

interface EmptyCommunityStateProps {
  onCreateClick: () => void;
}

const EmptyCommunityState: React.FC<EmptyCommunityStateProps> = ({ onCreateClick }) => {
  return (
    <div className="text-center py-12 bg-gradient-to-br from-white to-collabCorner-purple/5 rounded-lg border border-dashed animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-collabCorner-purple/10 rounded-full animate-pulse-slow"></div>
          <Users className="absolute inset-0 m-auto h-12 w-12 text-collabCorner-purple" />
        </div>
      </div>
      
      <h2 className="text-xl font-medium mb-3 text-gradient">No communities selected</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Join a community to connect with others, share ideas, and collaborate on projects.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          className="bg-collabCorner-purple hover:bg-collabCorner-purple/90 flex items-center gap-2" 
          onClick={onCreateClick}
        >
          <Plus className="h-4 w-4" />
          Create New Community
        </Button>
        
        <Button 
          variant="outline" 
          className="border-collabCorner-purple/30 text-collabCorner-purple hover:bg-collabCorner-purple/5"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Browse Communities
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-muted/30 rounded-md max-w-lg mx-auto">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-collabCorner-purple shrink-0 mt-0.5" />
          <div className="text-left text-sm">
            <h3 className="font-medium mb-1">Why join a community?</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Connect with like-minded individuals</li>
              <li>Share ideas and get feedback</li>
              <li>Collaborate on interesting projects</li>
              <li>Stay updated with latest trends</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyCommunityState;
