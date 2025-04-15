
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Award, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AcademicsCard = () => {
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
    <Card className="col-span-1 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-collabCorner-purple text-white rounded-full">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle>Academic Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grades Section */}
        <div className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-collabCorner-purple/10 rounded-full">
              <BookOpen className="h-5 w-5 text-collabCorner-purple" />
            </div>
            <h3 className="font-medium">Grades</h3>
          </div>
          {grades && grades.length > 0 ? (
            <div className="space-y-3">
              {grades.map((grade) => (
                <div key={grade.id} className="border-b pb-2">
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

        {/* Standardized Tests Section */}
        <div className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-collabCorner-purple/10 rounded-full">
              <BookOpen className="h-5 w-5 text-collabCorner-purple" />
            </div>
            <h3 className="font-medium">Standardized Tests</h3>
          </div>
          {tests && tests.length > 0 ? (
            <div className="space-y-3">
              {tests.map((test) => (
                <div key={test.id} className="border-b pb-2">
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
            <p className="text-muted-foreground">No test scores added yet</p>
          )}
        </div>

        {/* Awards Section */}
        <div className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-collabCorner-purple/10 rounded-full">
              <Award className="h-5 w-5 text-collabCorner-purple" />
            </div>
            <h3 className="font-medium">Awards & Achievements</h3>
          </div>
          {awards && awards.length > 0 ? (
            <div className="space-y-3">
              {awards.map((award) => (
                <div key={award.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{award.title}</span>
                    <span className="text-sm text-gray-600">{award.year}</span>
                  </div>
                  {award.organization && (
                    <div className="text-sm text-gray-600">{award.organization}</div>
                  )}
                  {award.description && (
                    <div className="text-sm text-gray-500 mt-1">{award.description}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No awards added yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademicsCard;
