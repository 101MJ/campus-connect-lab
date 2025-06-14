
import React, { useState } from 'react';
import { Plus, Upload, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import MediaUploadZone from './MediaUploadZone';
import MediaGallery from './MediaGallery';
import { useProjectMedia } from '@/hooks/useProjectMedia';

interface MediaManagerProps {
  projectId: string;
  canUpload?: boolean;
  canDelete?: boolean;
}

const MediaManager: React.FC<MediaManagerProps> = ({ 
  projectId, 
  canUpload = true, 
  canDelete = false 
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { media, isLoading } = useProjectMedia(projectId);

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
  };

  const mediaByType = {
    image: media.filter(m => m.file_type === 'image'),
    document: media.filter(m => m.file_type === 'document'),
    video: media.filter(m => m.file_type === 'video'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Media</h2>
          <p className="text-sm text-gray-600 mt-1">
            {media.length} files • {(media.reduce((acc, m) => acc + m.file_size, 0) / (1024 * 1024)).toFixed(2)} MB total
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Upload Button */}
          {canUpload && (
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Project Media
                  </DialogTitle>
                </DialogHeader>
                
                <MediaUploadZone
                  projectId={projectId}
                  onUploadSuccess={handleUploadSuccess}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({media.length})
          </TabsTrigger>
          <TabsTrigger value="images">
            Images ({mediaByType.image.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({mediaByType.document.length})
          </TabsTrigger>
          <TabsTrigger value="videos">
            Videos ({mediaByType.video.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <MediaGallery projectId={projectId} canDelete={canDelete} />
        </TabsContent>

        <TabsContent value="images">
          <MediaGallery projectId={projectId} canDelete={canDelete} />
        </TabsContent>

        <TabsContent value="documents">
          <MediaGallery projectId={projectId} canDelete={canDelete} />
        </TabsContent>

        <TabsContent value="videos">
          <MediaGallery projectId={projectId} canDelete={canDelete} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaManager;
