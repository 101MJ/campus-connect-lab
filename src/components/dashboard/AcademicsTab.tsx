
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/contexts/AuthContext';

interface AcademicsTabProps {
  profile: Profile | null;
}

const AcademicsTab = ({ profile }: AcademicsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Grades</h3>
            {profile?.grades ? (
              <pre className="bg-gray-50 p-4 rounded text-sm">
                {JSON.stringify(profile.grades, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">No grade information added yet</p>
            )}
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Standardized Testing</h3>
            {profile?.standardised_testing ? (
              <pre className="bg-gray-50 p-4 rounded text-sm">
                {JSON.stringify(profile.standardised_testing, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">No standardized test information added yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademicsTab;
