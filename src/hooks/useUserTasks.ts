
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  task_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  is_completed: boolean;
  created_at: string;
  project: {
    title: string;
  };
}

export function useUserTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userTasks', user?.id],
    queryFn: async (): Promise<Task[]> => {
      console.log('useUserTasks - Fetching tasks for user:', user?.id);
      
      if (!user) {
        console.log('useUserTasks - No user found, returning empty array');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            task_id,
            title,
            description,
            deadline,
            is_completed,
            created_at,
            project:projects!project_id(title)
          `)
          .eq('created_by', user.id)
          .order('deadline', { ascending: true })
          .limit(10);

        if (error) {
          console.error('useUserTasks - Error fetching tasks:', error);
          throw error;
        }
        
        console.log('useUserTasks - Fetched tasks:', data);
        console.log('useUserTasks - Total tasks found:', data?.length || 0);
        console.log('useUserTasks - Incomplete tasks:', data?.filter(t => !t.is_completed).length || 0);
        
        return data || [];
      } catch (error) {
        console.error('useUserTasks - Exception:', error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
}
