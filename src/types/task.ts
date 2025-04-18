
export interface Task {
  task_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  notes: string | null;
  is_completed: boolean;
  project_id?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string | null;
}
