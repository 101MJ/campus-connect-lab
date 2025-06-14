
-- Add new columns to existing projects table
ALTER TABLE public.projects 
ADD COLUMN is_public BOOLEAN DEFAULT false,
ADD COLUMN showcase_description TEXT,
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN cover_image_url TEXT;

-- Create project_media table for file storage metadata
CREATE TABLE public.project_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_collaborators table for team management
CREATE TABLE public.project_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('owner', 'admin', 'contributor', 'viewer')),
  invited_by UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create project_reactions table for likes/bookmarks
CREATE TABLE public.project_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'bookmark', 'star')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id, reaction_type)
);

-- Create project_comments table for feedback system
CREATE TABLE public.project_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_views table for analytics
CREATE TABLE public.project_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
  viewer_id UUID,
  viewer_ip INET,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT
);

-- Create collaboration_requests table for join requests
CREATE TABLE public.collaboration_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  responded_by UUID,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, requested_by)
);

-- Create storage buckets for project media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('project-images', 'project-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('project-documents', 'project-documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']),
  ('project-videos', 'project-videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime']);

-- Enable RLS on all new tables
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_media
CREATE POLICY "Users can view media for public projects or projects they collaborate on" 
  ON public.project_media FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = project_media.project_id 
      AND (p.is_public = true OR p.created_by = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.project_collaborators pc 
      WHERE pc.project_id = project_media.project_id 
      AND pc.user_id = auth.uid()
    )
  );

CREATE POLICY "Project collaborators can upload media" 
  ON public.project_media FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = project_media.project_id 
      AND p.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.project_collaborators pc 
      WHERE pc.project_id = project_media.project_id 
      AND pc.user_id = auth.uid() 
      AND pc.role IN ('owner', 'admin', 'contributor')
    )
  );

CREATE POLICY "Project collaborators can delete their uploaded media" 
  ON public.project_media FOR DELETE 
  USING (uploaded_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = project_media.project_id 
      AND p.created_by = auth.uid()
    )
  );

-- RLS Policies for project_collaborators
CREATE POLICY "Anyone can view collaborators of public projects" 
  ON public.project_collaborators FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = project_collaborators.project_id 
      AND (p.is_public = true OR p.created_by = auth.uid())
    ) OR
    user_id = auth.uid()
  );

CREATE POLICY "Project owners can manage collaborators" 
  ON public.project_collaborators FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = project_collaborators.project_id 
      AND p.created_by = auth.uid()
    )
  );

-- RLS Policies for project_reactions
CREATE POLICY "Anyone can view reactions on public projects" 
  ON public.project_reactions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = project_reactions.project_id 
      AND p.is_public = true
    ) OR
    user_id = auth.uid()
  );

CREATE POLICY "Authenticated users can react to public projects" 
  ON public.project_reactions FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = project_reactions.project_id 
      AND p.is_public = true
    )
  );

CREATE POLICY "Users can delete their own reactions" 
  ON public.project_reactions FOR DELETE 
  USING (user_id = auth.uid());

-- RLS Policies for project_comments
CREATE POLICY "Anyone can view comments on public projects" 
  ON public.project_comments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = project_comments.project_id 
      AND p.is_public = true
    )
  );

CREATE POLICY "Authenticated users can comment on public projects" 
  ON public.project_comments FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = project_comments.project_id 
      AND p.is_public = true
    )
  );

CREATE POLICY "Users can update their own comments" 
  ON public.project_comments FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments or project owners can delete any comments" 
  ON public.project_comments FOR DELETE 
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = project_comments.project_id 
      AND p.created_by = auth.uid()
    )
  );

-- RLS Policies for project_views
CREATE POLICY "Anyone can insert view records for public projects" 
  ON public.project_views FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = project_views.project_id 
      AND p.is_public = true
    )
  );

CREATE POLICY "Project owners can view analytics" 
  ON public.project_views FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = project_views.project_id 
      AND p.created_by = auth.uid()
    )
  );

-- RLS Policies for collaboration_requests
CREATE POLICY "Users can view requests for their projects or their own requests" 
  ON public.collaboration_requests FOR SELECT 
  USING (
    requested_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = collaboration_requests.project_id 
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can request collaboration on public projects" 
  ON public.collaboration_requests FOR INSERT 
  WITH CHECK (
    auth.uid() = requested_by AND
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = collaboration_requests.project_id 
      AND p.is_public = true 
      AND p.created_by != auth.uid()
    )
  );

CREATE POLICY "Project owners can update collaboration requests" 
  ON public.collaboration_requests FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.project_id = collaboration_requests.project_id 
      AND p.created_by = auth.uid()
    )
  );

-- Storage policies for project-images bucket
CREATE POLICY "Anyone can view public project images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload project images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own project images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'project-images' AND owner = auth.uid());

CREATE POLICY "Users can delete their own project images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'project-images' AND owner = auth.uid());

-- Storage policies for project-documents bucket
CREATE POLICY "Project collaborators can view documents" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'project-documents' AND owner = auth.uid());

CREATE POLICY "Authenticated users can upload project documents" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'project-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own project documents" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'project-documents' AND owner = auth.uid());

CREATE POLICY "Users can delete their own project documents" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'project-documents' AND owner = auth.uid());

-- Storage policies for project-videos bucket
CREATE POLICY "Anyone can view public project videos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'project-videos');

CREATE POLICY "Authenticated users can upload project videos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'project-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own project videos" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'project-videos' AND owner = auth.uid());

CREATE POLICY "Users can delete their own project videos" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'project-videos' AND owner = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_project_media_project_id ON public.project_media(project_id);
CREATE INDEX idx_project_collaborators_project_id ON public.project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user_id ON public.project_collaborators(user_id);
CREATE INDEX idx_project_reactions_project_id ON public.project_reactions(project_id);
CREATE INDEX idx_project_comments_project_id ON public.project_comments(project_id);
CREATE INDEX idx_project_views_project_id ON public.project_views(project_id);
CREATE INDEX idx_collaboration_requests_project_id ON public.collaboration_requests(project_id);
CREATE INDEX idx_projects_is_public ON public.projects(is_public) WHERE is_public = true;
CREATE INDEX idx_projects_tags ON public.projects USING gin(tags);
