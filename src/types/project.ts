
export interface Project {
  project_id: string;
  title: string;
  description?: string;
  deadline?: string;
  created_at: string;
  created_by: string;
  priority: 'low' | 'medium' | 'high';
  status: 'on_track' | 'at_risk' | 'delayed';
  total_tasks: number;
  completed_tasks: number;
}
