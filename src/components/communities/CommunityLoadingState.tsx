
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CommunityLoadingStateProps {
  onBack: () => void;
}

const CommunityLoadingState: React.FC<CommunityLoadingStateProps> = ({ onBack }) => {
  return (
    <div className="flex justify-center py-8">
      <Button onClick={onBack} variant="outline" className="absolute top-4 left-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      Loading community details...
    </div>
  );
};

export default CommunityLoadingState;
