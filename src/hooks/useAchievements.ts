
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: async (): Promise<Achievement[]> => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['userAchievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const unlockAchievement = async (achievementId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId
        });

      if (error) throw error;

      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        toast.success(`Achievement Unlocked: ${achievement.name}!`);
      }

      queryClient.invalidateQueries({ queryKey: ['userAchievements', user.id] });
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  return {
    achievements,
    userAchievements,
    unlockAchievement
  };
};
