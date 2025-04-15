
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderGit2 } from 'lucide-react';

interface SummaryCardProps {
  projectsCount: number;
  communitiesCount: number;
}

const SummaryCard = ({ projectsCount, communitiesCount }: SummaryCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-soft-blue/20 border-soft-blue/10">
      <CardHeader>
        <CardTitle className="text-collabCorner-purple">Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-soft-purple/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-full">
              <FolderGit2 className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-blue-800">Projects</span>
          </div>
          <span className="text-xl font-semibold text-blue-800">{projectsCount}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-soft-purple/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-green-800">Communities</span>
          </div>
          <span className="text-xl font-semibold text-green-800">{communitiesCount}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
