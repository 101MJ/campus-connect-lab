
import React, { useState } from 'react';
import { Eye, Download, Trash2, Image, FileText, Video, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProjectMedia } from '@/hooks/useProjectMedia';
import { ProjectMedia } from '@/types/project';
import MediaPreview from './MediaPreview';

interface MediaGalleryProps {
  projectId: string;
  canDelete?: boolean;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ projectId, canDelete = false }) => {
  const { media, isLoading, deleteFile, getFileUrl } = useProjectMedia(projectId);
  const [selectedMedia, setSelectedMedia] = useState<ProjectMedia | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredMedia = media.filter(item => 
    filterType === 'all' || item.file_type === filterType
  );

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const handleDelete = async (mediaItem: ProjectMedia) => {
    if (!canDelete) return;
    
    const bucketName = `project-${mediaItem.file_type}s`;
    await deleteFile(mediaItem.id, mediaItem.file_path, bucketName);
  };

  const handleDownload = (mediaItem: ProjectMedia) => {
    const url = getFileUrl(mediaItem.file_path, mediaItem.file_type as 'image' | 'document' | 'video');
    const link = document.createElement('a');
    link.href = url;
    link.download = mediaItem.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {['all', 'image', 'document', 'video'].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(type)}
              className="capitalize"
            >
              {type === 'all' ? 'All Files' : `${type}s`}
            </Button>
          ))}
        </div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <Image className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No media files</h3>
            <p className="text-gray-500">
              {filterType === 'all' 
                ? 'Upload some files to get started' 
                : `No ${filterType} files found`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedia.map((mediaItem) => (
              <Card key={mediaItem.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-3">
                  {/* Preview */}
                  <div className="relative mb-3 cursor-pointer" onClick={() => setSelectedMedia(mediaItem)}>
                    {mediaItem.file_type === 'image' ? (
                      <img
                        src={getFileUrl(mediaItem.file_path, 'image')}
                        alt={mediaItem.file_name}
                        className="w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                        {getFileIcon(mediaItem.file_type)}
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate" title={mediaItem.file_name}>
                      {mediaItem.file_name}
                    </h4>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{(mediaItem.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                      <Badge variant="secondary" className="text-xs">
                        {mediaItem.file_type}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMedia(mediaItem)}
                        className="h-8 px-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(mediaItem)}
                        className="h-8 px-2"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(mediaItem)}
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMedia && getFileIcon(selectedMedia.file_type)}
              {selectedMedia?.file_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMedia && (
            <MediaPreview
              mediaItem={selectedMedia}
              getFileUrl={getFileUrl}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaGallery;
