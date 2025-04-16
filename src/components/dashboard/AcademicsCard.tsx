
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Award, BookOpen, Pencil, Trash2, X, Check } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface EditableItem {
  id: string;
  type: 'grade' | 'test' | 'award';
  data: any;
}

const AcademicsCard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);

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

  const handleEdit = (item: EditableItem) => {
    setEditingItem(item);
  };

  const handleCancel = () => {
    setEditingItem(null);
  };

  const handleDelete = async (type: string, id: string) => {
    try {
      let table = '';
      switch (type) {
        case 'grade':
          table = 'user_grades';
          break;
        case 'test':
          table = 'user_standardized_tests';
          break;
        case 'award':
          table = 'user_awards';
          break;
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Item deleted successfully');
      queryClient.invalidateQueries({ queryKey: [type + 's', user?.id] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      let table = '';
      switch (editingItem.type) {
        case 'grade':
          table = 'user_grades';
          break;
        case 'test':
          table = 'user_standardized_tests';
          break;
        case 'award':
          table = 'user_awards';
          break;
      }

      const { error } = await supabase
        .from(table)
        .update(editingItem.data)
        .eq('id', editingItem.data.id);

      if (error) throw error;

      toast.success('Changes saved successfully');
      queryClient.invalidateQueries({ queryKey: [editingItem.type + 's', user?.id] });
      setEditingItem(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save changes');
    }
  };

  const renderEditableGrade = (grade: any) => {
    const isEditing = editingItem?.id === grade.id;
    
    if (isEditing) {
      return (
        <div className="space-y-2">
          <Input
            value={editingItem.data.grade}
            onChange={(e) => setEditingItem({
              ...editingItem,
              data: { ...editingItem.data, grade: e.target.value }
            })}
            placeholder="Grade"
          />
          <Input
            value={editingItem.data.gpa_marks}
            onChange={(e) => setEditingItem({
              ...editingItem,
              data: { ...editingItem.data, gpa_marks: e.target.value }
            })}
            placeholder="GPA/Marks"
          />
          <Input
            value={editingItem.data.year}
            onChange={(e) => setEditingItem({
              ...editingItem,
              data: { ...editingItem.data, year: e.target.value }
            })}
            placeholder="Year"
          />
          <Textarea
            value={editingItem.data.notes}
            onChange={(e) => setEditingItem({
              ...editingItem,
              data: { ...editingItem.data, notes: e.target.value }
            })}
            placeholder="Notes"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div key={grade.id} className="border-b pb-2 border-soft-purple/20">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex justify-between">
              <span className="font-medium text-blue-800">{grade.grade}</span>
              <span className="text-sm text-gray-600">{grade.year}</span>
            </div>
            {grade.gpa_marks && (
              <div className="text-sm text-gray-600">GPA/Marks: {grade.gpa_marks}</div>
            )}
            {grade.notes && (
              <div className="text-sm text-gray-500 mt-1 bg-soft-purple/10 p-2 rounded">{grade.notes}</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleEdit({ id: grade.id, type: 'grade', data: grade })}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDelete('grade', grade.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditableTest = (test: any) => {
    const isEditing = editingItem?.id === test.id;
    
    if (isEditing) {
      return (
        <div className="space-y-2">
          <Input
            value={editingItem.data.test_name}
            onChange={(e) => setEditingItem({
              ...editingItem,
              data: { ...editingItem.data, test_name: e.target.value }
            })}
            placeholder="Test Name"
          />
          <Input
            value={editingItem.data.test_score}
            onChange={(e) => setEditingItem({
              ...editingItem,
              data: { ...editingItem.data, test_score: e.target.value }
            })}
            placeholder="Test Score"
          />
          <Input
            value={editingItem.data.year}
            onChange={(e) => setEditingItem({
              ...editingItem,
              data: { ...editingItem.data, year: e.target.value }
            })}
            placeholder="Year"
          />
          <Textarea
            value={editingItem.data.notes}
            onChange={(e) => setEditingItem({
              ...editingItem,
              data: { ...editingItem.data, notes: e.target.value }
            })}
            placeholder="Notes"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div key={test.id} className="border-b pb-2 border-soft-purple/20">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex justify-between">
              <span className="font-medium text-blue-800">{test.test_name}</span>
              <span className="text-sm text-gray-600">{test.year}</span>
            </div>
            {test.test_score && (
              <div className="text-sm text-gray-600">Score: {test.test_score}</div>
            )}
            {test.notes && (
              <div className="text-sm text-gray-500 mt-1 bg-soft-purple/10 p-2 rounded">{test.notes}</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleEdit({ id: test.id, type: 'test', data: test })}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDelete('test', test.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditableAward = (award: any) => {
    const isEditing = editingItem?.id === award.id;
    
    if (isEditing) {
      return (
        <div className="space-y-2">
          <Input
            value={editingItem.data.title}
            onChange={(e) => setEditingItem({
              ...editingItem,
              data: { ...editingItem.data, title: e.target.value }
            })}
            placeholder="Title"
          />
          <Input
            value={editingItem.data.organization}
            onChange={(e) => setEditingItem({
              ...editingItem,
              data: { ...editingItem.data, organization: e.target.value }
            })}
            placeholder="Organization"
          />
          <Input
            value={editingItem.data.year}
            onChange={(e) => setEditingItem({
              ...editingItem,
              data: { ...editingItem.data, year: e.target.value }
            })}
            placeholder="Year"
          />
          <Textarea
            value={editingItem.data.description}
            onChange={(e) => setEditingItem({
              ...editingItem,
              data: { ...editingItem.data, description: e.target.value }
            })}
            placeholder="Description"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div key={award.id} className="border-b pb-2 border-soft-purple/20">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex justify-between">
              <span className="font-medium text-blue-800">{award.title}</span>
              <span className="text-sm text-gray-600">{award.year}</span>
            </div>
            {award.organization && (
              <div className="text-sm text-gray-600">{award.organization}</div>
            )}
            {award.description && (
              <div className="text-sm text-gray-500 mt-1 bg-soft-purple/10 p-2 rounded">{award.description}</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleEdit({ id: award.id, type: 'award', data: award })}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDelete('award', award.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="col-span-1 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-soft-purple/20 border-soft-purple/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 text-purple-800 rounded-full shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-collabCorner-purple">Academic Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grades Section */}
        <div className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-soft-purple/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-medium text-blue-800">Grades</h3>
          </div>
          {grades && grades.length > 0 ? (
            <div className="space-y-3">
              {grades.map((grade) => renderEditableGrade(grade))}
            </div>
          ) : (
            <p className="text-muted-foreground">No grades added yet</p>
          )}
        </div>

        {/* Standardized Tests Section */}
        <div className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-soft-purple/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-500/10 rounded-full">
              <BookOpen className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="font-medium text-blue-800">Standardized Tests</h3>
          </div>
          {tests && tests.length > 0 ? (
            <div className="space-y-3">
              {tests.map((test) => renderEditableTest(test))}
            </div>
          ) : (
            <p className="text-muted-foreground">No test scores added yet</p>
          )}
        </div>

        {/* Awards Section */}
        <div className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-soft-purple/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/10 rounded-full">
              <Award className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-medium text-blue-800">Awards & Achievements</h3>
          </div>
          {awards && awards.length > 0 ? (
            <div className="space-y-3">
              {awards.map((award) => renderEditableAward(award))}
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
