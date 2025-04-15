
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/contexts/AuthContext';
import { User, Globe, Briefcase, Heart } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile | null;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <Card className="md:col-span-2 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-soft-purple/20 border-soft-purple/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-collabCorner-purple/90 text-white rounded-full shadow-md">
            <User className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-collabCorner-purple">About Me</CardTitle>
            <CardDescription>Your profile information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-collabCorner-purple">{profile?.full_name}</h3>
            <p className="text-muted-foreground mt-2 bg-soft-purple/10 p-3 rounded-lg">
              {profile?.bio || 'No bio added yet'}
            </p>
          </div>

          {profile?.portfolio && (
            <div className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-soft-purple/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-collabCorner-purple/10 rounded-full">
                  <Globe className="h-5 w-5 text-collabCorner-purple" />
                </div>
                <div>
                  <h4 className="font-medium text-collabCorner-purple">Portfolio</h4>
                  <a 
                    href={profile.portfolio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-collabCorner-purple hover:text-collabCorner-purple/80 transition-colors"
                  >
                    {profile.portfolio}
                  </a>
                </div>
              </div>
            </div>
          )}

          {profile?.skills && profile.skills.length > 0 && (
            <div className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-soft-purple/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-collabCorner-purple/10 rounded-full">
                  <Briefcase className="h-5 w-5 text-collabCorner-purple" />
                </div>
                <h4 className="font-medium text-collabCorner-purple">Skills</h4>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="bg-collabCorner-purple/10 text-collabCorner-purple px-3 py-1 rounded-full text-sm hover:bg-collabCorner-purple/20 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile?.hobbies && profile.hobbies.length > 0 && (
            <div className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-soft-purple/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-collabCorner-purple/10 rounded-full">
                  <Heart className="h-5 w-5 text-collabCorner-purple" />
                </div>
                <h4 className="font-medium text-collabCorner-purple">Hobbies</h4>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.hobbies.map((hobby, index) => (
                  <span 
                    key={index}
                    className="bg-collabCorner-purple/10 text-collabCorner-purple px-3 py-1 rounded-full text-sm hover:bg-collabCorner-purple/20 transition-colors"
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
