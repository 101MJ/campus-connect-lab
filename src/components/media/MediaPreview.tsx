
import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectMedia } from '@/types/project';

interface MediaPreviewProps {
  mediaItem: ProjectMedia;
  getFileUrl: (filePath: string, fileType: 'image' | 'document' | 'video') => string;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ mediaItem, getFileUrl }) => {
  const fileUrl = getFileUrl(mediaItem.file_path, mediaItem.file_type as 'image' | 'document' | 'video');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = mediaItem.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  const renderPreview = () => {
    switch (mediaItem.file_type) {
      case 'image':
        return (
          <div className="max-h-[60vh] overflow-hidden flex items-center justify-center bg-gray-50 rounded">
            <img
              src={fileUrl}
              alt={mediaItem.file_name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        );

      case 'video':
        return (
          <div className="max-h-[60vh] bg-black rounded overflow-hidden">
            <video
              controls
              className="w-full h-full"
              style={{ maxHeight: '60vh' }}
            >
              <source src={fileUrl} type={mediaItem.mime_type} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'document':
        if (mediaItem.mime_type === 'application/pdf') {
          return (
            <div className="h-[60vh] w-full">
              <iframe
                src={`${fileUrl}#toolbar=0`}
                className="w-full h-full border rounded"
                title={mediaItem.file_name}
              />
            </div>
          );
        } else {
          return (
            <div className="h-[60vh] bg-gray-50 rounded flex items-center justify-center flex-col">
              <div className="text-center space-y-4">
                <div className="text-6xl text-gray-400">📄</div>
                <p className="text-lg font-medium text-gray-900">Document Preview</p>
                <p className="text-gray-600">
                  Preview not available for this file type
                </p>
                <Button onClick={handleDownload} className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download to View
                </Button>
              </div>
            </div>
          );
        }

      default:
        return (
          <div className="h-[60vh] bg-gray-50 rounded flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl text-gray-400">📁</div>
              <p className="text-lg font-medium text-gray-900">File Preview</p>
              <p className="text-gray-600">Preview not available</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* File Info */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded">
        <div className="space-y-1">
          <h3 className="font-medium text-gray-900">{mediaItem.file_name}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>{(mediaItem.file_size / (1024 * 1024)).toFixed(2)} MB</span>
            <Badge variant="secondary">{mediaItem.file_type}</Badge>
            <span>
              Uploaded {new Date(mediaItem.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      {renderPreview()}
    </div>
  );
};

export default MediaPreview;
