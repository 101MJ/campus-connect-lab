
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CommunityNotFoundProps {
  onBack: () => void;
}

const CommunityNotFound: React.FC<CommunityNotFoundProps> = ({ onBack }) => {
  return (
    <div className="text-center py-8">
      <p>Community not found</p>
      <Button onClick={onBack} variant="outline" className="mt-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Communities
      </Button>
    </div>
  );
};

export default CommunityNotFound;
