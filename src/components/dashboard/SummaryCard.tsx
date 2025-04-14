
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryCardProps {
  projectsCount: number;
  communitiesCount: number;
}

const SummaryCard = ({ projectsCount, communitiesCount }: SummaryCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Projects</span>
          <span className="font-semibold">{projectsCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Communities</span>
          <span className="font-semibold">{communitiesCount}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
