
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderGit2 } from 'lucide-react';

interface SummaryCardProps {
  projectsCount: number;
  communitiesCount: number;
}

const SummaryCard = ({ projectsCount, communitiesCount }: SummaryCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
      <CardHeader>
        <CardTitle className="text-collabCorner-purple">Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-collabCorner-purple/10 rounded-full">
              <FolderGit2 className="h-5 w-5 text-collabCorner-purple" />
            </div>
            <span>Projects</span>
          </div>
          <span className="text-xl font-semibold text-collabCorner-purple">{projectsCount}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-collabCorner-purple/10 rounded-full">
              <Users className="h-5 w-5 text-collabCorner-purple" />
            </div>
            <span>Communities</span>
          </div>
          <span className="text-xl font-semibold text-collabCorner-purple">{communitiesCount}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
