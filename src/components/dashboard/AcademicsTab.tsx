
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Award, BookOpen } from 'lucide-react';

const AcademicsTab = () => {
  const { user } = useAuth();

  const { data: grades } = useQuery({
    queryKey: ['grades', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_grades')
        .select('*')
        .order('year', { ascending: false });
      return data;
    },
  });

  const { data: tests } = useQuery({
    queryKey: ['standardizedTests', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_standardized_tests')
        .select('*')
        .order('year', { ascending: false });
      return data;
    },
  });

  const { data: awards } = useQuery({
    queryKey: ['awards', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_awards')
        .select('*')
        .order('year', { ascending: false });
      return data;
    },
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-collabCorner-purple text-white rounded-full">
              <GraduationCap className="h-6 w-6" />
            </div>
            <CardTitle>Academic Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grades */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-collabCorner-purple/10 rounded-full">
                <BookOpen className="h-5 w-5 text-collabCorner-purple" />
              </div>
              <h3 className="font-medium">Grades</h3>
            </div>
            {grades && grades.length > 0 ? (
              <div className="space-y-3">
                {grades.map((grade) => (
                  <div key={grade.id} className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <span className="font-medium">{grade.grade}</span>
                      <span className="text-sm text-gray-600">{grade.year}</span>
                    </div>
                    {grade.gpa_marks && (
                      <div className="text-sm text-gray-600">GPA/Marks: {grade.gpa_marks}</div>
                    )}
                    {grade.notes && (
                      <div className="text-sm text-gray-500 mt-1">{grade.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No grades added yet</p>
            )}
          </div>
          
          {/* Standardized Testing */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-collabCorner-purple/10 rounded-full">
                <BookOpen className="h-5 w-5 text-collabCorner-purple" />
              </div>
              <h3 className="font-medium">Standardized Testing</h3>
            </div>
            {tests && tests.length > 0 ? (
              <div className="space-y-3">
                {tests.map((test) => (
                  <div key={test.id} className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <span className="font-medium">{test.test_name}</span>
                      <span className="text-sm text-gray-600">{test.year}</span>
                    </div>
                    {test.test_score && (
                      <div className="text-sm text-gray-600">Score: {test.test_score}</div>
                    )}
                    {test.notes && (
                      <div className="text-sm text-gray-500 mt-1">{test.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No test information added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Awards Card */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-collabCorner-purple text-white rounded-full">
              <Award className="h-6 w-6" />
            </div>
            <CardTitle>Awards & Achievements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {awards && awards.length > 0 ? (
              awards.map((award) => (
                <div key={award.id} className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-collabCorner-purple">{award.title}</h4>
                      {award.organization && (
                        <p className="text-sm text-gray-600">{award.organization}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{award.year}</span>
                  </div>
                  {award.description && (
                    <p className="text-sm text-gray-500 mt-2">{award.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No awards added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicsTab;
