
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  task_id: string;
  title: string;
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
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          task_id,
          title,
          deadline,
          is_completed,
          created_at,
          project:projects(title)
        `)
        .eq('created_by', user.id)
        .eq('is_completed', false)
        .order('deadline', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
