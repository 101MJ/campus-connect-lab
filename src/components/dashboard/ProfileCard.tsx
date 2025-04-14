
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/contexts/AuthContext';

interface ProfileCardProps {
  profile: Profile | null;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>About Me</CardTitle>
        <CardDescription>Your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{profile?.full_name}</h3>
            <p className="text-muted-foreground mt-1">
              {profile?.bio || 'No bio added yet'}
            </p>
          </div>

          {profile?.portfolio && (
            <div>
              <h4 className="font-medium">Portfolio</h4>
              <a 
                href={profile.portfolio} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {profile.portfolio}
              </a>
            </div>
          )}

          {profile?.skills && profile.skills.length > 0 && (
            <div>
              <h4 className="font-medium">Skills</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile?.hobbies && profile.hobbies.length > 0 && (
            <div>
              <h4 className="font-medium">Hobbies</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.hobbies.map((hobby, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded-full text-sm"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
