
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
  is_public: boolean;
  showcase_description?: string;
  tags: string[];
  cover_image_url?: string;
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'contributor' | 'viewer';
  invited_by: string;
  joined_at: string;
  created_at: string;
}

export interface ProjectReaction {
  id: string;
  project_id: string;
  user_id: string;
  reaction_type: 'like' | 'bookmark' | 'star';
  created_at: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectView {
  id: string;
  project_id: string;
  viewer_id?: string;
  viewer_ip?: string;
  viewed_at: string;
  user_agent?: string;
}

export interface CollaborationRequest {
  id: string;
  project_id: string;
  requested_by: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  responded_by?: string;
  responded_at?: string;
  created_at: string;
}
